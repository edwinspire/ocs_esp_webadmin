<script>
	import { onMount } from 'svelte/internal';
	import Menu from '$lib/components/menu.svelte';
	import DeviceField from '$lib/components/device_fieldset.svelte';
	import OutputsFieldset from '$lib/components/outputs_fieldset.svelte';
	import InputsFieldset from '$lib/components/inputs_fieldset.svelte';

	let OutputsFieldsetFun;
	let InputsFieldsetFun;

	onMount(async () => {});
</script>

<Menu />

<DeviceField showdeviceIdEncrypted={false} />

<InputsFieldset bind:this={InputsFieldsetFun} />

<OutputsFieldset bind:this={OutputsFieldsetFun} />

<style>
</style>
