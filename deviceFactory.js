let sf = require('./service_functions.js');

let device = require('./device.js');

let dev_light = require('./devices/light.js');
let dev_cover = require('./devices/cover.js');
let dev_sensor = require('./devices/sensor.js');
let dev_switch = require('./devices/switch.js');
let dev_climate = require('./devices/climate.js');
let dev_binCover = require('./devices/binaryCover.js');

module.exports = function deviceFactory(devices, plc, mqtt, config, mqtt_base) {
	let type = config.type.toLowerCase();

	// check name
	let name = config.name || "unnamed device";
	let mqtt_name = "";

	// if the attribute 'mqtt' isnt set
	// we have to generate one
	if (config.mqtt) {
		mqtt_name = config.mqtt;
	} else {
		mqtt_name = name.toLowerCase().split(' ').join('-').split('/').join('-');
	}

	// check if the spot in the array is already occupied
	// if it is then add an postfix to it
	// loop so long until we found an empty spot
	let index = 1;
	let new_mqtt_name = mqtt_name;
	while (devices[new_mqtt_name] !== undefined) {
		new_mqtt_name = mqtt_name + "-" + index;
		index++;
	}

	// save new values back to config
	// so it can be processed in the new object
	mqtt_name = new_mqtt_name;
	config.name = name;
	config.mqtt = new_mqtt_name;
	config.mqtt_base = mqtt_base;

	switch (type) {
		case "light":
			return new dev_light(plc, mqtt, config);
			break;

		case "sensor":
			return new dev_sensor(plc, mqtt, config);
			break;

		case "switch":
			return new dev_switch(plc, mqtt, config);
			break;

		case "cover":
			return new dev_cover(plc, mqtt, config);
			break;

		case "climate":
			return new dev_climate(plc, mqtt, config);
			break;

		case "binarycover":
			return new dev_binCover(plc, mqtt, config);
			break;

		default:
			sf.debug("Unknown device type '" + type + "'");
	}


}
