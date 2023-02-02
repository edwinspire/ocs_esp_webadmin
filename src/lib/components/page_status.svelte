<script>
	import DeviceField from '$lib/components/device_fieldset.svelte';
	import OutputsFieldset from '$lib/components/outputs_fieldset.svelte';
	import InputsFieldset from '$lib/components/inputs_fieldset.svelte';
	import Menu from '$lib/components/menu.svelte';
	import { createEventDispatcher } from 'svelte';
	import { dispatch_events } from '$lib/class/utils.js';

	const dispatch = createEventDispatcher();

	// @ts-ignore
	let OutputsFieldsetFun;
	// @ts-ignore
	let InputsFieldsetFun;

	
</script>

<Menu
	isLogin={false}
	show_download={false}
	show_get={true}
	show_reboot={true}
	show_save={false}
	on:event={(e) => {
		if (e.detail.name == 'action') {
			switch (e.detail.value) {
				case 'get':
					//console.log(InputsFieldsetFun, OutputsFieldsetFun);
					InputsFieldsetFun.getInfo();
					OutputsFieldsetFun.getInfo();
					break;
				case 'save':
					InputsFieldsetFun.save();
					OutputsFieldsetFun.save();

					break;
			}
		} else {
			dispatch_events(dispatch, e.detail.name, e.detail.value);
		}
	}}
/>

<DeviceField showdeviceIdEncrypted={false} />
<InputsFieldset bind:this={InputsFieldsetFun} />
<OutputsFieldset bind:this={OutputsFieldsetFun} />
