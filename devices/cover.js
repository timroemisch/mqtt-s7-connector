let sf = require("../service_functions.js");
let device = require("../device.js");

module.exports = class devCover extends device {
	constructor(plc, mqtt, config, mqtt_base) {
		super(plc, mqtt, config, mqtt_base);

		// add attributes spezific for a cover
		// create attribute from config

		// targetPosition
		if (config.targetPosition) {
			this.create_attribute(config.targetPosition, "BYTE", "targetPosition");
		}

		// currentPosition
		if (config.currentPosition) {
			this.create_attribute(config.currentPosition, "BYTE", "currentPosition");
			this.attributes["currentPosition"].set_RW("r"); // read from s7 and publish to mqtt
		}

		// tiltAngle
		if (config.tiltAngle) {
			this.create_attribute(config.tiltAngle, "BYTE", "tiltAngle");
		}

		// currentTiltAngle
		if (config.currentTiltAngle) {
			this.create_attribute(config.currentTiltAngle, "BYTE", "currentTiltAngle");
			this.attributes["currentTiltAngle"].set_RW("r"); // read from s7 and publish to mqtt
		}

		// this bit will be set after triggering each action
		if (config.trigger) {
			this.create_attribute(config.trigger, "X", "trigger");
			this.attributes["trigger"].set_RW("i"); // internal attribute
		}
	}

	send_discover_msg() {
		let info = {
			name: this.name,
			payload_open: '255',
			payload_close: '0',
			payload_stop: 'STOP',
			position_open: 255,
			position_closed: 0,
			tilt_min: 0,
			tilt_max: 255,
			tilt_closed_value: 0,
			tilt_opened_value: 255,
			set_position_template: '{{ (position / 100) * 255 }}'
		}


		if (this.attributes["targetPosition"]) {
			info.command_topic = this.attributes["targetPosition"].full_mqtt_topic + "/set";
			info.set_position_topic = this.attributes["targetPosition"].full_mqtt_topic + "/set";
		}

		if (this.attributes["tiltAngle"])
			info.tilt_command_topic = this.attributes["tiltAngle"].full_mqtt_topic + "/set";

		if (this.attributes["currentTiltAngle"])
			info.tilt_status_topic = this.attributes["currentTiltAngle"].full_mqtt_topic;

		if (this.attributes["currentPosition"])
			info.position_topic = this.attributes["currentPosition"].full_mqtt_topic;

		super.send_discover_msg(info);
	}

	rec_mqtt_data(attr, data) {

		// call parent class method
		super.rec_mqtt_data(attr, data, (error) => {
			// callback function of attribute when write was finished

			// if the trigger attr is defined
			if (this.attributes["trigger"]) {

				// send impulse
				this.attributes["trigger"].rec_mqtt_data("true", () => {
					this.attributes["trigger"].rec_mqtt_data("false");
				});

			}

		});
	}

}
