<script>
	import { onDestroy } from 'svelte';
	import InputContactType from '$lib/components/input_contact_type.svelte';
	import InputSirenType from '$lib/components/input_siren_type.svelte';
	import InputType from '$lib/components/input_type.svelte';
	import EnabledComponent from '$lib/components/enable_button.svelte';
	import InputComp from '$lib/components/input.svelte';
	import InputStatus from '$lib/components/input_status.svelte';
	import { onMount } from 'svelte/internal';
	import { status_inputs } from '$lib/stores/status.js';
	import { createParamEndPoint } from '$lib/class/utils.js';

	/**
	 * @type {any[]}
	 */
	export let inputs = [];

	let data_endpoint = {};

	export const getInfo = async () => {
		try {
			// @ts-ignore
			let response = await fetch(data_endpoint.endpoint, {headers: data_endpoint.headers});
			let data = await response.json();

			if (response.status == 200 && data && Array.isArray(data)) {
				inputs = data;
			}
		} catch (error) {
			console.trace(error);
		}
	};

	export const save = async () => {
		try {
			// @ts-ignore
			let response = await fetch(data_endpoint.endpoint, {
				method: 'POST',
				// @ts-ignore
				headers: data_endpoint.headers,
				body: JSON.stringify(inputs)
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

	status_inputs.subscribe((data) => {
		//countValue = value;
		console.log('Ha cambiado ', data);

		if (data && Array.isArray(data)) {
			data.forEach((item) => {
				inputs = inputs.map((m) => {
					let m1 = { ...m };
					// @ts-ignore
					if (item.gpio == m.gpio) {
						// @ts-ignore
						m1.value = item.value;
						// @ts-ignore
						m1.status = item.status;
					}
					return m1;
				});
			});
		}
	});

	onMount(async () => {
		try {
			data_endpoint = createParamEndPoint('/device/inputs');

			await getInfo();
		} catch (error) {
			console.log(error);
		}
	});

	onDestroy(() => {
		//clearInterval(interval_status);
		//	alert('Destruido input');
	});
</script>

<fieldset>
	<legend>Inputs</legend>

	<div>
		
	<div class="columns is-multiline is-mobile ">
		{#each inputs as { enabled, name, gpio, type, contact_type, siren_type, value, status }}
			<div class="column is-half-mobile is-one-third-tablet is-one-fifth-desktop is-one-fifth-widescreen">
				<EnabledComponent bind:enabled />
				<InputComp type="text" label="Label" bind:value={name} />
				<InputComp type="number" bind:value={gpio} />
				<InputType bind:type />
				<InputContactType bind:contact_type />
				<InputSirenType bind:siren_type />
				<InputStatus bind:value bind:status />
			</div>
		{/each}
	</div>
	</div>

</fieldset>
