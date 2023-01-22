<script>
	import { createEventDispatcher } from 'svelte';
	export let show_download = false;
	export let show_reboot = false;
	export let show_get = false;
	export let show_save = false;
	let rebooting = false;

	const dispatch = createEventDispatcher();

	function click_download() {
		dispatch_events('download');
	}

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

	function click_get() {
		dispatch_events('get');
	}

	function click_save() {
		dispatch_events('save');
	}

	/**
	 * @param {string} event
	 */
	function dispatch_events(event) {
		dispatch('event', {
			name: event
		});
	}
</script>

<div class="topnav">
	<div class="tit">OPEN COMMUNITY SAFETY</div>
	<!-- svelte-ignore a11y-invalid-attribute -->
	<a href="/">Status</a>
	<!-- svelte-ignore a11y-invalid-attribute -->
	<a href="/setup">Setup</a>
	<!-- svelte-ignore a11y-invalid-attribute -->
	<a href="/ssl_cert">Certificate</a>

	{#if show_download}
		<!-- svelte-ignore a11y-invalid-attribute -->
		<a href="#" style="float:right" on:click={click_download}>Download</a>
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
		<a href="#" style="float:right" on:click={click_save}>Save</a>
	{/if}

	{#if show_get}
		<!-- svelte-ignore a11y-invalid-attribute -->
		<a href="#" style="float:right" on:click={click_get}>Get</a>
	{/if}
</div>

<style>
	.tit {
		color: ghostwhite;
		text-align: -webkit-center;
		padding: 5px;
		font-size: large;
		font-weight: bold;
	}

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
