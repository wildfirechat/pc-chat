## 野火IM解决方案

野火IM是一套跨平台开源的即时通讯解决方案，主要包含以下内容。

| 仓库                                                         | 说明                                                    | 备注 |
| ------------------------------------------------------------ | ------------------------------------------------------- | ---- |
| [android-chat](https://github.com/wildfirechat/android-chat) | 野火IM Android SDK源码和App源码                       |可以很方便地进行二次开发，或集成到现有应用当中      |
| [ios-chat](https://github.com/wildfirechat/ios-chat)         | 野火IM iOS SDK源码和App源码                            |可以很方便地进行二次开发，或集成到现有应用当中      |
| [pc-chat](https://github.com/wildfirechat/pc-chat)           | 基于[Electron](https://electronjs.org/)开发的PC平台应用 |      |
| [web-chat](https://github.com/wildfirechat/web-chat)          | Web平台的Demo, [体验地址](http://web.wildfirechat.cn)   |      |
| [wx-chat](https://github.com/wildfirechat/wx-chat)           | 微信小程序平台的Demo   |      |
| [server](https://github.com/wildfirechat/server)             | IM server                                               |      |
| [app server](https://github.com/wildfirechat/app_server)     | 应用服务端                                          |      |
| [robot_server](https://github.com/wildfirechat/robot_server) | 机器人服务端                                        |      |
| [push_server](https://github.com/wildfirechat/push_server)   | 推送服务器                                              |      |
| [docs](https://github.com/wildfirechat/docs)                 | 野火IM相关文档，包含设计、概念、开发、使用说明          |      | |

## pc-chat说明

本工程是野火IM PC平台，详情可以阅读[docs](http://docs.wildfirechat.cn).

开发一套IM系统真的很艰辛，请路过的朋友们给点个star，支持我们坚持下去🙏🙏🙏🙏🙏

### 联系我们

> 商务合作请优先采用邮箱和我们联系。技术问题请到[野火IM论坛](http://bbs.wildfirechat.cn/)发帖交流。

1. heavyrain.lee  邮箱: heavyrain.lee@wildfirechat.cn  微信：wildfirechat
2. imndx  邮箱: imndx@wildfirechat.cn  微信：wfchat


### 问题交流

1. 如果大家发现bug，请在GitHub提issue
2. 其他问题，请到[野火IM论坛](http://bbs.wildfirechat.cn/)进行交流学习
3. 微信公众号

<img src="http://static.wildfirechat.cn/wx_wfc_qrcode.jpg" width = 50% height = 50% />


## 体验

可下载我们已编译好的可执行文件进行体验，[pc-chat 下载](https://github.com/wildfirechat/pc-chat/releases)

![login_qr](./screenshots/login_qr.png)

![home](./screenshots/home.png)



![chat](./screenshots/chat.png)



![create_conversation](./screenshots/create_conversation.png)

更多截图，请查看[wewechat readme](./README_wewechat.MD)



## 开发

#### mac系统

##### 环境准备

> 请严格安装下面的版本安装对应依赖，否则无法打包

1. 最新版本的xcode
2. nodejs10.16.X
3. python2.7X
4. npm install -g node-gyp

##### 开发

```
$ cp proto_addon/marswrapper.mac.node marswrapper.node
$ npm install
$ npm run dev
```

> 如果```npm run dev```之后，不能显示二维码且调试窗口(```option + command + R```进入调试窗口)打印出```ERR_CONNECTION_REFUSED```，请```command + R```强制刷新一下


##### 打包

1. ```npm install``` 安装依赖
2. ```npm run package-win32``` 打包window版本，软件生成在release目录下(最新版mac系统移除对32位程序的支持，会打包失败，请在window下打包win平台）
3. ```npm run package-mac``` 打包mac版本，软件生成在release目录下


#### windows系统

##### 环境准备

> 请严格安装下面的版本安装对应依赖，否则无法打包

1. nodejs10.16.x （x86版本）
2. python2.7
3. Visual Studio Community 2015(C++ Runtime & Windows SDK version 8.1)
4. npm install -g node-gyp


##### 开发(在某些機器上運行npm run dev失敗，我們還沒有找到規律，如果無法npm run dev请打包安装验证，请跳过这一段，如果您知道原因也請聯係我們)
```
$ copy proto_addon\marswrapper.win32.node marswrapper.node
$ npm install
$ npm run dev
```

##### 打包
1. ```npm install``` 安装依赖
2. ```npm run package-win32``` 打包window版本，软件生成在release目录下

> mac下能打包出windows版本和mac版本。windows下只能打包出windows版本

#### linux系统

##### 环境准备

> 请严格安装下面的版本安装对应依赖，否则无法打包

1. nodejs10.16.X
2. python2.7X

##### 开发

```
$ cp proto_addon/marswrapper.linux.node marswrapper.node
$ npm install
$ npm run dev
```

##### 打包

1. ```npm install``` 安装依赖
2. ```npm run package-linux``` 打包linux版本，软件生成在release目录下


##### 常见问题
0. 执行```npm install```，需要确保网络通畅，如果遇到无法下载依赖等，可进行一下设置。

    1. 切换至[cnpm](http://npm.taobao.org/)，并设置环境变量
        ```
       // windows
       set ELECTRON_MIRROR=http://npm.taobao.org/mirrors/electron/
       set npm_config_dist-url=https://mirrors.cloud.tencent.com/nodejs-release/
       // mac/linux
       export ELECTRON_MIRROR=http://npm.taobao.org/mirrors/electron/
       export npm_config_dist-url=https://mirrors.cloud.tencent.com/nodejs-release/
       ```
    2. 执行```cnpm install```
1. 打包时，如果一直显示```installing production dependencies  platform=win32 arch=ia32 appDir=C:\<your path>\pc-chat\dist```，
   或者提示下载什么之类的，可将```dep```目录下对应平台的electron依赖，解压到对应的目录。
   ```
   // windows
   C:\Users\<你的用户名>/.electron-gyp
   // mac/linux
   ~/.electron-gyp
    ```
0. windows上需要严格按照环境进行安装，mac上环境比较简单一些，安装node和node-gyp就可以了
    另外如果还有问题，请试试命令```npm cache clean --force ```

1. 有些杀毒软件会对electron打包的软件报病毒，详情请参考[electron报病毒](https://www.baidu.com/s?wd=electron%20360%E6%8A%A5%E7%97%85%E6%AF%92&pn=0&oq=electron%20360%E6%8A%A5%E7%97%85%E6%AF%92&tn=84053098_3_dg&ie=utf-8&rsv_pq=ec2a876200198701&rsv_t=e981739vB2ZMksgGv8ZOV%2Fb4WIhJDXXzLTfMv24NmIN0itMzRiGjMNnh1qARt19Uzf1s%2FA)。安装时可能被杀毒软件限制安装，这时候可以让用户使用绿色免安装版（打包后release目录下的unpacked目录）。如果运行时报错，请在杀毒软件里加上例外。另外有条件的公司可以考虑去[360官方](https://open.soft.360.cn)或其他杀软的官方提交检测。

2. ubuntu下，启动时，若提示，```
                      A JavaScript error occurred in the main process
                      Uncaught Exception:
                      Error: Cannot open /opt/wildfirechat/resources/app.asar/marswrapper.node: Error: libdouble-conversion.so.1: cannot open shared object file: No such file or directory
                    ```，可安装[libdouble-conversion1](https://packages.debian.org/buster/libdouble-conversion1)解决



更多信息，请查看[wewechat readme](./README_wewechat.MD)



## License

1. Under the MIT license. See the [LICENSE](https://github.com/wildfirechat/mars/blob/firechat/LICENSE) file for details.

2. Under the 996ICU License. See the [LICENSE](https://github.com/996icu/996.ICU/blob/master/LICENSE) file for details.



# 鸣谢

本项目基于[wewechat](https://github.com/trazyn/weweChat)开发，原项目的READ见[wewechat readme](./README_wewechat.MD)
