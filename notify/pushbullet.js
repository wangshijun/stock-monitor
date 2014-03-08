/**
 * notify user via node-osx-notifier
 */
var request  = require('request'),
    PushBullet  = require('pushbullet'),
    util = require('util'),
    url = require('url'),
    Q = require('q'),
    template = require('es6-template-strings');

exports.notify = function (data, config, callback) {
    if (!config.apikey) {
        return util.log('stock-monitor: pushbullet notifer require apikey to work');
    }

    var pusher = new PushBullet(config.apikey);

    if (config.device) {
        sendNote(config.device)
            .fail(function (err) {
                util.error(JSON.stringify(err));
            });
    } else {
        getDevices()
            .then(sendNote)
            .fail(function (err) {
                util.error(JSON.stringify(err));
            });
    }

    // get device list
    function getDevices() {
        var d = Q.defer();

        pusher.devices(function(err, response) {
            if (err) {
                d.reject(err);
            } else {
                d.resolve(response);
            }
        });

        return d.promise;
    }

    // send message to device
    function sendNote(deviceInfo) {
        var d = Q.defer();

        // TODO sent to all devices
        if (typeof deviceInfo === 'object' && deviceInfo.devices instanceof Array) {
            var tasks = deviceInfo.devices.map(function (device) {
                var d = Q.defer();

                if (device.extras.nickname && device.extras.nickname.toLowerCase() === 'chrome') {
                    d.resolve({});
                } else {
                    pusher.note(device.id, data.title, data.message, function(err, response) {
                        util.log('PushBullet message send: ' + device.id);
                        if (err) {
                            d.reject(err);
                        } else {
                            d.resolve(response);
                        }
                    });
                }

                return d.promise;
            });

            Q.allSettled(tasks)
                .then(function () {
                    d.resolve({status: true, msg: 'send to all devices'});
                })
                .fail(function (err) {
                    d.reject(err);
                });

        // send to specified device
        } else {
            pusher.note(deviceInfo, data.title, data.message, function(err, response) {
                if (err) {
                    d.reject(err);
                } else {
                    d.resolve(response);
                }
            });

        }

        return d.promise;
    }

};


