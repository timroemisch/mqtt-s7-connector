let sf = require("../service_functions.js");
let device = require("../device.js");

module.exports = class devGarage extends device {
	constructor(plc, mqtt, config, mqtt_base) {
		super(plc, mqtt, config, mqtt_base);

		// currentPosition
		if (config.currentPosition) {
			this.create_attribute(config.currentPosition, "X", "currentPosition");
			this.attributes["currentPosition"].set_RW("r"); // read from s7 and publish to mqtt
		}
	}

	send_discover_msg() {
		let info = {
			name: this.name,
			payload_open: '1',
			payload_close: '0',
			payload_stop: '1',
			state_open: 1,
			state_closed: 0
		}

		if (this.attributes["currentPosition"])
			info.state_topic = this.attributes["currentPosition"].full_mqtt_topic;

		super.send_discover_msg(info);
	}

	rec_mqtt_data(attr, data) {

		// call parent class method
		super.rec_mqtt_data(attr, data, (error) => {
			// callback function of attribute when write was finished

		});
	}

}
