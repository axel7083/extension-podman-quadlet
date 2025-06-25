<script lang="ts">
import { faCalendar } from '@fortawesome/free-solid-svg-icons/faCalendar';
import Fa from 'svelte-fa';
import SveltyPicker from 'svelty-picker';

interface Props {
  placeholder: string;
  disabled?: boolean;
  value: string | undefined;
  onchange(value: string | undefined): void;
}

let { placeholder, disabled, value, onchange }: Props = $props();

function onDateChange(nValue: string | Array<string> | undefined): void {
  if(Array.isArray(nValue)) return;
  onchange(nValue);
}
</script>

<style>
    :global(.my-input) {
        min-height: 28px;
        border-radius: 4px;
        padding-left: 4px;
    }
</style>

<SveltyPicker value={value} onDateChange={(e) => onDateChange(e.value ?? undefined)} format="yyyy-mm-dd hh:ii" mode="datetime" disabled={disabled} placeholder={placeholder} inputClasses="my-input border">
  <div class="absolute top-2 right-2">
    <Fa class="calendar-icon" icon={faCalendar}/>
  </div>
</SveltyPicker>
