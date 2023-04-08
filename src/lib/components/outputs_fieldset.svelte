<script>
	import { onDestroy } from 'svelte';
	import OutputStatus from '$lib/components/output_status.svelte';
	import EnabledComponent from '$lib/components/enable_button.svelte';
	import InputComp from '$lib/components/input.svelte';
	import { onMount } from 'svelte/internal';
	import { status_outputs } from '$lib/stores/status.js';
	//	import { SessionDB, createURL } from '$lib/class/utils.js';
	import { createParamEndPoint } from '$lib/class/utils.js';

	/**
	 * @type {any[]}
	 */
	export let outputs = [];
	export let led = -1;
	let led_status = 'led_inactived';
	export let disabled = true;

	let data_endpoint = {};

	export const getInfo = async () => {
		try {
			let response = await fetch(data_endpoint.endpoint, {headers: data_endpoint.headers});
			let data = await response.json();

			if (response.status == 200 && data) {
				if (data && data.o && Array.isArray(data.o)) {
					outputs = data.o;
				}
				if (data.led) {
					led = data.led;
				}
			}
		} catch (error) {
			console.trace(error);
		}
	};

	export const save = async () => {
		try {
			let response = await fetch(data_endpoint.endpoint, {
				method: 'POST',
				headers: data_endpoint.headers,
				body: JSON.stringify({ o: outputs, led: led })
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

	status_outputs.subscribe((data) => {
		//countValue = value;
		console.log('Ha cambiado ', data);

		// @ts-ignore
		if (data && data.o && Array.isArray(data.o)) {
			// @ts-ignore
			if (data.led) {
				led_status = 'led_actived';
			} else {
				led_status = 'led_inactived';
			}

			// @ts-ignore
			data.o.forEach((item) => {
				// @ts-ignore
				outputs = outputs.map((m) => {
					// @ts-ignore
					let m1 = { ...m };
					// @ts-ignore
					if (item.gpio == m.gpio) {
						m1.status = item.status;
					}
					return m1;
				});
			});
		}
	});

	onMount(async () => {
		try {
			data_endpoint = createParamEndPoint('/device/outputs');
			await getInfo();
		} catch (error) {
			console.log(error);
		}
	});

	onDestroy(() => {
		//		clearInterval(interval_status);
		//alert('Destruido out');
	});
</script>

<fieldset >
	<legend >Outputs</legend>

	<div class={led_status}>
		<InputComp type="number" {disabled} label="GPIO Led Status" bind:value={led} />
	</div>

	<div class="grid-container-outputs">
		<div>
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label>Enabled</label>
		</div>
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<div><label>Label</label></div>
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<div><label>GPIO</label></div>
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<div><label>Status</label></div>

		{#each outputs as { enabled, name, gpio, status }}
			<div>
				<EnabledComponent bind:enabled />
			</div>
			<div><InputComp type="text" maxlength="15" bind:value={name} {disabled} /></div>
			<div><InputComp type="number" bind:value={gpio} {disabled} /></div>
			<div><OutputStatus bind:value={status} {disabled} /></div>
		{/each}
	</div>
</fieldset>

<style>
	.grid-container-outputs {
		display: grid;
		grid-template-columns: auto auto auto auto;
		gap: 2px;
	}
	.led_inactived {
		width: 25%;
	}
	.led_actived {
		width: 25%;
		background-color: red;
	}
</style>
