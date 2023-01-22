<script>
	import Ssl from '$lib/components/ssl_cert.svelte';
	import Menu from '$lib/components/menu.svelte';

	let cert = '';

	async function setSettings() {
		if (confirm('Desea guardar los cambios?')) {
			try {
				let response = await fetch('/device/cert', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ cert: cert })
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
	}

	async function getSettings() {
		try {
			let response = await fetch('/device/cert');
			let data = await response.json();
			console.log(data);
			cert = data.cert;
		} catch (error) {
			console.trace(error);
		}
	}
</script>

<Menu
	show_get={true}
	show_save={true}
	show_reboot={true}
	on:event={(e) => {
		//console.log(e.detail.name);

		switch (e.detail.name) {
			case 'get':
				console.log(e.detail.name);
				getSettings();
				break;
			case 'save':
				console.log(e.detail.name);
				setSettings();
				break;
		}
	}}
/>
<Ssl bind:cfg={cert} />
