import jwt_decode from 'jwt-decode';

/**
 * @param {string | undefined} [deviceId]
 */
export function GetDeviceID(deviceId) {
	console.log('GetDeviceID > ', deviceId);
	let realDeviceId = '';
	if (deviceId && deviceId.length > 0 && deviceId != '00a0aa00-aa00-0000-0000-000000000000') {
		try {
			let deco = jwt_decode(deviceId);
			console.log(deco);

			// @ts-ignore
			if (deco && deco.deviceId) {
				// @ts-ignore
				realDeviceId = deco.deviceId;
			}
		} catch (error) {
			// @ts-ignore
			realDeviceId = error.message;
		}
	} else {
		realDeviceId = 'Not assigned';
	}
	console.log('GetDeviceID return', realDeviceId);
	return realDeviceId;
}

/**
 * @param {any} dispatch
 * @param {string} event_name
 * @param {string} value
 */
export function dispatch_events(dispatch, event_name, value) {
	console.log(event_name);
	dispatch('event', {
		name: event_name,
		value: value
	});
}

export async function certGet() {
	let d = {};
	try {
		let response = await fetch('/device/info');
		let data = await response.json();

		if (response.status == 200 && data) {
			d.name = data.name || '';
			d.ChipModel = data.ChipModel || '';
			d.EfuseMac = data.EfuseMac || '';
			d.deviceId = data.deviceId || '';
			d.wsHost = data.wsHost || '';
		}
	} catch (error) {
		console.trace(error);
	}
	return d;
}

/**
 * @param {string} name
 * @param {string} deviceId
 * @param {string} wsHost
 */
export async function certSave(name, deviceId, wsHost) {
	try {
		let response = await fetch('/device/info', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ name: name, deviceId: deviceId, wsHost: wsHost })
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
}
