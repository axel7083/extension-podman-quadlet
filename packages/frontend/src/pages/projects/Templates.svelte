<script lang="ts">
import { FormPage } from '@podman-desktop/ui-svelte';
import TemplateGrid from '/@/lib/templates/TemplateGrid.svelte';
import type { Template } from '/@shared/src/models/template';
import { router } from 'tinro';
import { projectAPI } from '/@/api/client';

async function onImportTemplate(template: Template): Promise<void> {
  const { id } = await projectAPI.create({
    templateId: template.id,
  });
  router.goto(`/projects/editor/${id}?draft=true`);
}

function close(): void {
  router.goto('/');
}
</script>

<FormPage
  title="Quadlet Templates"
  onclose={close}
  breadcrumbLeftPart="Quadlets"
  breadcrumbRightPart="Templates"
  breadcrumbTitle="Go back to quadlets page"
  onbreadcrumbClick={close}>
  <svelte:fragment slot="content">
    <div class="mx-5">
      <TemplateGrid onImport={onImportTemplate.bind(undefined)}/>
    </div>
  </svelte:fragment>
</FormPage>
