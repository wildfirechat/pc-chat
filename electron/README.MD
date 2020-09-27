# Electron版本
打包时需要下载electron发布的版本，默认是从github上electron的release中下载。由于国内很多网络国际出口太窄，经常会下载超时。因此我们下载了放到这里，如果遇到下载超时，可以把本目录下的对应版本放到对应的平台上去。如果您升级了electron版本，也可以从[electron release](https://github.com/electron/electron/releases)下载对应版本。注意需要保持大版本与我们一致。

## Windows
下载[electron-v8.2.3-win32-ia32.zip](https://static.wildfirechat.cn/electron-v8.2.3-win32-ia32.zip)和[electron-v8.2.3-win32-x64.zip](https://static.wildfirechat.cn/electron-v8.2.3-win32-x64.zip)文件，放置到```C:\Users\%{当前用户名}%\AppData\Local\electron\Cache\```目录下。如果没有这个```electron```目录，可以手动创建。放置后，请再次运行打包命令查看是否起作用。

## Mac
下载[electron-v8.2.3-darwin-x64.zip](https://static.wildfirechat.cn/electron-v8.2.3-darwin-x64.zip)文件，放置到```~/Library/Caches/electron/```目录下。如果没有这个```electron```目录，可以手动创建。放置后，请再次运行打包命令查看是否起作用。

## Linux
根据当前Linux平台的架构，X86平台请下载[electron-v8.2.3-linux-x64.zip](https://static.wildfirechat.cn/electron-v8.2.3-linux-x64.zip)，Arm架构请下载[electron-v8.2.3-linux-arm64.zip](https://static.wildfirechat.cn/electron-v8.2.3-linux-arm64.zip)，文件放置到```~/.cache/electron```目录下。如果没有这个```electron```目录，可以手动创建。放置后，请再次运行打包命令查看是否起作用。
