'use strict';

const chalk = require('chalk');

exports.parse = function (error) {
	const result = {};

	if (error.code) {
		result.code = error.code;
	}

	result.stack = error.stack;

	return result;
};


function trim(str) {
	return str.trim();
}

exports.format = {
	human(error) {
		// make stack more readable, and colorize

		if (error.stack) {
			// highlight the first stack frame position, eg: (vm.js:50:33)

			error.stack = error.stack.replace(/\(.+:[0-9]+:[0-9]+\)/, (pos) => {
				return chalk.reset.red(pos);
			});
		}

		return error;
	},
	json(error) {
		if (error.stack) {
			// turn stack into an array

			error.stack = error.stack.split('\n').map(trim);
		}

		return error;
	}
};
