## 野火IM解决方案

野火IM是一套跨平台、全开源的即时通讯解决方案，主要包含以下内容。

| 仓库                                                         | 说明                                                    | 备注 |
| ------------------------------------------------------------ | ------------------------------------------------------- | ---- |
| [android-chat](https://github.com/wildfirechat/android-chat) | Android平台的SDK和Demo                                  |      |
| [ios-chat](https://github.com/wildfirechat/ios-chat)         | iOS平台的SDK和Demo                                      |      |
| [pc-chat](https://github.com/wildfirechat/pc-chat)           | 基于[Electron](https://electronjs.org/)开发的PC平台Demo |      |
| [proto](https://github.com/wildfirechat/proto)               | 野火IM的协议栈实现                                      |      |
| [server](https://github.com/wildfirechat/server)             | IM server                                               |      |
| [app server](https://github.com/wildfirechat/app_server)     | 应用服务端Demo                                          |      |
| [robot_server](https://github.com/wildfirechat/robot_server) | 机器人服务端Demo                                        |      |
| [push_server](https://github.com/wildfirechat/push_server)   | 推送服务器                                              |      |
| [docs](https://github.com/wildfirechat/docs)                 | 野火IM相关文档，包含设计、概念、开发、使用说明          |      |

# 

## pc-chat说明

本工程是野火IM PC平台，详情可以阅读[docs](http://docs.wildfirechat.cn).

开发一套IM系统真的很艰辛，请路过的朋友们给点个star，支持我们坚持下去🙏🙏🙏🙏🙏


### 联系我们
问题讨论请加群：822762829

微信公众号：

<img src="http://static.wildfirechat.cn/wx_wfc_qrcode.jpg" width = 50% height = 50% />


## 体验

可下载我们已编译好的可执行文件进行体验，[pc-chat 下载](https://github.com/wildfirechat/pc-chat/releases/tag/wfc0.1.7)

![login_qr](./screenshots/login_qr.png)

![home](./screenshots/home.png)



![chat](./screenshots/chat.png)



![create_conversation](./screenshots/create_conversation.png)

更多截图，请查看[wewechat readme](./README_wewechat.MD)



## 开发

***由于我们都是用mac进行开发，开发环境未适配Windows，故Windows上，可能编译不过。***

以下针对mac

```
$ cp proto_addon/marswrapper.mac.node marswrapper.node
$ npm install
$ npm run dev
```

更多信息，请查看[wewechat readme](./README_wewechat.MD)



## License

1. Under the MIT license. See the [LICENSE](https://github.com/wildfirechat/mars/blob/firechat/LICENSE) file for details.

2. Under the 996ICU License. See the [LICENSE](https://github.com/996icu/996.ICU/blob/master/LICENSE) file for details.

   

# 鸣谢

本项目基于[wewechat](https://github.com/trazyn/weweChat)开发，原项目的READ见[wewechat readme](./README_wewechat.MD)
