var nodes7 = require('nodes7');

var connected = false;
var isConnected = function() {
  return connected;
}

var setup = function(config, finished) {
  // create plc Object
  var plc = new nodes7({
  	silent: !config.debug
  });

	// connect to plc
	plc.initiateConnection({
		port: config.port,
		host: config.host,
		rack: config.rack,
		slot: config.slot,
	}, PLCconnected);

	function PLCconnected(err) {
		if (typeof(err) !== "undefined") {
			console.log("We have an error. Maybe the PLC is not reachable.");
			console.log(err);
			process.exit();
		}

    console.log('PLC Connected');
    connected = true;
    finished();

		// debug
		// plc.addItems('DB56,X0.1');
		// plc.readAllItems((err, val) => {
		// 	console.log(val);
		// });
	}

	return plc;
}

module.exports = {
	setup: setup,
  isConnected: isConnected
}
