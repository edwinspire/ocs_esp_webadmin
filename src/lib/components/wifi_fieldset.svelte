<script>
	import InputComp from '$lib/components/input.svelte';
	import { onMount } from 'svelte/internal';

	import { createParamEndPoint } from '$lib/class/utils.js';

	let param_endpoint = {};
	/**
	 * @type {any[]}
	 */
	export let wf = [];

	export const getInfo = async () => {
		try {
			let response = await fetch(param_endpoint.endpoint, { headers: param_endpoint.headers });
			let data = await response.json();

			if (response.status == 200 && data && Array.isArray(data)) {
				wf = data;
			}
		} catch (error) {
			console.trace(error);
		}
	};

	export const save = async () => {
		try {
			let response = await fetch(param_endpoint.endpoint, {
				method: 'POST',
				headers: param_endpoint.headers,
				body: JSON.stringify(wf)
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
		}
	};

	onMount(async () => {
		try {
			param_endpoint = createParamEndPoint('/device/wifi');
			await getInfo();
		} catch (error) {
			console.log(error);
		}
	});
</script>

<fieldset class="fset">
	<legend class="legent">WIFI</legend>

	<div class="grid-container-wifi">
		<div>
			<label for="fname">SSID Name</label>
		</div>
		<div><label for="fname">Password</label></div>

		{#each wf as { ssid, pwd }, i}
			<div>
				<InputComp type="text" maxlength="15" disabled={i == 0} bind:value={ssid} />
			</div>
			<div><InputComp type="password" disabled={i == 0} bind:value={pwd} /></div>
		{/each}
	</div>
</fieldset>

<style>
	.grid-container-wifi {
		display: grid;
		grid-template-columns: auto auto;
		gap: 2px;
	}
</style>
