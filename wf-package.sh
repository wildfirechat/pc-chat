#!/bin/sh
echo "野火官方打包专用，请勿使用"
if [ $# != 1 ] ; then
  echo "USAGE: wf-package platform(mac, win, win32, linux or linux_arm64)"
  exit 1;
fi

echo $1
cp src/js/wfc/av/internal/engine-conference.min.js src/js/wfc/av/internal/engine.min.js
npm run "package-$1"

git checkout -- src/js/wfc/av/internal/engine.min.js
