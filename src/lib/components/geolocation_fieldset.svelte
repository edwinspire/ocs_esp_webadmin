<script>
	import InputComp from '$lib/components/input.svelte';
	import { onMount } from 'svelte/internal';
	import EnabledComponent from '$lib/components/enable_button.svelte';

	export let acbgl = false;
	export let latitude = '';
	export let longitude = '';

	var link_osm = '';

	/*
	function getLocation() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition((position) => {
				// @ts-ignore
				deviceSettings = {
					latitude: position.coords.latitude,
					longitude: position.coords.longitude
				};
			});
		} else {
			alert('Geolocation is not supported by this browser.');
		}
	}
*/

	function getGeoFromLink() {
		try {
			console.log(link_osm);
			let params = new URL(link_osm).searchParams;
			// @ts-ignore
			latitude = params.get('mlat'); // is the string "Jonathan Smith".
			// @ts-ignore
			longitude = params.get('mlon'); // is the string "Jonathan Smith".
		} catch (error) {
			alert('El link ingresado no es válido');
		}
	}

	export const getInfo = async () => {
		try {
			let response = await fetch('/device/geolocation');
			let data = await response.json();

			if (response.status == 200 && data) {
				acbgl = data.acbgl;
				latitude = data.latitude;
				longitude = data.longitude;
			}
		} catch (error) {
			console.trace(error);
		}
	};

	export const save = async () => {
		try {
			let response = await fetch('/device/geolocation', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ acbgl: acbgl, latitude: latitude, longitude: longitude })
			});
			let data = await response.json();
			//	console.log(data);
			if (response.status == 200 && data) {
				return true;
			} else {
				return false;
			}
		} catch (error) {
			console.log(error);
			return false;
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
	<legend class="legent">Geolocation</legend>

	<div class="columns is-multiline is-mobile">
		<div class="column is-half">
			<InputComp label="Latitude" maxlength="10" bind:value={latitude} />
		</div>
		<div class="column is-half">
			<InputComp label="Longitude" maxlength="10" bind:value={longitude} />
		</div>
		<div class="column is-full">
			<InputComp
				maxlength="300"
				label="From Open Street Maps Link"
				bind:value={link_osm}
				on:change={getGeoFromLink}
			/>
		</div>
		<div class="column is-full">
			<div class="f0">
				<EnabledComponent bind:enabled={acbgl} />
			</div>
			<div class="f6">Allow device for community use by geolocation</div>
		</div>
		<div class="column is-full">
			<a
				target="_blank"
				rel="noreferrer"
				href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=19/${latitude}/${longitude}`}
				>Show on Open Street Maps</a
			>
		</div>
	</div>
</fieldset>
