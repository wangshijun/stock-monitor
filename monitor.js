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
    if (!conf.notify) {         // default notify method
        conf.notify = {
            on: ['profit', 'loss', 'info'],
            type: 'terminal',
        };
    }

    // include notify engine
    // TODO error tollerance
    var engine = require('./notify/' + conf.notify.type);

    monitorAll();

    function monitorAll() {
        Q.allSettled(conf.stocks.map(monitorOne)).then(function () {
            setTimeout(monitorAll, conf.interval);
        }).fail(function (err) {
            util.log(err);
        }).done();
    }

    function monitorOne(stock, index) {
        var d = Q.defer();

        api.query = { list: stock.uuid };
        util.log(template('monitor: stock #${uuid}, ${url}', {url: url.format(api), uuid: stock.uuid}));

        request.get({ url: url.format(api), encoding: null }, function (err, response, body) {
            if (!err && response.statusCode === 200) {
                var response = iconv.convert(response.body).toString(),
                    matches = response.match(/\"([^\"]+)\"/g),
                    info, tmp;

                if (matches) {
                    tmp = matches[0].replace(/\"/g, '').split(',');
                    info = {
                        name: tmp[0].toString(),
                        todayStartPrice: Number(tmp[1]),
                        yesterdayEndPrice: Number(tmp[2]),
                        currentPrice: Number(tmp[3]),
                        todayMaxPrice: Number(tmp[4]),
                        todayMminPrice: Number(tmp[5]),
                    };

                    var delta = (info.currentPrice - stock.buyPrice).toFixed(2);
                    var ratio = (delta / stock.buyPrice * 100).toFixed(2);
                    var data = {
                        index: index,
                        group: stock.uuid,
                        name: info.name,
                        buyPrice: stock.buyPrice.toFixed(2),
                        profit: Math.abs((stock.buyVolume * delta).toFixed(2)),
                        currentPrice: info.currentPrice.toFixed(2),
                        delta: Math.abs(delta),
                        ratio: Math.abs(ratio)
                    };

                    if (ratio >= stock.minProfitRate * 100) {
                        data.type = 'profit';
                        data.direction = '上升';
                        data.status = '赚了';
                        data.tip = ', 见好就收吧';
                    } else if (ratio <= stock.maxLossRate * 100) {
                        data.type = 'loss';
                        data.direction = '下跌';
                        data.status = '赔了';
                        data.tip = ', 赶紧止损吧';
                    } else {
                        data.type = 'info';
                        data.direction = ratio > 0 ? '上升' : '下降';
                        data.status = ratio > 0 ? '赚了' : '赔了';
                        data.tip = '';
                    }

                    notify(data, function () {
                        d.resolve(data);
                    });

                } else {
                    d.reject('unable to parse stock info');
                }

            } else {
                q.reject(err);
            }
        });

        return d.promise;
    }

    function notify(data, callback) {
        var config = conf.notify;
        if (config.on.indexOf(data.type) === -1) {
            return;
        }
        setTimeout(function () {
            var message = template('股票"${name}"价格从${buyPrice}元${direction}到${currentPrice}元, 相比购买时${direction}了${delta}元(${ratio}%)${tip}, 共${status}${profit}元', data);
            engine.notify({
                type: data.type,
                title: '股价观察员',
                message: message
            }, config, callback);
        }, data.index * 3000);
    }

});

