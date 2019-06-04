let config = require('./config');

let mqtt_handler = require('./mqtt_handler.js');
let plc_handler = require('./plc.js');

let mqtt = mqtt_handler.setup(config.mqtt, mqttMsgParser, init);
let plc = plc_handler.setup(config.plc, init);

function init() {
	if (mqtt_handler.isConnected() && plc_handler.isConnected()) {
		debug("Initialize !");



	} else {
		setTimeout(() => {
			if (!(mqtt_handler.isConnected() && plc_handler.isConnected())) {
				error("Connection Timeout");
			}
		}, 5000)
	}
}

function mqttMsgParser(topic, msg) {

}


function debug(msg, level = 0) {
  console.log(msg);
}

function error(msg) {
  throw new Error(msg);
  process.exit(-1);
}
