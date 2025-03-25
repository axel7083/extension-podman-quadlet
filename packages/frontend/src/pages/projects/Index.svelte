<script lang="ts">
import Route from '/@/lib/Route.svelte';
import Templates from '/@/pages/projects/Templates.svelte';
import Editor from '/@/pages/projects/Editor.svelte';
</script>

<Route path="/templates" breadcrumb="Projects">
  <Templates/>
</Route>

<Route path="/editor/:projectId/*" breadcrumb="Projects" let:meta>
  <Editor projectId={meta.params.projectId} />
</Route>
