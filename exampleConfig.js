/*

Required Variables:

    interval:           interval(ms) for the monitor to check stock prices

    stocks:             array of stocks you want to monitor, each item is a map
        uuid            stock uuid, go http://hq.sinajs.cn/?list={uuid} to verify this
        buyPrice        buy price, float number
        buyVolume       buy vloume, int
        minProfitRate   min profit rate that you want before sell it
        maxLossRate     max loss rate that you can suffer

    notify:             notify config object, possible methods: terminal, pushbullet
        on:             array of possible conditions: profit, loss, info
        type:           notify method
            pushbullet:     usefull when this run in background
            terminal:       usefull when you are at the computer
        apikey:         required when type is pushbullet
        host:           required when type is terminal
        port:           required when type is terminal

*/
{
    interval: 60000,
    notify: {
        on: ['profit', 'loss', 'info'],
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
