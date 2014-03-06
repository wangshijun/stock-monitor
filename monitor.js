/**
 * Stock Monitor
 * Alert you when the price is low or hign enough for you to sold
 */

var request  = require('request'),
    util = require('util'),
    url = require('url'),
    Q = require('q'),
    _ = require('lodash'),
    Iconv = require('iconv').Iconv,
    config = require('./lib/config'),
    template = require('es6-template-strings');

var api = url.parse('http://hq.sinajs.cn/'),
    iconv = new Iconv('GBK', 'UTF-8');

config.init(process.argv[2], function (conf, oldConf) {
    // console.log(conf);

    if (!conf.stocks) {
        return;
    }

    conf.interval = conf.interval || 60000;

    monitorAll();

    function monitorAll() {
        Q.allSettled(conf.stocks.map(monitorOne)).then(function () {
            setTimeout(monitorAll, conf.interval);
        }).fail(function (err) {
            util.log(err);
        }).done();
    }

    function monitorOne(stock) {
        var d = Q.defer();

        api.query = { list: stock.uuid };
        util.log(template('monitor: stock #${uuid}, ${url}', {url: url.format(api), uuid: stock.uuid}));

        request.get({ url: url.format(api), encoding: null }, function (err, response, body) {
            if (!err && response.statusCode === 200) {
                var response = iconv.convert(response.body).toString(),
                    matches = response.match(/\"([^\"]+)\"/g),
                    data, tmp;

                if (matches) {
                    tmp = matches[0].replace(/\"/g, '').split(',');
                    data = {
                        name: tmp[0].toString(),
                        todayStartPrice: Number(tmp[1]),
                        yesterdayEndPrice: Number(tmp[2]),
                        currentPrice: Number(tmp[3]),
                        todayMaxPrice: Number(tmp[4]),
                        todayMminPrice: Number(tmp[5]),
                    };

                    var delta = (data.currentPrice - stock.buyPrice).toFixed(3);
                    var ratio = (delta / stock.buyPrice).toFixed(4) * 100;
                    var config = {
                        name: data.name,
                        buyPrice: stock.buyPrice.toFixed(3),
                        profit: (stock.buyVolume * delta).toFixed(3),
                        currentPrice: data.currentPrice.toFixed(3),
                        delta: delta,
                        ratio: ratio
                    };

                    if (ratio >= stock.minProfitRate * 100) {
                        config.type = 'pass';
                        config.direction = '上升';
                        config.status = '赚了';
                        config.tip = ', 见好就收吧';
                    } else if (ratio <= stock.maxLossRate * 100) {
                        config.type = 'fail';
                        config.direction = '下跌';
                        config.status = '赔了';
                        config.tip = ', 赶紧止损吧';
                    } else {
                        config.type = 'info';
                        config.direction = ratio > 0 ? '上升' : '下降';
                        config.status = ratio > 0 ? '赚了' : '赔了';
                        config.tip = '';
                    }

                    notify(config, function () {
                        d.resolve(config);
                    });

                } else {
                    d.reject('unable to parse stock data');
                }

            } else {
                q.reject(err);
            }
        });

        return d.promise;
    }

    function notify(config, callback) {
        var url = 'http://127.0.0.1:1337/' + config.type;
        var message = template('股票"${name}"价格刚从购买时的${buyPrice}元${direction}到${currentPrice}元,相比较购买时${direction}了${delta}元(${ratio}%)${tip},${status}${profit}元', config);
        var data = {
            title: '股价观察员',
            message: message
        };

        // console.log('notify url: ' + url);
        // console.log('notify conf: ' + JSON.stringify(config));

        request({url: url, json: true, body: data, method: 'POST'}, function (err, response, body) {
            if (!err && response.statusCode === 200) {
                callback(response.body.status);
            } else {
                console.log(err);
            }
        });
    }

});

