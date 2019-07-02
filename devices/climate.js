let sf = require("../service_functions.js");
let device = require("../device.js");

module.exports = class devLight extends device {
	constructor(plc, mqtt, config, mqtt_base) {
		super(plc, mqtt, config, mqtt_base);

		// add attributes spezific for a light
		// create attribute from config

		// binary on/off state ->  power_command_topic ->
		if (config.state) {
			this.create_attribute(config.state, "X", "state");
		}

		// current temperature ->
		if (config.current_temperature) {
			this.create_attribute(config.current_temperature, "REAL", "current_temperature");
			this.attributes["current_temperature"].setRW("r");
		}

		// target temperature
		if (config.target_temperature) {
			this.create_attribute(config.target_temperature, "REAL", "target_temperature");
			this.attributes["target_temperature"].setRW("w");
		}

		// Features for Future ...

		// binary mode true = heating, false = cooling ->  mode_command_topic
		// if (config.mode) {
		// 	this.create_attribute(config.mode, "X", "mode");
		// }

		// fan mode binary state on/off
		// if (config.fan_mode) {
		// 	this.create_attribute(config.fan_mode, "X", "fan_mode");
		// }
	}

	send_discover_msg() {
		let info = {
			name: this.name,
			send_if_off: false,
			payload_on: "true",
			payload_off: "false"
		};

		if (this.attributes["current_temperature"])
			info.current_temperature_topic = this.attributes["current_temperature"].full_mqtt_topic;

		if (this.attributes["state"]) {
			// add only command_topic if the attribute is allowed to write
			if (this.attributes["state"].write_to_s7)
				info.power_command_topic = this.attributes["state"].full_mqtt_topic + "/set";

			// climate has no state topic for power to subscribe
			// info.power_state_topic = this.attributes["state"].full_mqtt_topic;
		}

		if (this.attributes["target_temperature"]) {
			// add only temperature_command_topic if the attribute is allowed to write
			if (this.attributes["target_temperature"].write_to_s7)
				info.temperature_command_topic = this.attributes["target_temperature"].full_mqtt_topic + "/set";

			// add only temperature_state_topic if attribute is allowed to read
			if (this.attributes["target_temperature"].publish_to_mqtt)
				info.temperature_state_topic = this.attributes["target_temperature"].full_mqtt_topic;
		}

		super.send_discover_msg(info);
	}


}
