<script>
	import { onDestroy } from 'svelte';
	import OutputStatus from '$lib/components/output_status.svelte';
	import EnabledComponent from '$lib/components/enable_button.svelte';
	import InputComp from '$lib/components/input.svelte';
	import { onMount } from 'svelte/internal';

	/**
	 * @type {any[]}
	 */
	export let outputs = [];
	export let led = -1;
	let led_status = 'led_inactived';

	export const getInfo = async () => {
		try {
			let response = await fetch('/device/outputs');
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
			let response = await fetch('/device/outputs', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
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

	/**
	 * @type {any}
	 */
	let interval_status;

	async function getStatus() {
		try {
			let response = await fetch('/device/outputs/status');
			let data = await response.json();

			console.log('geOutputsStatus : ', data);

			if (data && data.o && Array.isArray(data.o)) {
				if (data.led) {
					led_status = 'led_actived';
				} else {
					led_status = 'led_inactived';
				}

				data.o.forEach((/** @type {{ gpio: any; status: any; }} */ item) => {
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
		} catch (error) {
			console.trace(error);
		}
	}

	onMount(async () => {
		try {
			await getInfo();
		} catch (error) {
			console.log(error);
		}

		interval_status = setInterval(async () => {
			try {
				await getStatus();
			} catch (error) {
				console.log(error);
			}
		}, 1500);
	});

	onDestroy(() => {
		clearInterval(interval_status);
		//alert('Destruido out');
	});
</script>

<fieldset class="fset">
	<legend class="legent">Outputs</legend>

	<div class={led_status}>
		<InputComp type="number" label="GPIO Led Status" bind:value={led} />
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
			<div><InputComp type="text" maxlength="15" bind:value={name} /></div>
			<div><InputComp type="number" bind:value={gpio} /></div>
			<div><OutputStatus bind:value={status} /></div>
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
