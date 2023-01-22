// @ts-nocheck
import express from 'express';
import { createServer } from 'http';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';

var data = {
	led: 34,
	MAX_SSID_WIFI: 3,
	wsHost: 'http://pueba.com',
	cfp: '',
	name: 'Casa',
	acbgl: false,
	latitude: -12.445534,
	longitude: 0.11324243,
	deviceId:
		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXZpY2VJZCI6Ijc1MDQ3NjRhLWMxNWMtNGI2ZS1iZGZlLTNlMTE1ZTBmMTIwNiIsImlhdCI6MTY3MjAyNjg0NH0.NnrpdJR3MFRMfljKO6IzRFRU1sg_JZqTpUWZct1t5d0',
	ChipModel: 'Test-Dev-ESP',
	EfuseMac: '44-555-DDFS-23',
	i: [
		{ name: 'Puerta 1', gpio: 23, enabled: false, type: 0, contact_type: 0, siren_type: 0 },
		{ name: 'Puerta 2', gpio: 30, enabled: false }
	],
	o: [
		{ name: 'Sirena 1', gpio: 0, enabled: false },
		{ name: 'Sirena 2', gpio: 1, enabled: false }
	],
	//    tg: [],
	wf: [
		{ ssid: 'edwinspire', pwd: 'xxxxxx' },
		{ ssid: 'wificasa1', pwd: 'fdfsdffds' },
		{ ssid: 'wificasa2', pwd: 'dljalkdjaskdjsakd' }
	]
};

const PORT = 5656;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, '../', 'build')));

app.get('/device/getsettings', (req, res) => {
	res.status(200).json(data);
});

/////////////////////////////////////////////////
app.get('/device/reboot', (req, res) => {
	res.status(200).json({});
});

///////////////////////////////////////////////////
app.get('/device/inputs/status', (req, res) => {
	let i = data.i.map((inp) => {
		return {
			gpio: inp.gpio,
			status: generateRandomInteger(3),
			value: generateRandomInteger(2048)
		};
	});

	res.status(200).json(i);
});

app.get('/device/outputs/status', (req, res) => {
	let o = data.o.map((inp) => {
		return {
			gpio: inp.gpio,
			status: generateRandomInteger(2) == 1 ? false : true
		};
	});

	res.status(200).json({ o: o, led: generateRandomInteger(2) == 1 ? false : true });
});

app.get('/device/info', (req, res) => {
	let d = {
		ChipModel: data.ChipModel,
		EfuseMac: data.EfuseMac,
		name: data.name,
		deviceId: data.deviceId,
		wsHost: data.wsHost
	};

	res.status(200).json(d);
});

app.post('/device/info', (req, res) => {
	console.log(req.body);
	res.status(200).json({});
});

///////////////////////////////
app.post('/device/geolocation', (req, res) => {
	console.log(req.body);
	res.status(200).json({});
});

app.get('/device/geolocation', (req, res) => {
	let d = {
		acbgl: data.acbgl,
		latitude: data.latitude,
		longitude: data.longitude
	};

	res.status(200).json(d);
});

///////////////////////////////
app.post('/device/wifi', (req, res) => {
	console.log(req.body);
	res.status(200).json({});
});

app.get('/device/wifi', (req, res) => {
	res.status(200).json(data.wf);
});

///////////////////////////////
app.post('/device/inputs', (req, res) => {
	console.log(req.body);
	res.status(200).json({});
});

app.get('/device/inputs', (req, res) => {
	res.status(200).json(data.i);
});

///////////////////////////////
app.post('/device/outputs', (req, res) => {
	console.log(req.body);
	res.status(200).json({});
});

app.get('/device/outputs', (req, res) => {
	res.status(200).json({ o: data.o, led: data.led });
});

///////////////////////////////
app.post('/device/cert', (req, res) => {
	console.log(req.body);
	res.status(200).json({});
});

app.get('/device/cert', (req, res) => {
	res.status(200).json({ cert: data.cert });
});

///////////////////////////////

httpServer.listen(PORT, () => {
	console.log('App listening on port ' + PORT);
});

function generateRandomInteger(max) {
	return Math.floor(Math.random() * max) + 1;
}
