<script>
	import { onDestroy } from 'svelte';
	import InputContactType from '$lib/components/input_contact_type.svelte';
	import InputSirenType from '$lib/components/input_siren_type.svelte';
	import InputType from '$lib/components/input_type.svelte';
	import EnabledComponent from '$lib/components/enable_button.svelte';
	import InputComp from '$lib/components/input.svelte';
	import InputStatus from '$lib/components/input_status.svelte';
	import { onMount } from 'svelte/internal';

	/**
	 * @type {any[]}
	 */
	export let inputs = [];

	export const getInfo = async () => {
		try {
			let response = await fetch('/device/inputs');
			let data = await response.json();

			if (response.status == 200 && data) {
				inputs = data;
			}
		} catch (error) {
			console.trace(error);
		}
	};

	export const save = async () => {
		try {
			let response = await fetch('/device/inputs', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ i: inputs })
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
			let response = await fetch('/device/inputs/status');
			let data = await response.json();

			console.log('getInputStatus : ', data);

			if (data && Array.isArray(data)) {
				data.forEach((item) => {
					inputs = inputs.map((m) => {
						let m1 = { ...m };
						if (item.gpio == m.gpio) {
							m1.value = item.value;
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
	});
</script>

<fieldset class="fset">
	<legend class="legent">Inputs</legend>

	<div class="grid-container-inputs">
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<div><label>Enabled</label></div>
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<div><label>Label</label></div>
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<div><label>GPIO</label></div>
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<div><label>Input Type</label></div>
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<div><label>Contact Type</label></div>
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<div><label>Siren Type</label></div>
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<div><label>Status</label></div>

		{#each inputs as { enabled, name, gpio, type, contact_type, siren_type, value, status }}
			<div>
				<EnabledComponent bind:enabled />
			</div>
			<div><InputComp type="text" bind:value={name} /></div>
			<div><InputComp type="number" bind:value={gpio} /></div>

			<div>
				<InputType bind:type />
			</div>
			<div>
				<InputContactType bind:contact_type />
			</div>
			<div>
				<InputSirenType bind:siren_type />
			</div>
			<div>
				<InputStatus bind:value bind:status />
			</div>
		{/each}
	</div>
</fieldset>

<style>
	.grid-container-inputs {
		display: grid;
		grid-template-columns: auto auto auto auto auto auto auto;
		gap: 2px;
	}
</style>
