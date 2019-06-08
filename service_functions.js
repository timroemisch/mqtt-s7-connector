
module.exports.debug = function debug(msg, level = 0) {
	console.log(msg);
}

module.exports.error = function error(msg) {
  throw new Error(msg);
  process.exit(-1);
}
