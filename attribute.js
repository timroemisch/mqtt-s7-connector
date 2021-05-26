let sf = require("./service_functions.js");

module.exports = class attribute {
	constructor(plc, mqtt, name, type, mqtt_device_topic) {
		this.plc_handler = plc;
		this.mqtt_handler = mqtt;

		this.last_update = 0;
		this.last_value = 0;
		this.update_interval = 0;

		this.plc_address = null;
		this.plc_set_address = null;

		// if true, the attribute is allowed to publish update msg to mqtt
		this.publish_to_mqtt = true;

		// if true, the attribute is allowed to write updates to the plc
		// and allowed to subscribe to the '/set' topic
		this.write_to_s7 = true;

		// only true if this attribute shouldnt be visible over mqtt
		this.is_internal = false;

		// plc type e.g. X, BYTE
		this.type = type;

		// TODO
		this.round_value = true;

		// attribute name (last part in topic)
		this.name = name;

		// works only with booleans
		// send inverted value to mqtt
		this.boolean_inverted = false;

		// full topic
		this.full_mqtt_topic = mqtt_device_topic + "/" + this.name;

		// optional write back changes from plc to set_plc
		this.write_back = false;

		// only subscribe if attribute is allowed to write to plc
		if (this.write_to_s7) {
			this.mqtt_handler.subscribe(this.full_mqtt_topic + "/set");
			sf.debug("-- Subscribe to topic: '" + this.full_mqtt_topic + "/set'");
		}

		this.subscribePlcUpdates();
	}

	// every attribute as to add it self to the plc_handler
	// so that it can be updated from the plc
	subscribePlcUpdates() {
		if (this.plc_address) {
			this.plc_handler.addItems(this.full_mqtt_topic);
		}
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
				this.is_internal = false;

				// unsubscribe if already subscribed
				sf.debug("-- Unubscribe from topic: '" + this.full_mqtt_topic + "/set'");
				this.mqtt_handler.unsubscribe(this.full_mqtt_topic + "/set");
				break;

			case "w":
				this.write_to_s7 = true;
				this.publish_to_mqtt = false;
				this.is_internal = false;
				break;

			case "i":
				this.write_to_s7 = true;
				this.publish_to_mqtt = false;
				this.is_internal = true;

			case "rw":
			case "wr":
				this.write_to_s7 = true;
				this.publish_to_mqtt = true;
				this.is_internal = false;
				break;

			default:
				sf.debug("couldnt set rw-mode '" + data + "' on attribute '" + this.name + "'");
				sf.debug("it can be either 'r', 'w' or 'rw'")
		}
	}


	rec_s7_data(data) {
		if (this.publish_to_mqtt) {

			// round all floating point values up to 3 decimal places
			if (this.type == "REAL" && this.round_value) {
				data = Math.round(data * 1000) / 1000;
			}

			if (this.type == "X" && this.boolean_inverted) {
				data = !data;
			}

			const now = Date.now();

			// if time has passed then updated if the update_interval is set
			let should_update = ((now - this.last_update) > this.update_interval) &&
				this.update_interval != 0;

			// last_value / last_update update
			if (data != this.last_value && this.update_interval == 0) {
				should_update = true;
			}

			// send mqtt msg if necessary
			if (should_update) {
				this.last_value = data;
				this.last_update = now;

				this.mqtt_handler.publish(this.full_mqtt_topic, data.toString(), {
					retain: false
				});

				if (this.write_back) {
					this.write_to_plc(data, (error) => {
							if (error) {
								sf.debug("Error while writing back: " + error);
							}
						});
				}
			}

		}
	}

	rec_mqtt_data(data, cb) {
		// type check
		let msg = this.formatMessage(data, this.type);
		
		// no error in formatting
		if (msg[0] == 0) {
			this.write_to_plc(msg[1], cb);
		} else {
			if (cb) cb("Incorrect formating");
		}
	}

	write_to_plc(data, cb) {
		let that = this;

		// write to plc
		this.plc_handler.writeItems(this.full_mqtt_topic + "/set", data, (error) => {
			sf.plc_response(error);

			if (cb) cb(error);
		});
	}


	//
	// format message
	// according to type
	//
	// @param msg		string							mqtt message
	// 				type 	String							PLC type (X/BYTE/REAL)
	//
	// @return 			Array[0]						Error code, 0="OK", -1="type not found", -2="cant format type"
	//							Array[1]						formatted variable
	//
	formatMessage(msg, type, noDebugOut = false) {
		let write;
		switch (type) {
			case "X":
				if (msg == "true") write = true;
				else if (msg == "false") write = false;
				else {
					if (noDebugOut)
						sf.debug("can´t format incoming message '" + msg + "' -> skipping it");
					return [-2];
				}
				break;

			case "BYTE":
				write = parseInt(msg);
				if (isNaN(write)) {
					if (noDebugOut)
						sf.debug("can´t format incoming message '" + msg + "' -> skipping it");
					return [-2];
				}
				break;

			case "REAL":
				write = parseFloat(msg);
				if (isNaN(write)) {
					if (noDebugOut)
						sf.debug("can´t format incoming message '" + msg + "' -> skipping it");
					return [-2];
				}
				break;

			default:
				if (noDebugOut)
					sf.debug("can´t format incoming message '" + msg + "' -> skipping it");
				return [-1];
		}

		return [0, write];
	}

}
