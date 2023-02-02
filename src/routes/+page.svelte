<script>
	import CompLogin from '$lib/components/page_login.svelte';
	import CompSetup from '$lib/components/page_setup.svelte';
	import CompStatus from '$lib/components/page_status.svelte';
	import CompCert from '$lib/components/page_cert.svelte';
	import { version } from '$app/environment';

	let cmp = CompLogin;
</script>

<div class="topnav">
	<div class="tit">OPEN COMMUNITY SAFETY</div>
	<div class="subtit">Version: {version}</div>
</div>

<svelte:component
	this={cmp}
	on:event={(e) => {
		if (e.detail.name == 'page') {
			switch (e.detail.value) {
				case 'status':
					cmp = CompStatus;
					break;
				case 'setup':
					cmp = CompSetup;
					break;
				case 'cert':
					cmp = CompCert;
					break;
				default:
					cmp = CompLogin;
					break;
			}
		}
	}}
/>

<style>
	.tit {
		color: ghostwhite;
		text-align: -webkit-center;
		padding: 5px;
		font-size: large;
		font-weight: bold;
	}

	.subtit {
		color: ghostwhite;
		text-align: -webkit-center;
		padding: 5px;
		font-size: small;
	}

	/* Style the top navigation bar */
	.topnav {
		overflow: hidden;
		background-color: #333;
	}
</style>
