Stock Monitor
=============
实时监控股价，在设定的条件满足之后通知用户，可以通过系统通知、短信等方式。


背后的故事
----------
通货膨胀那么厉害，眼睁睁的看着我们的工资贬值么？投货币基金？风险是低，收益也很低，投资股票？我们要工作，哪里有时间在关键的时刻买入或者卖出你做了很多功课才相中的股票呢？Stock Monitor就是为你做这个事情而来，比如你研究了半天发现小天鹅A的股票有些前景，可是目前股价处于高位，你想等降点再买，可以简单的配置下，让Stock Monitor帮你看着股价，降到你设定的阈值就会收到买入的通知。

程序依赖
---------
* PushBullet 如果你想通过收短信的方式，需要去开启这个服务，并配置自己的APIKey
* Node-OSX-Notifier 如果想通过系统通知，需要安装这个包，启动为后台进程，并配置接口地址

使用方法
---------


程序结构
--------

```
.
├── README.md
├── config.js               // 配置文件
├── exampleConfig.js        // 配置示例
├── lib
│   └── config.js
├── monitor.js              // 主程序
├── notify                  // 推送引擎
│   ├── pushbullet.js       // pushbullet推送引擎
│   └── terminal.js         // node-osx-notifier推送引擎
└── package.json
````

特别感谢
----------

* PushBullet 提供的免费短信推送服务
* Node-OSX-Notifier 提供的系统通知封装服务，目前只支持Mac

