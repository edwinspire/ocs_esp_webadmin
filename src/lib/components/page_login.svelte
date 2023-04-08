<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import { dispatch_events } from '$lib/class/utils.js';
	import { version } from '$app/environment';
	import { page } from '$app/stores';
	import { SessionDB } from '$lib/class/utils.js';

	const ldb_user = new SessionDB('data_user');

	//import Scan from '$lib/components/scan_devices.svelte'

	let iuser = 'admin';
	let ipwd = 'admin' + version.substring(version.length - 4);
	let user = '';
	let pwd = '';
	let host = '127.0.0.1';

	const dispatch = createEventDispatcher();

	onMount(() => {
		console.log($page);
		host = $page.url.host;
		ldb_user.data.host = host;
		ldb_user.write();
	});
</script>

<div class="modal is-active">
	<div class="modal-background" />
	<div class="modal-card">
		<header class="modal-card-head">
			<p class="modal-card-title">Login - GUI Version: {version}</p>
			<button class="delete" aria-label="close" />
		</header>
		<section class="modal-card-body">
			<div class="field">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">Usuario</label>
				<div class="control">
					<input class="input" type="text" placeholder="usuario" required bind:value={user} />
				</div>
			</div>

			<div class="field">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">Clave</label>
				<div class="control">
					<input class="input" type="password" placeholder="clave" required bind:value={pwd} />
				</div>
			</div>

			<div class="field">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">IP (Optional)</label>
				<div class="control">
					<input class="input" type="text" placeholder="Device IP" required bind:value={host} />
				</div>
			</div>
		</section>
		<footer class="modal-card-foot">
			<button
				class="button is-success"
				on:click={async (e) => {
					//					if (user == iuser && pwd == ipwd) {
					//if (true) {
					//dispatch_events(dispatch, 'page', 'status');

					let user_type = 99;

					if (user == 'admin') {
						user_type = 0;
					} else if (user == 'user') {
						user_type = 1;
					}

					ldb_user.data.host = host;
					ldb_user.write();

					try {
						let test = await fetch(`http://${host}/device/login`, {
							method: 'POST', // or 'PUT'
							mode: 'cors',
							body: JSON.stringify({ u: user_type, p: pwd }), // data can be `string` or {object}!
							headers: {
								'Content-Type': 'application/json'
							}
						});

						if (test.status == 200) {
							let respuesta = await test.json();
							console.log(respuesta);
							ldb_user.data.user_type = user_type;
							ldb_user.data.token = respuesta.token;
							ldb_user.write();
							dispatch_events(dispatch, 'page', 'status');
						} else if (test.status == 401) {
							alert('Invalid credentials');
						} else {
							alert('Device: ' + test.statusText);
						}
					} catch (error) {
						console.error(error);
					}
					//} else {
					//	alert('Invalid credentials');
					//}
				}}>Aceptar</button
			>
			<button class="button" on:click={() => {}}>Cancelar</button>
		</footer>
	</div>
</div>
