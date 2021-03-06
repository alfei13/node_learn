'use strict'

var fs = require('fs')
var Promise = require('bluebird')

exports.readFileAsync = function (fpath, encoding) {
	// body...
	return new Promise(function(resolve, reject) {
		fs.readFile(fpath, encoding, function(err, content) {
			if (err) {reject(err)}
				else {resolve(content)}
		})
	})
}

exports.writeFileAsync = function (fpath, encoding) {
	// body...
	return new Promise(function(resolve, reject) {
		fs.writeFile(fpath, encoding, function(err, content) {
			if (err) {reject(err)}
				else {resolve()}
		})
	})
}