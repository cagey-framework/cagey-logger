'use strict';

const util = require('util');
const requireDir = require('require-dir');
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


exports.stdOutputFormats = requireDir('./stdOutputFormats');
exports.stdSerializers = requireDir('./stdSerializers');


function addProps(trg, src, format, serializers) {
	for (const key of Object.keys(src)) {
		let value = src[key];
		const serializer = serializers[key];

		if (serializer) {
			if (serializer.parse) {
				value = serializer.parse(value);
			}

			if (serializer.format[format]) {
				value = serializer.format[format](value);
			}

			trg[key] = value;
		} else if (value && typeof value === 'object' && !Array.isArray(value)) {
			trg[key] = Object.create(null);
			addProps(trg[key], value, format, serializers);
		} else {
			trg[key] = value;
		}
	}
}


class Logger {
	constructor(options = {}, data = undefined) {
		// default values

		const stream = options.stream || process.stderr;

		this._options = {
			format: options.format || (stream.isTTY ? 'human' : 'json'),
			hostname: options.hostname || osHostname,
			name: options.name || undefined,
			level: options.level || 'info',
			stream,
			outputFormats: Object.assign({}, options.outputFormats || exports.stdOutputFormats),
			serializers: Object.assign({}, options.serializers || exports.stdSerializers)
		};

		// cagey-logger custom options

		this._format = this._options.format;  // see /lib/stdOutputFormats
		this._hostname = this._options.hostname;
		this._formatOutput = this._options.outputFormats[this._format];
		this._data = data;  // bunyan just pulls all keys off of "options", we have a dedicated data argument

		// bunyan options

		this._name = this._options.name;
		this._level = levels.toNum(this._options.level);
		this._stream = this._options.stream;
		this._serializers = this._options.serializers;

		// sanity checks

		if (!this._formatOutput) {
			throw new Error(`Unsupported output format "${this._format}"`);
		}
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

		return new Logger(this._options, newData);
	}

	_createEntry(level, data, msg) {
		let newData;

		if (this._data) {
			newData = Object.create(null);
			addProps(newData, this._data, this._format, this._serializers);
		}

		if (data) {
			newData = newData || Object.create(null);
			addProps(newData, data, this._format, this._serializers);
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

		this._stream.write(this._formatOutput(entry), 'utf8');
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


exports.create = function (options, data) {
	return new Logger(options, data);
};
