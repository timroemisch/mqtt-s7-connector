let sf = require("../service_functions.js");
let device = require("../device.js");

module.exports = class devSensor extends device {
	constructor(plc, mqtt, config, mqtt_base) {
		super(plc, mqtt, config, mqtt_base);

		// add attributes spezific for a sensor
		// create attribute from config

		// state
		if (config.state) {
			// allow all supported types
			this.create_attribute(config.state, "", "state");
			this.attributes["state"].set_RW("r"); // readonly
		}
	}

	send_discover_msg() {
		let info = {
			name: this.name,
		};

		if (this.attributes["state"]) {
			info.state_topic = this.attributes["state"].full_mqtt_topic;

			if (this.attributes["state"].unit_of_measurement) {
				info.unit_of_measurement = this.attributes["state"].unit_of_measurement;
			}
		}

		super.send_discover_msg(info);
	}


}
