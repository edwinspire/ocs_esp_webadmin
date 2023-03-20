<script>
	import { createEventDispatcher } from 'svelte';
	import { dispatch_events } from '$lib/class/utils.js';

	export let show_download = false;
	export let show_reboot = false;
	export let show_get = false;
	export let show_save = false;
	let rebooting = false;
	//	export let isLogin = false;

	const dispatch = createEventDispatcher();

	let MenuOpen = false;

	function ToggleClassMenu() {
		console.log('Toogle');
		MenuOpen = !MenuOpen;
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
</script>

<!-- svelte-ignore a11y-no-redundant-roles -->
<nav class="navbar is-dark" role="navigation" aria-label="main navigation">
	<div class="navbar-brand">
		<span class="navbar-item title_menu"><strong class="has-text-white">Open Community Safety</strong></span>
		<!-- svelte-ignore a11y-missing-attribute -->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<a class:is-active={MenuOpen} class="navbar-burger" on:click={ToggleClassMenu}>
			<span />
			<span />
			<span />
		</a>
	</div>

	<div class="navbar-menu" class:is-active={MenuOpen}>
		<div class="navbar-start">
			<!-- svelte-ignore a11y-invalid-attribute -->
			<a
				class="navbar-item"
				href="#"
				on:click={() => {
					dispatch_events(dispatch, 'page', 'status');
				}}
			>
				Status
			</a>
			<!-- svelte-ignore a11y-invalid-attribute -->
			<a
				class="navbar-item"
				href="#"
				on:click={() => {
					dispatch_events(dispatch, 'page', 'setup');
				}}
			>
				Setup
			</a>
			<!-- svelte-ignore a11y-invalid-attribute -->
			<a
				class="navbar-item"
				href="#"
				on:click={() => {
					dispatch_events(dispatch, 'page', 'cert');
				}}
			>
				Certificate
			</a>
		</div>

		<div class="navbar-end">
			<div class="navbar-item">
				<div class="field is-grouped">
					{#if show_get}
						<!-- svelte-ignore a11y-invalid-attribute -->

						<p class="control">
							<a
								class="bd-tw-button button is-small"
								href="#"
								on:click={() => {
									dispatch_events(dispatch, 'action', 'get');
								}}
							>
								<span> Get </span>
							</a>
						</p>
					{/if}

					{#if show_save}
						<!-- svelte-ignore a11y-invalid-attribute -->

						<p class="control">
							<a
								class="button is-primary is-small"
								href="#"
								on:click={() => {
									dispatch_events(dispatch, 'action', 'save');
								}}
							>
								<span>Save</span>
							</a>
						</p>
					{/if}

					{#if show_download}
						<p class="control">
							<!-- svelte-ignore a11y-invalid-attribute -->
							<a
								class="button is-primary is-small"
								href="#"
								on:click={async (event) => {
									dispatch_events(dispatch, 'action', 'download');
								}}
							>
								<span>Download</span>
							</a>
						</p>
					{/if}
				</div>
			</div>

			<div class="navbar-item">
				<div class="field is-grouped">
					{#if show_reboot}
						{#if rebooting}
							<!-- svelte-ignore a11y-invalid-attribute -->
							<p class="control">
								<a class="button is-primary is-small" href="#">
									<span>Rebooting</span>
								</a>
							</p>
						{:else}
							<!-- svelte-ignore a11y-invalid-attribute -->
							<p class="control">
								<a class="button is-primary is-small" href="#" on:click={click_reboot}>
									<span>Reboot</span>
								</a>
							</p>
						{/if}
					{/if}

					<p class="control">
						<!-- svelte-ignore a11y-invalid-attribute -->
						<a
							class="button is-primary is-small"
							href="#"
							on:click={async (event) => {
								dispatch_events(dispatch, 'page', 'login');
							}}
						>
							<span>Exit</span>
						</a>
					</p>
				</div>
			</div>
		</div>
	</div>
</nav>
