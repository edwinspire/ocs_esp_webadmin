<script>
	import { onMount } from 'svelte';
	import CompLogin from '$lib/components/page_login.svelte';
	import CompSetup from '$lib/components/page_setup.svelte';
	import CompStatus from '$lib/components/page_status.svelte';
	import CompCert from '$lib/components/page_cert.svelte';
	//	import { version } from '$app/environment';

	let ShowWidget = false;
	let cmp = CompLogin;

	onMount(() => {});
</script>


<svelte:component
	this={cmp}
	on:event={(e) => {
		if (e.detail.name == 'page') {
			switch (e.detail.value) {
				case 'status':
					cmp = CompStatus;
					ShowWidget = true;
					break;
				case 'setup':
					cmp = CompSetup;
					ShowWidget = true;
					break;
				case 'cert':
					cmp = CompCert;
					ShowWidget = true;
					break;
				default:
					cmp = CompLogin;
					ShowWidget = false;
					break;
			}
		}
	}}
/>
