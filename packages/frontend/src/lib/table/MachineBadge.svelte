<script lang="ts">
import type { ProviderContainerConnectionIdentifierInfo } from '/@shared/src/models/provider-container-connection-identifier-info';

interface Props {
  object: ProviderContainerConnectionIdentifierInfo;
}

let { object }: Props = $props();
</script>

<div aria-label="connection info circle" class="w-2 h-2 rounded-full"></div>
