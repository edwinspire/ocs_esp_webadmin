<script>
	import { onMount } from 'svelte/internal';

	/**
	 * @type {any}
	 */
	let cert;
	export const save = async () => {
		if (confirm('Desea guardar los cambios?')) {
			try {
				let response = await fetch('/device/cert', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ cfp: cert })
				});
				let data = await response.json();
				console.log(data);
				if (response.status == 200 && data) {
					alert('Guardado');
				}
			} catch (error) {
				console.log(error);
			}
		}
	};

	export const getInfo = async () => {
		try {
			let response = await fetch('/device/cert');
			let data = await response.json();
			console.log(data);

			if (response.status == 200 && data && data.cfp) {
				cert = data.cfp;
			}
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
	<textarea class="ca" rows="25" cols="50" maxlength="2000" bind:value={cert} />
</fieldset>

<style>
	.fset {
		margin: 1em;
	}

	.ca {
		background-color: #333;
		width: 100%;
		color: white;
	}
	.legent {
		font-size: 1.5em;
	}
</style>
