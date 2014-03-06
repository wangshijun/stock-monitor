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
        conf.stocks.forEach(monitorOne);
        setTimeout(monitorAll, conf.interval);
    }

    function monitorOne(stock) {
        var d = Q.defer();

        api.query = { list: stock.uuid };
        request.get({ url: url.format(api), encoding: null }, function (err, response, body) {
            if (!err && response.statusCode === 200) {
                var response = iconv.convert(response.body).toString(),
                    matches = response.match(/\"([^\"]+)\"/g),
                    data, tmp;

                if (matches) {
                    tmp = matches[0].replace(/\"/g, '').split(',');
                    data = {
                        name: tmp[0],
                        todayStartPrice: tmp[1],
                        yesterdayEndPrice: tmp[2],
                        currentPrice: tmp[3],
                        todayMaxPrice: tmp[4],
                        todayMminPrice: tmp[5],
                    };

                    var delta = data.currentPrice - stock.buyPrice;
                    var ratio = delta / stock.buyPrice;
                    var notify = { type: 'info', message: '' };

                    if (ratio >= stock.minProfitRate) {
                        notify.type = 'pass';
                        notify.message = template('你购买的股票${name}目前价格已经跌到${currentPrice}了');
                    } else if (ratio <= stock.maxLossRate) {
                        notify.type = 'fail';
                    } else {
                    }

                    console.log(data);
                    d.resolve(notify);

                } else {
                    d.reject('unable to parse stock data');
                }

            } else {
                q.reject(err);
            }
        });

        return d.promise;
    }

    function notify(config) {
    }

});

