'use strict';

const levels = require('./levels');

class Entry {
	constructor(name, hostname, level, msg, data) {
		this.name = name;
		this.hostname = hostname;
		this.pid = process.pid;
		this.level = level;
		this.time = new Date();
		this.msg = msg;
		this.data = data;
	}

	getLevelNum() {
		return levels.toNum(this.level);
	}

	isWarning() {
		return levels.isWarning(this.level);
	}

	isError() {
		return levels.isError(this.level);
	}
}

module.exports = Entry;
