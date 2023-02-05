<script>
	// @ts-nocheck
	import DeviceField from '$lib/components/device_fieldset.svelte';
	import Geolocationfield from '$lib/components/geolocation_fieldset.svelte';
	import WifiField from '$lib/components/wifi_fieldset.svelte';
	import InputsFieldset from '$lib/components/inputs_fieldset.svelte';
	import OutputsFieldset from '$lib/components/outputs_fieldset.svelte';
	import Menu from '$lib/components/menu.svelte';
	import { createEventDispatcher } from 'svelte';
	import { dispatch_events } from '$lib/class/utils.js';

	const dispatch = createEventDispatcher();

	var rebooting = false;
	let DeviceFieldFun;
	let GeolocationfieldFun;
	let WifiFieldFun;
	let InputsFieldsetFun;
	let OutputsFieldsetFun;
	let deviceSettings = { info: {}, o: [], i: [], wf: [], geo: {} };
	/**
	 * @param {Blob} file
	 */
	function readFile(file) {
		// Check if the file is an image.
		console.log(file);
		if (file.type && !file.type.startsWith('application/json')) {
			console.log('File is not json.', file.type, file);
			return;
		}

		const reader = new FileReader();

		reader.addEventListener('load', (event) => {
			//img.src = event.target.result;
			console.log(event.target);

			try {
				// @ts-ignore
				//setValues(JSON.parse(event.target.result));
				deviceSettings = JSON.parse(event.target.result);
			} catch (error) {
				// @ts-ignore
				alert(error.message);
			}
		});
		reader.readAsText(file);
	}

	export const download = () => {
		let name_file =
			// @ts-ignore

			deviceSettings.info.ChipModel +
			(deviceSettings.info.name || deviceSettings.info.deviceId || 'unknow') +
			new Date().toDateString();
		let url = window.URL.createObjectURL(
			new Blob([JSON.stringify(deviceSettings, null, 2)], {
				type: 'application/json'
			})
		);
		var a = document.createElement('a');
		a.href = url;
		a.download = name_file + '.json';
		document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
		a.click();
		a.remove(); //afterwards we remove the element again
	};

	export const save = () => {
		if (confirm('Save?')) {
			const promise1 = DeviceFieldFun.save();
			const promise2 = GeolocationfieldFun.save();
			const promise3 = WifiFieldFun.save();
			const promise4 = InputsFieldsetFun.save();
			const primise5 = OutputsFieldsetFun.save();
			const promises = [promise1, promise2, promise3, promise4, primise5];

			Promise.allSettled(promises).then((results) => {
				if (
					results.some((item) => {
						return item.value == true;
					})
				) {
					alert('Guardado');
				} else {
					alert('No se pudo guardar');
				}
			});
		}
	};

	export const getInfo = () => {
		DeviceFieldFun.getInfo();
		GeolocationfieldFun.getInfo();
		WifiFieldFun.getInfo();
		InputsFieldsetFun.getInfo();
		OutputsFieldsetFun.getInfo();
	};
</script>

<Menu
	isLogin={false}
	show_download={true}
	show_get={true}
	show_reboot={true}
	show_save={true}
	on:event={(e) => {
		if (e.detail.name == 'action') {
			switch (e.detail.value) {
				case 'get':
					//console.log(InputsFieldsetFun, OutputsFieldsetFun);
					getInfo();
					break;
				case 'save':
					save();
					break;
				case 'download':
					download();
					break;
			}
		} else {
			dispatch_events(dispatch, e.detail.name, e.detail.value);
		}
	}}
/>

<div class="bg">
	<DeviceField
		bind:name={deviceSettings.info.name}
		bind:ChipModel={deviceSettings.info.ChipModel}
		bind:EfuseMac={deviceSettings.info.EfuseMac}
		bind:deviceId={deviceSettings.info.deviceId}
		bind:wsHost={deviceSettings.info.wsHost}
		bind:this={DeviceFieldFun}
	/>
	<Geolocationfield
		bind:this={GeolocationfieldFun}
		bind:latitude={deviceSettings.geo.latitude}
		bind:longitude={deviceSettings.geo.longitude}
		bind:acbgl={deviceSettings.geo.acbgl}
	/>
	<WifiField bind:this={WifiFieldFun} bind:wf={deviceSettings.wf} />
	<InputsFieldset bind:this={InputsFieldsetFun} bind:inputs={deviceSettings.i} />
	<OutputsFieldset bind:this={OutputsFieldsetFun} bind:outputs={deviceSettings.o} />

	<fieldset class="fset">
		<legend class="legent">Cargar archivo de configuración</legend>
		<div class="button">
			<input
				class=""
				type="file"
				accept=".json"
				placeholder="Cargar Configuración"
				on:change={(event) => {
					// @ts-ignore
					const fileList = event.target.files;
					console.log(fileList);

					readFile(fileList[0]);
				}}
			/>
		</div>
		<button class="button button1" on:click={save} disabled={rebooting}>Save</button>
	</fieldset>
</div>

<style>
	.button {
		border: none;
		color: white;
		padding: 16px 32px;
		text-align: center;
		text-decoration: none;
		display: inline-block;
		font-size: 16px;
		margin: 4px 2px;
		transition-duration: 0.4s;
		cursor: pointer;
	}

	.button1 {
		background-color: white;
		color: black;
		border: 2px solid #2b349f;
	}

	.button1:hover {
		background-color: #2b349f;
		color: white;
	}
</style>
