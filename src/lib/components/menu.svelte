<script>
	import { onMount } from 'svelte/internal';
	import { createEventDispatcher } from 'svelte';
	import { dispatch_events, createParamEndPoint, SessionDB } from '$lib/class/utils.js';

	const ldb_user = new SessionDB('data_user');

	export let show_download = false;
	export let show_reboot = false;
	export let show_get = false;
	export let show_save = false;
	let rebooting = false;
	//	export let isLogin = false;
	let param_endpoint_reboot = {};
	let param_endpoint_pwd = {};
	let change_password = false;
	let new_password = '';
	let new_password_2 = '';
	let old_password = '';
	const dispatch = createEventDispatcher();

	let MenuOpen = false;

	function ToggleClassMenu() {
		console.log('Toogle');
		MenuOpen = !MenuOpen;
	}

	async function click_reboot() {
		if (confirm('Reboot the device?')) {
			try {
				await fetch(param_endpoint_reboot.endpoint, {
					headers: param_endpoint_reboot.headers,
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

	async function ChangePassword() {
		if (ldb_user.data.user_type || ldb_user.data.user_type === 0) {
			if (confirm('Are you sure to change your password?')) {
				if (new_password == new_password_2) {
					if (checkPassword()) {
						try {
							let test = await fetch(param_endpoint_pwd.endpoint, {
								method: 'POST', // or 'PUT'
								mode: 'cors',
								body: JSON.stringify({
									u: ldb_user.data.user_type,
									p: old_password,
									np: new_password
								}), // data can be `string` or {object}!
								headers: param_endpoint_pwd.headers
							});

							if (test.status == 200) {
								let respuesta = await test.json();
								console.log(respuesta);

								if (respuesta.change == 1) {
									alert('Ok');
									dispatch_events(dispatch, 'page', 'login');
								} else {
									alert('Fail');
								}
							} else if (test.status == 403) {
								alert('Unauthorized request');
							}
							change_password = false;
						} catch (error) {
							console.error(error);
						}
					} else {
						alert(
							'The password must have between 6 and 15 characters, at least one capital letter and one number'
						);
					}
				} else {
					alert('Passwords must be the same');
				}
			}
		} else {
			alert('Failed to get user information, please exit and re-enter the system');
		}
	}

	function checkPassword() {
		const regexMayuscula = /[A-Z]/;
		const regexNumero = /[0-9]/;

		if (new_password.length < 6 || new_password.length > 15) {
			return false;
		}

		if (!regexMayuscula.test(new_password) || !regexNumero.test(new_password)) {
			return false;
		}
		return true;
	}

	onMount(async () => {
		try {
			ldb_user.read();
			param_endpoint_reboot = createParamEndPoint('/device/reboot');
			param_endpoint_pwd = createParamEndPoint('/device/pwd/change');
		} catch (error) {
			console.log(error);
		}
	});
</script>

<!-- svelte-ignore a11y-no-redundant-roles -->
<nav class="navbar is-dark" role="navigation" aria-label="main navigation">
	<div class="navbar-brand">
		<span class="navbar-item title_menu"
			><strong class="has-text-white">Open Community Safety</strong></span
		>
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

			<!-- svelte-ignore a11y-invalid-attribute -->
			<a
				class="navbar-item"
				href="#"
				on:click={() => {
					//dispatch_events(dispatch, 'page', 'pwd');
					change_password = true;
				}}
			>
				Password
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

<div class={change_password ? 'modal is-active' : 'modal'}>
	<div class="modal-background" />
	<div class="modal-card">
		<header class="modal-card-head">
			<p class="modal-card-title">Change Password</p>
			<button class="delete" aria-label="close" />
		</header>
		<section class="modal-card-body">
			<div class="field">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">Current Password</label>
				<div class="control">
					<input
						class="input"
						type="password"
						placeholder="Current Password"
						required
						bind:value={old_password}
					/>
				</div>
			</div>

			<div class="field">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">New Password</label>
				<div class="control">
					<input
						class="input"
						type="password"
						placeholder="New Password"
						required
						bind:value={new_password}
					/>
				</div>
			</div>

			<div class="field">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">Rewrite New Password</label>
				<div class="control">
					<input
						class="input"
						type="password"
						placeholder="New Password"
						required
						bind:value={new_password_2}
					/>
				</div>
			</div>
		</section>
		<footer class="modal-card-foot">
			<button class="button is-success" on:click={ChangePassword}>Aceptar</button>
			<button
				class="button"
				on:click={() => {
					change_password = false;
				}}>Cancelar</button
			>
		</footer>
	</div>
</div>
