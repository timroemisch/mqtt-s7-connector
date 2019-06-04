var mqtt = require('mqtt');

var connected = false;
var isConnected = function() {
  return connected;
}

var setup = function(config, onMessage, finished) {

	// connect to mqtt
	var client = mqtt.connect(config.host, {
		username: config.user,
		password: config.password,
		rejectUnauthorized: config.rejectUnauthorized
	});

	// successful connected :)
	client.on('connect', function() {
		console.log('MQTT Connected');
    connected = true;
    finished();
	});

	// handle incomming messages
	client.on('message', function(topic, msg) {
		onMessage(topic, msg.toString());
	});

  return client;
}

module.exports = {
	setup: setup,
  isConnected: isConnected
}
