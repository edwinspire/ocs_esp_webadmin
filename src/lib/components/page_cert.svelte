<script>
	import Ssl from '$lib/components/ssl_cert.svelte';
	import Menu from '$lib/components/menu.svelte';
	import { createEventDispatcher } from 'svelte';
	import { dispatch_events } from '$lib/class/utils.js';

	const dispatch = createEventDispatcher();
	// @ts-ignore
	let SslFun;

</script>

<Menu
	isLogin={false}
	show_download={false}
	show_get={true}
	show_reboot={true}
	show_save={true}
	on:event={(e) => {
		if (e.detail.name == 'action') {
			switch (e.detail.value) {
				case 'get':
					SslFun.getInfo();
					break;
				case 'save':
					SslFun.save();
					break;
			}
		} else {
			dispatch_events(dispatch, e.detail.name, e.detail.value);
		}
	}}
/>

<Ssl bind:this={SslFun} />
