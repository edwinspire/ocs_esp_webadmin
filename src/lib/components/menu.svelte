<script>
	import { createEventDispatcher } from 'svelte';
	import { dispatch_events } from '$lib/class/utils.js';

	export let show_download = false;
	export let show_reboot = false;
	export let show_get = false;
	export let show_save = false;
	let rebooting = false;
	export let isLogin = false;

	const dispatch = createEventDispatcher();

	async function click_reboot() {
		if (confirm('Desea reiniciar la placa?')) {
			try {
				await fetch('/device/reboot', {
					method: 'GET'
				});
				rebooting = true;
				setTimeout(async () => {
					rebooting = false;
					//				await getSettings();
				}, 10000);
			} catch (error) {
				console.log(error);
			}
		}
	}
</script>

<div class="topnav">
	{#if isLogin}
		<!-- svelte-ignore a11y-invalid-attribute -->
		<a
			href="#"
			style="float:right"
			on:click={() => {
				dispatch_events(dispatch, 'page', 'status');
			}}>Login</a
		>
	{:else}
		<!-- svelte-ignore a11y-invalid-attribute -->
		<a
			href="#"
			on:click={() => {
				dispatch_events(dispatch, 'page', 'status');
			}}>Status</a
		>
		<!-- svelte-ignore a11y-invalid-attribute -->
		<a
			href="#"
			on:click={() => {
				dispatch_events(dispatch, 'page', 'setup');
			}}>Setup</a
		>
		<!-- svelte-ignore a11y-invalid-attribute -->
		<a
			href="#"
			on:click={() => {
				dispatch_events(dispatch, 'page', 'cert');
			}}>Certificate</a
		>

		<!-- svelte-ignore a11y-invalid-attribute -->
		<a
			href="#"
			style="float:right"
			on:click={() => {
				dispatch_events(dispatch, 'page', 'login');
			}}>Exit</a
		>

		{#if show_download}
			<!-- svelte-ignore a11y-invalid-attribute -->
			<a
				href="#"
				style="float:right"
				on:click={async (event) => {
					dispatch_events(dispatch, 'action', 'download');
				}}>Download</a
			>
		{/if}

		{#if show_reboot}
			{#if rebooting}
				<!-- svelte-ignore a11y-invalid-attribute -->
				<a href="#" style="float:right">Rebooting...</a>
			{:else}
				<!-- svelte-ignore a11y-invalid-attribute -->
				<a href="#" style="float:right" on:click={click_reboot}>Reboot</a>
			{/if}
		{/if}

		{#if show_save}
			<!-- svelte-ignore a11y-invalid-attribute -->
			<a
				href="#"
				style="float:right"
				on:click={() => {
					dispatch_events(dispatch, 'action', 'save');
				}}>Save</a
			>
		{/if}

		{#if show_get}
			<!-- svelte-ignore a11y-invalid-attribute -->
			<a
				href="#"
				style="float:right"
				on:click={() => {
					dispatch_events(dispatch, 'action', 'get');
				}}>Get</a
			>
		{/if}
	{/if}
</div>

<style>
	/* Style the top navigation bar */
	.topnav {
		overflow: hidden;
		background-color: #333;
	}

	/* Style the topnav links */
	.topnav a {
		float: left;
		display: block;
		color: #dbdbde;
		text-align: center;
		padding: 14px 16px;
		text-decoration: none;
	}

	/* Change color on hover */
	.topnav a:hover {
		background-color: rgb(101, 101, 101);
		color: black;
	}

	/* On screens that are 600px wide or less, make the menu links stack on top of each other instead of next to each other */
	@media screen and (max-width: 600px) {
		.topnav a {
			float: none;
			width: 100%;
		}
	}
</style>
