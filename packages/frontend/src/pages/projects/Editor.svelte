<script lang="ts">
import type * as Monaco from 'monaco-editor';
import { onMount, onDestroy } from 'svelte';
import { Button, DetailsPage } from '@podman-desktop/ui-svelte';
import { router } from 'tinro';
import { dialogAPI, projectAPI } from '/@/api/client';
import type { Project } from '/@shared/src/models/project';
import MultiMonacoEditor from '/@/lib/monaco-editor/MultiMonacoEditor.svelte';
import Route from '/@/lib/Route.svelte';
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus';
import { MonacoManager } from '/@/lib/monaco-editor/monaco';
import { faPen } from '@fortawesome/free-solid-svg-icons/faPen';
import { faTruckPickup } from '@fortawesome/free-solid-svg-icons/faTruckPickup';
import ListItemButtonIcon from '/@/lib/buttons/ListItemButtonIcon.svelte';
import Fa from 'svelte-fa';
import EditableTab from '/@/lib/pagination/EditableTab.svelte';
import { faSave } from '@fortawesome/free-solid-svg-icons/faSave';
import ContainerProviderConnectionSelect from '/@/lib/select/ContainerProviderConnectionSelect.svelte';
import type {
  ProviderContainerConnectionDetailedInfo,
} from '/@shared/src/models/provider-container-connection-detailed-info';
import { providerConnectionsInfo } from '/@store/connections';

interface Props {
  projectId: string;
}

let { projectId }: Props = $props();

let containerProviderConnection: ProviderContainerConnectionDetailedInfo | undefined = $state(undefined);
let project: Project | undefined = $state();
let loading: boolean = $state(false);

let models: Array<Monaco.editor.ITextModel> = $state([]);

function navigateToModel(model: Monaco.editor.ITextModel): void {
  router.goto(`/projects/editor/${projectId}/${model.id}`);
}

onMount(async () => {
  project = await projectAPI.read(projectId);

  // init models
  const monaco = await MonacoManager.getMonaco();
  models = project.files.map((file) => monaco.editor.createModel(file.content, file.language, monaco.Uri.file(file.name)));

  if(models.length === 0) {
    console.warn(`no models has been created for project ${project.name} - ${project.id}`);
    return;
  }

  // redirect to first tab
  navigateToModel(models[0]);
});

onDestroy(async () => {
  disposeModels();
});

function disposeModels(): void {
  models.forEach(model => model.dispose());
}

function close(): void {
  router.goto('/');
}

/**
 * Using Uri#path get the root (E.g. /hello.container) this utility function remove the prefix /
 * @param uri
 */
function formatModelName(uri: Monaco.Uri): string {
  const path = uri.path;
  if(path.startsWith('/')) return path.substring(1);
  return path;
}

async function onNewFileRequest(): Promise<void> {
  const result = await dialogAPI.showInputBox({
    title: 'New File',
  });
  if(!result) return;

  // Try to get the extension to determine the language to use
  let language: string | undefined = undefined;

  // Split with latest apparition of .
  const separator = result.lastIndexOf('.');
  if(separator !== -1) {
    const extension = result.substring(separator);
    console.log(`new file extension is ${extension}`);
    switch (extension) {
      case '.container':
        language = 'ini';
        break;
      default:
        break;
    }
  }

  const monaco = await MonacoManager.getMonaco();
  const nModel = monaco.editor.createModel('', language, monaco.Uri.file(result));
  models.push(nModel);

  // Open the new model tab
  navigateToModel(nModel);

  // save it
  await updateProject();
}

async function loadIntoMachine(): Promise<void> {
  if(!containerProviderConnection || !project) return;

  try {
    loading = true;
    await updateProject();
    await projectAPI.loadIntoMachine({
      projectId: project.id,
      provider: $state.snapshot(containerProviderConnection),
    });
    // redirect to home
    router.goto('/');
  } finally {
    loading = false;
  }
}

async function onFileDelete(model: Monaco.editor.ITextModel): Promise<void> {
  // ask user confirmation
  const result = await dialogAPI.showWarningMessage(
    `Are you sure you want to delete ${formatModelName(model.uri)}?`,
    'Cancel',
    'Confirm'
  );

  if(result !== 'Confirm') return;

  // remove old models from models array
  models = models.filter(({ id }) => model.id !== id);
  model.dispose();

  await updateProject();
}

async function onFileRename(model: Monaco.editor.ITextModel): Promise<void> {
  const filename = formatModelName(model.uri);
  const result = await dialogAPI.showInputBox({
    title: `Rename ${filename}`,
    value: filename,
  });
  if(!result || filename === result) return;

  const monaco = await MonacoManager.getMonaco();

  // remove old models from models array
  models = models.filter(({ id }) => model.id !== id);
  // create new models
  const newModel = monaco.editor.createModel(model.getValue(), model.getLanguageId(), monaco.Uri.file(result));
  models.push(newModel);
  // dispose old model
  model.dispose();

  // save the project
  await updateProject();
  // navigate to newly renamed (avoid all kind of issue)
  navigateToModel(newModel);
}

async function updateProject(): Promise<void> {
  if(!project) return;

  // update the project
  await projectAPI.update({
    ...project,
    files: models.map((model) => ({
      language: model.getLanguageId(),
      content: model.getValue(),
      name: formatModelName(model.uri),
    })),
  }).catch(console.error);
}
</script>

<DetailsPage
  title="Editor - {projectId}"
  onclose={close}
  breadcrumbLeftPart="Quadlets"
  breadcrumbRightPart="Editor"
  breadcrumbTitle="Go back to quadlets page"
  onbreadcrumbClick={close}>
  <svelte:fragment slot="icon">
    <Fa icon={faPen} />
  </svelte:fragment>
  <svelte:fragment slot="actions">
    <ListItemButtonIcon icon={faSave} onClick={updateProject} title="Save" />

    <div class="w-[250px]">
      <ContainerProviderConnectionSelect
        bind:value={containerProviderConnection}
        containerProviderConnections={$providerConnectionsInfo} />
    </div>
    <Button inProgress={loading} disabled={loading || !containerProviderConnection} icon={faTruckPickup} on:click={loadIntoMachine}>
      Load into machine
    </Button>
  </svelte:fragment>
  <svelte:fragment slot="tabs">
    {#each models as model (model.id)}
      <EditableTab
        title={formatModelName(model.uri)}
        url="/projects/editor/{projectId}/{model.id}"
        selected={$router.path === `/projects/editor/${projectId}/${model.id}`}
        onDelete={onFileDelete.bind(undefined, model)}
        onEdit={onFileRename.bind(undefined, model)}
      />
    {/each}

    <!-- adding new file -->
    <Button on:click={onNewFileRequest} title="New file" icon={faPlus} />
  </svelte:fragment>
  <svelte:fragment slot="content">

    <!-- editor -->
    <Route path="/:modelId" let:meta>
      <!-- prevent trying to render the monaco editor BEFORE we have models -->
      {#if models.length > 0}
        <MultiMonacoEditor models={models} modelId={meta.params.modelId} class="h-full" noMinimap />
      {/if}
    </Route>

  </svelte:fragment>
</DetailsPage>
