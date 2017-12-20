'use strict';

exports.parse = function (req) {
	return {
		method: req.method,
		url: req.url,
		httpVersion: req.httpVersion,
		headers: req.headers
	};
};


exports.format = {
	human(req) {
		return {
			request: `${req.method} ${req.url} ${req.httpVersion}`,
			headers: req.headers
		};
	}
};
