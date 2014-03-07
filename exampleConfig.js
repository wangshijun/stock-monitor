/*

Required Variables:


    stocks:             array of stocks you want to monitor, each item is a map
        uuid            stock uuid, go http://hq.sinajs.cn/?list={uuid} to verify this
        buyPrice        buy price, float number
        buyVolume       buy vloume, int
        minProfitRate   min profit rate that you want before sell it
        maxLossRate     max loss rate that you can suffer

    notify:             notify config object, possible methods: terminal, pushbullet
        pushbullet: you must specify your api key and device, usefull when this run in background
        terminal: choose which message types are notified, usefull when you are at the computer

    interval:           interval(ms) for the monitor to check stock prices

*/
{
    interval: 60000,
    notify: {
        type: 'pushbullet',
        apikey: 'YOUR API KEY HERE',
    },
    stocks: [
        {
            uuid: 'sz000418',
            buyPrice: 8.785,
            minProfitRate: 0.1,
            maxLossRate: 0.1,
        },
        {
            uuid: 'sz600804',
            buyPrice: 8.785,
            minProfitRate: 0.1,
            maxLossRate: 0.1,
        }
    ]
}
