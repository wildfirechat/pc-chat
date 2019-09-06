DEL /F /A /Q package.json
copy package-win32.json package.json
npm install && npm run package-win32 && copy release\wildfirechat*.exe ..\Output\ && 7z a unpacked.zip release\win-ia32-unpacked\ && copy unpacked.zip ..\Output\ && cd .. && echo "finish build pc"
