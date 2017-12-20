'use strict';

// levels are based on Syslog: https://en.wikipedia.org/wiki/Syslog#Severity_level

const levels = {
	emergency: 0,
	alert: 1,
	critical: 2,
	error: 3,
	warning: 4,
	notice: 5,
	info: 6,
	debug: 7
};

const constants = {
	EMERGENCY: 0,
	ALERT: 1,
	CRITICAL: 2,
	ERROR: 3,
	WARNING: 4,
	NOTICE: 5,
	INFO: 6,
	DEBUG: 7
};

exports.constants = constants;

exports.toNum = function (str) {
	return levels[str];
};

exports.isError = function (level) {
	if (typeof level === 'string') {
		level = levels[level];
	}

	return level <= constants.ERROR;
};

exports.isWarning = function (level) {
	if (typeof level === 'string') {
		level = levels[level];
	}

	return level === constants.WARNING;
};
