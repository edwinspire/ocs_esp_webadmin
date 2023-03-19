<script>
	import DeviceField from '$lib/components/device_fieldset.svelte';
	import OutputsFieldset from '$lib/components/outputs_fieldset.svelte';
	import InputsFieldset from '$lib/components/inputs_fieldset.svelte';
	import Menu from '$lib/components/menu.svelte';
	import { createEventDispatcher } from 'svelte';
	import { dispatch_events } from '$lib/class/utils.js';

	const dispatch = createEventDispatcher();

	// @ts-ignore
	/**
	 * @type {OutputsFieldset}
	 */
	let OutputsFieldsetFun;
	// @ts-ignore
	/**
	 * @type {InputsFieldset}
	 */
	let InputsFieldsetFun;
	// @ts-ignore
	/**
	 * @type {DeviceField}
	 */
	let DeviceFieldFun;
</script>

<Menu
	
	show_download={false}
	show_get={true}
	show_reboot={true}
	show_save={false}
	on:event={async (e) => {
		if (e.detail.name == 'action') {
			switch (e.detail.value) {
				case 'get':
					//console.log(InputsFieldsetFun, OutputsFieldsetFun);
					await DeviceFieldFun.getInfo();
					await InputsFieldsetFun.getInfo();
					await OutputsFieldsetFun.getInfo();
					break;
			}
		} else {
			dispatch_events(dispatch, e.detail.name, e.detail.value);
		}
	}}
/>

<svelte:head>
	<title>Status</title>
	<meta name="description" content="Status" />
</svelte:head>

<DeviceField bind:this={DeviceFieldFun} showdeviceIdEncrypted={false} />
<InputsFieldset bind:this={InputsFieldsetFun} />
<OutputsFieldset bind:this={OutputsFieldsetFun} />
