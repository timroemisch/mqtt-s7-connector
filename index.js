'use strict';

let config = require('./config');

let mqtt_handler = require('./mqtt_handler.js');
let plc_handler = require('./plc.js');

let sf = require('./service_functions.js');
let deviceFactory = require('./deviceFactory.js');

let mqtt = mqtt_handler.setup(config.mqtt, mqttMsgParser, init);
// let plc = plc_handler.setup(config.plc, init);

// let mqtt = "null";
let plc = "null";

let devices = [];

init();

function init() {
	if (mqtt_handler.isConnected()) { // && plc_handler.isConnected()) {
		sf.debug("Initialize !");

		// set default config values if they arent set
		config.debug_level = config.debug_level || 2;

		config.update_time = config.update_time || 10000;
		config.temperature_interval = config.temperature_interval || 900000;

		config.mqtt_base = config.mqtt_base || "s7";
		config.retain_messages = config.retain_messages || false;

		config.discovery_prefix = config.discovery_prefix || "homeassistant";
		config.discovery_retain = config.discovery_retain || false;

		if (config.devices != undefined) {

			// create for each config entry an object
			// and save it to the array
			config.devices.forEach((dev) => {
				let new_device = deviceFactory(devices, plc, mqtt, dev, config.mqtt_base);

				// perform discovery message
				new_device.discovery_topic = config.discovery_prefix;
				new_device.send_discover_msg();

				// save the new device in the array
				// with the mqtt base as the index
				devices[new_device.mqtt_name] = new_device;

				sf.debug("New device added: " + config.mqtt_base + "/" + new_device.mqtt_name);
			});
		} else {
			sf.error("No devices in config found !");
		}

	} else {
		setTimeout(() => {
			if (!(mqtt_handler.isConnected())) { // && plc_handler.isConnected()
				sf.error("Connection Timeout");
			}
		}, 5000)
	}
}

function mqttMsgParser(topic, msg) {

}
