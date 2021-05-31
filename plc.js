var nodes7 = require('nodes7');
var fastq = require('fastq');

var connected = false;
var isConnected = function() {
  return connected;
}

var setup = function(config, callback) {
  // create plc Object
  var plc = new nodes7({
  	silent: !config.debug
  });

	writeQueue = fastq(plc, function(args, callback) {
		queueCallback = callback;
		appCallback = args[2];

		callback = function(error) {
			queueCallback(error, null);
			appCallback(error);
		}
		
		args[2] = callback;

		plc.writeItems.apply(plc, args);
	}, 1);

	writeQueue.pause();

	// connect to plc
	plc.initiateConnection({
		port: config.port,
		host: config.host,
		localTSAP: config.localTSAP,
		remoteTSAP: config.remoteTSAP
	}, function (err) {
			if (err !== undefined) {
				console.log("We have an error. Maybe the PLC is not reachable.");
				console.log(err);
				process.exit();
			}

			console.log('PLC Connected');
			connected = true;
			
			writeQueue.resume();

			callback();
		});


	return {
		writeItems: function() {
			writeQueue.push(arguments);
		},
		addItems: function() {
			plc.addItems.apply(plc, arguments);
		},
		setTranslationCB: function() {
			plc.setTranslationCB.apply(plc, arguments);
		},
		readAllItems: function() {
			plc.readAllItems.apply(plc, arguments);
		},
	};
}

module.exports = {
	setup: setup,
  isConnected: isConnected
}
