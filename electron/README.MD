# Electron版本
打包时需要下载electron发布的版本，默认是从github上electron的release中下载。由于国内很多网络国际出口太窄，经常会下载超时。因此我们下载了放到这里，如果遇到下载超时，可以把本目录下的对应版本放到对应的平台上去。

## Windows

## Mac
把本目录下的```electron-v8.2.3-darwin-x64.zip```文件，放置到```~/Library/Caches/electron/```目录下。如果没有这个```electron```目录，可以手动创建。放置后，请再次运行打包命令查看是否起作用.

## Linux
