'use strict';

const chalk = require('chalk');
const EOL = require('os').EOL;

function prettyTime(time) {
	return `[${time.toISOString()}]`;
}

function prettyLevel(entry) {
	const level = entry.level.toUpperCase().padStart(10);

	let colored;

	if (entry.isError()) {
		colored = chalk.red(level);
	} else if (entry.isWarning()) {
		colored = chalk.magenta(level);
	} else {
		colored = chalk.cyan(level);
	}

	return `${colored}: `;
}

function prettyProcess(name, pid) {
	return `${name}/${pid}`;
}

function prettyHostname(hostname) {
	return ` on ${hostname}: `;
}

function prettyMessage(msg) {
	return chalk.cyan(msg);
}

const indentStr = '  ';

function prettyMultiLineString(str, indent) {
	const localIndentStr = indentStr.repeat(indent);

	const lines = str.split('\n');
	for (let i = 0; i < lines.length; i += 1) {
		lines[i] = localIndentStr + lines[i];
	}

	return EOL + lines.join('\n');
}

function prettyArray(data, indent) {
	const localIndentStr = indentStr.repeat(indent);

	let str = '';

	for (let i = 0; i < data.length; i += 1) {
		const value = data[i];
		const isLast = i === data.length - 1;

		const closer = isLast ? EOL : `,${EOL}`;

		if (Array.isArray(value)) {
			str += `${localIndentStr}[${EOL}` + prettyArray(value, indent + 1) + `${localIndentStr}]${closer}`;
		} else if (value && typeof value === 'object') {
			str += `${localIndentStr}{${EOL}` + prettyObject(value, indent + 1) + `${localIndentStr}}${closer}`;
		} else if (typeof value === 'string' && value.includes('\n')) {
			str += `${localIndentStr}` + prettyMultiLineString(value, indent + 1) + `${closer}`;
		} else {
			str += `${localIndentStr}${value}${closer}`;
		}
	}

	return str;
}

function prettyObject(data, indent) {
	const localIndentStr = indentStr.repeat(indent);

	let str = '';

	const keys = Object.keys(data);
	const lastKey = keys[keys.length - 1];

	for (const key of keys) {
		const value = data[key];
		const isLast = key === lastKey;

		const closer = isLast ? EOL : `,${EOL}`;

		if (Array.isArray(value)) {
			str += `${localIndentStr}${key}: [${EOL}` + prettyArray(value, indent + 1) + `${localIndentStr}]${closer}`;
		} else if (value && typeof value === 'object') {
			str += `${localIndentStr}${key}: {${EOL}` + prettyObject(value, indent + 1) + `${localIndentStr}}${closer}`;
		} else if (typeof value === 'string' && value.includes('\n')) {
			str += `${localIndentStr}${key}: ` + prettyMultiLineString(value, indent + 1) + `${closer}`;
		} else {
			str += `${localIndentStr}${key}: ${value}${closer}`;
		}
	}

	return str;
}

function prettyData(data, indent = 1) {
	if (!data) {
		return '';
	}

	return chalk.dim(Array.isArray(data) ? prettyArray(data, indent) : prettyObject(data, indent));
}

module.exports = function (entry) {
	const str =
		prettyTime(entry.time) +
		prettyLevel(entry) +
		prettyProcess(entry.name, entry.pid) +
		prettyHostname(entry.hostname) +
		prettyMessage(entry.msg) +
		EOL +
		prettyData(entry.data);

	return str;
};
