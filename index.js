#!/usr/bin/env node
'use strict';

let config = require('./config');

let mqtt_handler = require('./mqtt_handler.js');
let plc_handler = require('./plc.js');

let sf = require('./service_functions.js');
let deviceFactory = require('./deviceFactory.js');

let mqtt = mqtt_handler.setup(config.mqtt, mqttMsgParser, init);
let plc = plc_handler.setup(config.plc, init);

let devices = [];

function init() {
	if (mqtt_handler.isConnected() && plc_handler.isConnected()) {
		sf.debug("Initialize !");

		// set default config values if they arent set
		config.debug_level = config.debug_level || 2;

		config.update_time = config.update_time || 10000;
		config.temperature_interval = config.temperature_interval || 900000;

		config.mqtt_base = config.mqtt_base || "s7";
		config.retain_messages = config.retain_messages || false;

		config.discovery_prefix = config.discovery_prefix || "homeassistant";
		config.discovery_retain = config.discovery_retain || false;

		// namespace translation
		plc.setTranslationCB((topic) => {
			let topic_parts = topic.split('/');

			// call correct device and ask for address from attribute
			return devices[topic_parts[1]].get_plc_address(topic_parts[2]);
		});

		// parse config and create devices
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


		// start loop
		setInterval(() => {
			plc_update_loop();
		}, config.updateTime);

		// discovery broadcast loop
		setInterval(() => {
			devices.forEach((dev) => {
				dev.send_discover_msg();
			});
		}, 300000); // 5 min

	} else {
		setTimeout(() => {
			if (!mqtt_handler.isConnected() || !plc_handler.isConnected()) {
				sf.error("Connection Timeout");
			}
		}, 5000)
	}
}

function mqttMsgParser(topic, msg) {
	let topic_parts = topic.split('/');

	// check if the topic is in the mqtt_base
	if (topic_parts[0] == config.mqtt_base) {
		let device = topic_parts[1];
		let attribute = topic_parts[2];

		// if device exists
		if (devices[device]) {

			// give all data to device
			devices[device].rec_mqtt_data(attribute, msg);
		}
	}
}


function plc_update_loop() {
	plc.readAllItems((err, readings) => {
		if (err) {
			sf.debug("Error while reading from PLC !");
			return;
		}

		// publish all data
		for (var topic in readings) {
			let topic_parts = topic.split('/');
			let device = topic_parts[1];
			let attribute = topic_parts[2];

			// if device exists
			if (devices[device]) {
				// give all data to device
				devices[device].rec_s7_data(attribute, readings[topic]);
			}
		}

	});
}
