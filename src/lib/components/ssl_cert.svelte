<script>
	import { onMount } from 'svelte/internal';
	import { certSave, certGet } from '$lib/class/utils.js';
	/**
	 * @type {any}
	 */
	let cert;
	export const save = async () => {
		if (confirm('Desea guardar los cambios?')) {
			try {
				let r = await certSave(cert);

				if (r) {
					alert('Guardado');
				} else {
					alert('No se pudo guardar');
				}
			} catch (error) {
				console.log(error);
				alert('No se pudo guardar');
			}
		}
	};

	export const getInfo = async () => {
		try {
			cert = await certGet();
		} catch (error) {
			console.trace(error);
		}
	};
	onMount(async () => {
		try {
			await getInfo();
		} catch (error) {
			console.log(error);
		}
	});
</script>

<fieldset class="fset">
	<legend class="legent">SSL Certificate</legend>
	<textarea class="textarea" rows="25" cols="50" maxlength="2000" bind:value={cert} />
</fieldset>

<style>
	.fset {
		margin: 1em;
	}

	.legent {
		font-size: 1.5em;
	}
</style>
