'use strict';

const EOL = require('os').EOL;

module.exports = function (entry) {
	return JSON.stringify(entry) + EOL;
};
