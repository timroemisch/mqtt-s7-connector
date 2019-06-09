
module.exports.debug = function debug(msg, level = 0) {
	console.log(msg);
}

module.exports.error = function error(msg) {
  throw new Error(msg);
  process.exit(-1);
}

module.exports.plc_response = function plc_response(err) {
	if (err) {
		console.log("Error while writing to PLC !");
		// process.exit(-1);
	}
}
