<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import { dispatch_events } from '$lib/class/utils.js';
	import { version } from '$app/environment';

	let iuser = 'admin';
	let ipwd = 'admin' + version.substring(version.length - 4);
	let user = '';
	let pwd = '';

	const dispatch = createEventDispatcher();

	onMount(() => {});
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
			
		</section>
		<footer class="modal-card-foot">
			<button
				class="button is-success"
				on:click={(e) => {
					if (user == iuser && pwd == ipwd) {
						dispatch_events(dispatch, 'page', 'status');
					} else {
						alert('Invalid credentials');
					}
				}}>Aceptar</button
			>
			<button class="button">Cancelar</button>
		</footer>
	</div>
</div>
