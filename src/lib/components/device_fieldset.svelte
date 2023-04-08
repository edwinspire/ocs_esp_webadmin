<script>
	import InputComp from '$lib/components/input.svelte';
	import { GetDeviceID } from '$lib/class/utils.js';
	import { onMount } from 'svelte/internal';
	import { SessionDB, createParamEndPoint } from '$lib/class/utils.js';
	//import { createParamEndPoint } from '$lib/class/utils.js';

	const ldb_user = new SessionDB('data_user');

	let realDeviceId = '';
	export let name = '';
	export let ChipModel = '';
	export let EfuseMac = '';
	export let deviceId = '';
	export let wsHost = '';
	export let showdeviceIdEncrypted = true;
	export let name_disabled = false;
	export let wsHost_disabled = true;
	export let showWSHost = false;
	//let host = 'localhost';

	let data_endpoint = {};

	export const getInfo = async () => {
		try {
			ldb_user.read();
			//ldb_user.data.host = host;
			let response = await fetch(data_endpoint.endpoint, {
				method: 'GET', // or 'PUT'
				mode: 'cors',
				//body: JSON.stringify({ u: user, p: pwd }), // data can be `string` or {object}!
				headers: data_endpoint.headers
			});
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
			ldb_user.read();

			let response = await fetch(data_endpoint.endpoint, {
				method: 'POST',
				headers: data_endpoint.headers,
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
			ldb_user.read();

			data_endpoint = createParamEndPoint('/device/info');
			await getInfo();
		} catch (error) {
			console.log(error);
		}
	});
</script>

<fieldset>
	<legend>Device</legend>

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
