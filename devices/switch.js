let sf = require("../service_functions.js");
let device = require("../device.js");

module.exports = class devSwitch extends device {
	constructor(plc, mqtt, config, mqtt_base) {
		super(plc, mqtt, config, mqtt_base);

		// add attributes spezific for a switch
		// create attribute from config

		// binary state
		if (config.state) {
			this.create_attribute(config.state, "X", "state");
		}

	}

	send_discover_msg() {
		let info = {
			name: this.name,
			payload_on: "true",
			payload_off: "false",
			state_on: "true",
			state_off: "false"
		};

		if (this.attributes["state"]) {
			// add only command_topic if the attribute is allowed to write
			if (this.attributes["state"].write_to_s7)
				info.command_topic = this.attributes["state"].full_mqtt_topic + "/set";

			// add only state_topic if attribute is allowed to read
			if (this.attributes["state"].publish_to_mqtt)
				info.state_topic = this.attributes["state"].full_mqtt_topic;
		}

		super.send_discover_msg(info);
	}


}
