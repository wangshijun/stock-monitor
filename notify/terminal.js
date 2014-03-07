/**
 * notify user via node-osx-notifier
 */
var request  = require('request'),
    util = require('util'),
    url = require('url'),
    template = require('es6-template-strings');

exports.notify = function (data, config, callback) {
    config.host = config.host || '127.0.0.1';
    config.port = config.port || '1337';

    config.type = 'info';
    if (data.type === 'profit') {
        config.type = 'pass';
    }
    if (data.type === 'loss') {
        config.type = 'fail';
    }

    var url = template('http://${host}:${port}/${type}', config);

    // console.log('notify url: ' + url);
    // console.log('notify conf: ' + JSON.stringify(data));
    // required attr of data: title, message

    request({url: url, json: true, body: data, method: 'POST'}, function (err, response, body) {
        if (!err && response.statusCode === 200) {
            if (callback) {
                callback(response.body.status);
            }
        } else {
            util.log(err);
        }
    });

};

