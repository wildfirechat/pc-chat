if [ -n "$1" ];then
  codesign --sign $1 --force mac-qt-denpendency/app/wfshot.app/Contents/PlugIns/bearer/*.dylib
  codesign --sign $1 --force mac-qt-denpendency/app/wfshot.app/Contents/PlugIns/iconengines/*.dylib
  codesign --sign $1 --force mac-qt-denpendency/app/wfshot.app/Contents/PlugIns/imageformats/*.dylib
  codesign --sign $1 --force mac-qt-denpendency/app/wfshot.app/Contents/PlugIns/platforms/*.dylib
  codesign --sign $1 --force mac-qt-denpendency/app/wfshot.app/Contents/PlugIns/printsupport/*.dylib
  codesign --sign $1 --force mac-qt-denpendency/app/wfshot.app/Contents/PlugIns/styles/*.dylib

  codesign --sign $1 --force mac-qt-denpendency/app/wfshot.app/Contents/Frameworks/QtCore.framework
  codesign --sign $1 --force mac-qt-denpendency/app/wfshot.app/Contents/Frameworks/QtDBus.framework
  codesign --sign $1 --force mac-qt-denpendency/app/wfshot.app/Contents/Frameworks/QtGui.framework
  codesign --sign $1 --force mac-qt-denpendency/app/wfshot.app/Contents/Frameworks/QtNetwork.framework
  codesign --sign $1 --force mac-qt-denpendency/app/wfshot.app/Contents/Frameworks/QtPrintSupport.framework
  codesign --sign $1 --force mac-qt-denpendency/app/wfshot.app/Contents/Frameworks/QtSvg.framework
  codesign --sign $1 --force mac-qt-denpendency/app/wfshot.app/Contents/Frameworks/QtWidgets.framework

  codesign --sign $1 --force mac-qt-denpendency/app/wfshot.app
else
  echo "使用方法：sh $0 signcode"
  echo "signcode是你的证书编号，可以先编译一遍mac版本，会出现如下的错误提示"
  echo ""
  echo "⨯ Command failed: codesign --sign EACAEF96A100626DC13376F03E7F9E5D33A270AE --force --options runtime --entitlements /Users/dali/Workspace/pc-chat/node_modules/app-builder-lib/templates/entitlements.mac.plist /Users/dali/Workspace/pc-chat/release/mac/wildfirechat.app/Contents/MacOS/wildfirechat"
  echo ""
  echo "其中 EACAEF96A100626DC13376F03E7F9E5D33A270AE 就是signcode。可以使用 'sh $0 EACAEF96A100626DC13376F03E7F9E5D33A270AE' 来签名"
fi
