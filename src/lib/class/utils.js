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
