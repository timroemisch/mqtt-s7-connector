let sf = require("./service_functions.js");

module.exports = class attribute {
	constructor(name, type, mqtt_device_topic) {
		this.last_update = 0;
    this.last_value = 0;
		this.update_interval = 0;

		this.plc_address = null;

		this.publish_to_mqtt = true;
    this.write_to_s7 = true;

		this.type = type; // plc type e.g. X, BYTE

		// attribute name (last part in topic)
		this.name = name;

		// full topic
		this.full_mqtt_topic = mqtt_device_topic + "/" + this.name;
	}

	set_RW(data) {
		data = data.toLowerCase();

    // data is always going to be read from the plc
    // but with 'w' the state wont be sent over mqtt
    // with 'r' enabled it isnt possible to write into the plc
		switch (data) {
			case "r":
				this.write_to_s7 = false;
				this.publish_to_mqtt = true;
				break;

			case "w":
				this.write_to_s7 = true;
				this.publish_to_mqtt = false;
				break;

			case "rw":
			case "wr":
				this.write_to_s7 = true;
				this.publish_to_mqtt = true;
				break;

			default:
				sf.debug("couldnt set rw-mode '" + data + "' on attribute '" + this.name + "'");
        sf.debug("it can be either 'r', 'w' or 'rw'")
		}
	}


	rec_s7_data(data) {

	}

	rec_mqtt_data(data) {

	}


}
