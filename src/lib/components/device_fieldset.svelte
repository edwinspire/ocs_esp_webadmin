<script>
	import InputComp from '$lib/components/input.svelte';
	import { GetDeviceID } from '$lib/class/utils.js';
	import { onMount } from 'svelte/internal';

	let realDeviceId = '';
	export let name = '';
	export let ChipModel = '';
	export let EfuseMac = '';
	export let deviceId = '';
	export let wsHost = '';
	export let showdeviceIdEncrypted = true;
	export let name_disabled = true;
	export let wsHost_disabled = true;
	export let showWSHost = false;

	export const getInfo = async () => {
		try {
			let response = await fetch('/device/info');
			let data = await response.json();

			if (response.status == 200 && data) {
				name = data.name || '';
				ChipModel = data.ChipModel || '';
				EfuseMac = data.EfuseMac || '';
				deviceId = data.deviceId || '';
				wsHost = data.wsHost || '';
			}
		} catch (error) {
			console.trace(error);
		}
	};

	export const save = async () => {
		try {
			let response = await fetch('/device/info', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ name: name, deviceId: deviceId, wsHost: wsHost })
			});
			let data = await response.json();
			//	console.log(data);
			if (response.status == 200 && data) {
				return true;
			} else {
				return false;
			}
		} catch (error) {
			console.log(error);
			return false;
		}
	};

	onMount(async () => {
		try {
			await getInfo();
		} catch (error) {
			console.log(error);
		}
	});
</script>

<fieldset class="fset">
	<legend class="legent">Device</legend>

	<div class="columns is-multiline is-mobile">
		<div class="column is-half">
			<InputComp label="Chip Model" disabled={true} bind:value={ChipModel} />
		</div>
		<div class="column is-half">
			<InputComp label="MAC" disabled={true} bind:value={EfuseMac} />
		</div>
		<div class="column is-full">
			<InputComp label="Name" maxlength="30" disabled={name_disabled} bind:value={name} />
		</div>
		{#if showdeviceIdEncrypted}
			<div class="column is-full">
				<InputComp
					label="Encrypted Device ID"
					maxlength="200"
					bind:value={deviceId}
					on:change={() => {
						realDeviceId = GetDeviceID(deviceId);
					}}
				/>
			</div>
		{/if}

		<div class="column is-full">
			<InputComp label="Device ID" maxlength="200" disabled={true} value={GetDeviceID(deviceId)} />
		</div>

		{#if showWSHost}
			<div class="column is-full">
				<InputComp
					label="Websocket Host"
					maxlength="100"
					disabled={wsHost_disabled}
					bind:value={wsHost}
				/>
			</div>
		{/if}
	</div>
</fieldset>
