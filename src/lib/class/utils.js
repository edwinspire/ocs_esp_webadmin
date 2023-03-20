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
	let d = '';
	try {
		let response = await fetch('/device/cert');
		let data = await response.json();
		console.log(data);

		if (response.status == 200 && data && data.cfp) {
			d = data.cfp;
		}
	} catch (error) {
		console.trace(error);
	}
	return d;
}

/**
 * @param {string} cert
 */
export async function certSave(cert) {
	if (cert) {
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
				return true;
			} else {
				return false;
			}
		} catch (error) {
			console.log(error);
			return false;
		}
	} else {
		return false;
	}
}

export class SessionDB {
	data = {};
	_name_storage = 'ss';
	/**
	 * @param {string} name_storage
	 */
	constructor(name_storage) {
		this._name_storage = name_storage || this._name_storage;
		this.read();
	}

	write() {
		if (typeof window !== 'undefined') {
			sessionStorage.setItem(this._name_storage, JSON.stringify(this.data));
		} else {
			console.error('window is not defined');
		}
	}

	read() {
		try {
			// @ts-ignore
			this.data = JSON.parse(sessionStorage.getItem(this._name_storage)) || {};
		} catch (error) {
			this.data = {};
			console.error(error);
		}
	}
	clear() {
		this.data = {};
		this.write();
	}
}

/**
 * @param {string} protocol
 * @param {string} host
 * @param {string} path
 */
export function createURL(protocol, host, path) {
	let u = '';

	if (protocol && protocol.length > 0) {
		protocol = protocol;
	} else {
		protocol = 'http';
	}

	if (typeof window !== 'undefined') {
		host = host || window.location.host;
	} else {
		host = host || 'localhost';
	}

	u = `${protocol}://${host}${path}`;
	return u;
}

/**
 * @param {string} path
 */
export function createParamEndPoint(path) {
	let data = {};
	const ldb_user = new SessionDB('data_user');
	data.headers = {
		headers: {
			'Content-Type': 'application/json',
			// @ts-ignore
			token: ldb_user.data.token
		}
	};
	data.endpoint = createURL('http', ldb_user.data.host, path);
	return data;
}
