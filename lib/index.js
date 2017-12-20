'use strict';

const util = require('util');
const requireDir = require('require-dir');

const propFormatters = requireDir('./propFormatters');
const entrySerializers = requireDir('./entrySerializers');

const osHostname = require('os').hostname();

const Entry = require('./Entry');
const levels = require('./levels');


const {
	EMERGENCY,
	ALERT,
	CRITICAL,
	ERROR,
	WARNING,
	NOTICE,
	INFO,
	DEBUG
} = levels.constants;


const hop = ({}).hasOwnProperty;

function addProps(trg, src, format, propFormatters) {
	for (const key in src) {
		if (!hop.call(src, key)) {
			continue;
		}

		let value = src[key];
		const formatter = propFormatters[key];

		if (formatter) {
			if (formatter.parse) {
				value = formatter.parse(value);
			}

			if (formatter.format[format]) {
				value = formatter.format[format](value);
			}

			trg[key] = value;
		} else if (value && typeof value === 'object' && !Array.isArray(value)) {
			trg[key] = Object.create(null);
			addProps(trg[key], value, format, propFormatters);
		} else {
			trg[key] = value;
		}
	}
}


class Logger {
	constructor(options, data) {
		this._options = options || {};

		// cagey-logger custom options

		this._format = this._options.format || 'json';  // see /lib/entrySerializers
		this._hostname = this._options.hostname || osHostname;
		this._data = data;  // bunyan just pulls all keys off of "options", we have a dedicated data argument

		// bunyan options

		this._name = this._options.name;
		this._level = levels.toNum(this._options.level || 'info');
		this._stream = this._options.stream || process.stderr;

		// setup

		this._propFormatters = {};
		this._entrySerializers = {};
	}

	addPropertyFormatter(propName, api) {
		this._propFormatters[propName] = api;
	}

	addEntrySerializer(format, api) {
		this._entrySerializers[format] = api;
	}

	child(data) {
		let newData;

		if (data && this._data) {
			newData = Object.assign({}, this._data, data);
		} else if (this._data) {
			newData = this._data;
		} else {
			newData = data;
		}

		const child = new Logger(this._options, newData);

		child._propFormatters = this._propFormatters;
		child._entrySerializers = this._entrySerializers;

		return child;
	}

	_createEntry(level, data, msg) {
		let newData;

		if (this._data) {
			newData = Object.create(null);
			addProps(newData, this._data, this._format, this._propFormatters);
		}

		if (data) {
			newData = newData || Object.create(null);
			addProps(newData, data, this._format, this._propFormatters);
		}

		return new Entry(this._name, this._hostname, level, msg, newData);
	}

	_log(level, arg1, ...args) {
		let entry;

		if (arg1 && typeof arg1 === 'object') {
			const data = arg1;
			const msg = util.format(...args);

			entry = this._createEntry(level, data, msg);
		} else {
			const msg = util.format(arg1, ...args);

			entry = this._createEntry(level, null, msg);
		}

		const serialize = this._entrySerializers[this._format];

		if (!serialize) {
			throw new Error(`Unknown format: "${this._format}"`);
		}

		this._stream.write(serialize(entry), 'utf8');
	}

	debug(...args) {
		if (this._level >= DEBUG) {
			this._log('debug', ...args);
		}
	}

	info(...args) {
		if (this._level >= INFO) {
			this._log('info', ...args);
		}
	}

	notice(...args) {
		if (this._level >= NOTICE) {
			this._log('notice', ...args);
		}
	}

	warning(...args) {
		if (this._level >= WARNING) {
			this._log('warning', ...args);
		}
	}

	error(...args) {
		if (this._level >= ERROR) {
			this._log('error', ...args);
		}
	}

	critical(...args) {
		if (this._level >= CRITICAL) {
			this._log('critical', ...args);
		}
	}

	alert(...args) {
		if (this._level >= ALERT) {
			this._log('alert', ...args);
		}
	}

	emergency(...args) {
		if (this._level >= EMERGENCY) {
			this._log('emergency', ...args);
		}
	}
}


exports.create = function (options = undefined, data = undefined) {
	const logger = new Logger(options, data);

	for (const propName of Object.keys(propFormatters)) {
		logger.addPropertyFormatter(propName, propFormatters[propName]);
	}

	for (const format of Object.keys(entrySerializers)) {
		logger.addEntrySerializer(format, entrySerializers[format]);
	}

	return logger;
};
