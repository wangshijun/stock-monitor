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

    console.log(config);

    var pusher = new PushBullet(config.apikey);

    if (config.device) {
        sendNote(config.device);
    } else {
        getDevices()
            .then(sendNote)
            .fail(function (error) {
                util.error(error);
            });
    }

    // get device list
    function getDevices() {
        var d = Q.defer();

        pusher.devices(function(error, response) {
            if (error) {
                d.reject(error);
            } else {
                d.resolve(response);
            }
        });

        return d.promise;
    }

    // send message to device
    function sendNote(deviceInfo) {
        var d = Q.defer();

        // send to specified device
        if (typeof deviceInfo === 'object') {
            pusher.note(deviceInfo, data.title, data.message, function(error, response) {
                if (error) {
                    d.reject(error);
                } else {
                    d.resolve(response);
                }
            });

        // TODO sent to all devices
        } else {
            util.log('send to all device');
            var devices = deviceInfo.devices;
            var tasks = devices.map(function (device) {
                var d = Q.defer();

                if (device.extra.model.toLowerCase() === 'chrome') {
                    d.resolve('chrome');
                }
                pusher.note(device.id, data.title, data.message, function(error, response) {
                    if (error) {
                        util.log(error);
                        d.reject(error);
                    } else {
                        util.log(response);
                        d.resolve(response);
                    }
                });

                return q.promise();
            });

            Q.allSettled(tasks)
                .then(function () {
                    d.resolve('send to all devices');
                })
                .fail(function (error) {
                    d.reject(error);
                });

        }

        return d.promise;
    }

};


