<script lang="ts">
	import '../global.css';
	import 'bulma/css/bulma.min.css';
	import { onMount } from 'svelte';
	import { status_inputs, status_outputs } from '$lib/stores/status.js';
	//	import { page } from '$app/stores';
	import { SessionDB } from '$lib/class/utils.js';

	let data_store = {};

	let websocket;
	let host = 'localhost';

	function wsConnect() {
		//		host = $page.url.origin;
		console.log(window.location);
		data_store.read();
		host = data_store.data.host || window.location.host;
		//host = window.location.host;
		//alert(host);
		//alert(window.location.host);

		let url_wwebsocket = 'ws://' + host + '/ws';
		if (window.location.protocol.includes('https')) {
			url_wwebsocket = 'wss://' + host + '/ws';
		}
		console.log('Trying to open a WebSocket connection...', url_wwebsocket);
		websocket = new WebSocket(url_wwebsocket);
		websocket.onopen = (event) => {
			console.log('Connection opened');
		};
		websocket.onclose = (event) => {
			console.log('Connection closed');
			setTimeout(wsConnect, 2000);
		};
		websocket.onmessage = (event) => {
			//	console.log(status_inputs);
			let data = { status: undefined, value: undefined };
			try {
				data = JSON.parse(event.data);
				if (data) {
					if (data.status) {
						switch (data.status) {
							case 'i':
								if (data.value && Array.isArray(data.value)) {
									// @ts-ignore
									status_inputs.update((d) => {
										return data.value;
									});
								}
								break;
							case 'o':
								// @ts-ignore
								if (data.value && data.value.o && Array.isArray(data.value.o)) {
									// @ts-ignore
									status_outputs.update((d) => {
										return data.value;
									});
								}
								break;
						}
					}
				}
			} catch (error) {
				console.error(error);
			}
			//	console.log('Websocket', data);
		};
		return websocket;
	}

	onMount(async () => {
		data_store = new SessionDB('data_user');
		host = data_store.data.host || window.location.host;
		data_store.data.host = host;
		data_store.write();
		status_inputs.set([]);
		if ('WebSocket' in window) {
			wsConnect();
		} else {
			console.error('WebSocket is not supported by your Browser.');
		}
	});
</script>

<svelte:head>
	<link rel="apple-touch-icon" href="./pwa-192x192.png" />
</svelte:head>

<main>
	<slot />
</main>
