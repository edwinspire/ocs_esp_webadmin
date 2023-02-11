<script>
	import { onMount } from 'svelte';
	import CompLogin from '$lib/components/page_login.svelte';
	import CompSetup from '$lib/components/page_setup.svelte';
	import CompStatus from '$lib/components/page_status.svelte';
	import CompCert from '$lib/components/page_cert.svelte';
	import { version } from '$app/environment';
	import { status_inputs, status_outputs } from '$lib/stores/status.js';

	let websocket;
	function wsConnect() {
		let url_wwebsocket = 'ws://' + window.location.host + '/ws';
		if (window.location.protocol.includes('https')) {
			url_wwebsocket = 'wss://' + window.location.host + '/ws';
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

	let cmp = CompLogin;

	onMount(() => {
		status_inputs.set([]);
		if ('WebSocket' in window) {
			wsConnect();
		} else {
			console.error('WebSocket is not supported by your Browser.');
		}
	});
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
