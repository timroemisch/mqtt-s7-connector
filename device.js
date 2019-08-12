let attribute = require("./attribute.js");
let sf = require('./service_functions.js');

module.exports = class device {
	constructor(plc, mqtt, config) {
		this.plc_handler = plc;
		this.mqtt_handler = mqtt;

		this.name = config.name || "unnamed device";
		this.config = config;

		this.discovery_topic = "homeassistant";
		this.discovery_retain = false;
		this.type = config.type.toLowerCase();

		// device topics
		this.mqtt_name = config.mqtt;
		this.full_mqtt_topic = config.mqtt_base + "/" + this.mqtt_name;

		// store all attribute objects in this array
		this.attributes = {};
	}

	create_attribute(config, required_type, name) {
		// create attribute object
		let new_attribute = new attribute(
			this.plc_handler,
			this.mqtt_handler,
			name,
			required_type,
			this.full_mqtt_topic);

		// the config could be an object
		// or simply an string
		if (typeof config == "object") {
			new_attribute.plc_address = config.plc;

			// optional different set address
			if (config.set_plc)
				new_attribute.plc_set_address = config.set_plc;

			// optional Read Write config
			if (config.rw)
				new_attribute.set_RW(config.rw);

			// optional update_interval
			if (config.update_interval)
				new_attribute.update_interval = config.update_interval;

			// optional unit_of_measurement only for homeassistant
			if (config.unit_of_measurement)
				new_attribute.unit_of_measurement = config.unit_of_measurement;

		} else {
			new_attribute.plc_address = config;
		}

		// register the attribute to the plc library
		new_attribute.subscribePlcUpdates();

		// split the plc adress to get the type
		let offset = new_attribute.plc_address.split(',');
		let params = offset[1].match(/(\d+|\D+)/g);
		let type = params[0];

		// check if the type is correct
		// and if it isnt then print some infos
		if (required_type != "" && type != required_type) {
			sf.debug("Wrong datatype '" + type + "' at attribute '" + name + "'");

			let numbers = "";
			for (var i = 1; i < params.length; i++) {
				numbers += params[i];
			}

			sf.debug("Did you mean " + offset[0] + "," +
				required_type + numbers +
				" instead of " + new_attribute.plc_address + " ?");

			return;
		}

		sf.debug("- New attribute '" + new_attribute.full_mqtt_topic + "' was created");

		// save attribute in array
		this.attributes[name] = new_attribute;
	}

	send_discover_msg(info) {
		// create an topic in which the discovery message can be sent
		let topic = this.discovery_topic + "/" +
			this.type + "/s7-connector/" + this.mqtt_name + "/config";

		this.mqtt_handler.publish(topic, JSON.stringify(info), {
			retain: this.discovery_retain
		});
	}

	rec_s7_data(attr, data) {
		// check if attribute with this name exists
		if (this.attributes[attr]) {

			// forward all data to attribute
			this.attributes[attr].rec_s7_data(data);
		}
	}

	rec_mqtt_data(attr, data, cb) {
		// check if attribute with this name exists
		if (this.attributes[attr]) {

			// forward all data to attribute
			this.attributes[attr].rec_mqtt_data(data);

			if (cb) cb(attr, data);
		}
	}

	get_plc_address(attr) {
		if (this.attributes[attr]) {
			return this.attributes[attr].plc_address;
		}

		// optional set address
		if (this.attributes[attr + "/set"]) {
			return this.attributes[attr + "/set"].plc_address;
		}

		return null;
	}

}
