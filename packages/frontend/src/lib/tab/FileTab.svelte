<script lang="ts">
import IconTab from '/@/lib/tab/IconTab.svelte';
import type { FileReference } from '/@shared/src/models/base-quadlet';
import { faPaperclip } from '@fortawesome/free-solid-svg-icons/faPaperclip';
import { router } from 'tinro';

interface Props {
  file: FileReference;
  providerId: string;
  id: string;
  connection: string;
}
let { file, providerId, id, connection }: Props = $props();

const url = $derived(`/quadlets/${providerId}/${connection}/${id}/file/${encodeURIComponent(file.path)}`);
</script>

<IconTab
  title={file.name}
  {url}
  icon={faPaperclip}
  selected={$router.path === url} />
