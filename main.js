
import fs from 'fs';
import tmp from 'tmp';
import { app, powerMonitor, BrowserWindow, Tray, Menu, ipcMain, clipboard, shell, nativeImage, dialog, globalShortcut } from 'electron';
import windowStateKeeper from 'electron-window-state';
import AutoLaunch from 'auto-launch';
import { autoUpdater } from 'electron-updater';
import axios from 'axios';
import i18n from 'i18n';
import proto from './marswrapper.node';

import pkg from './package.json';

let Locales = {};
i18n.configure({
    locales:['en', 'ch'],
    directory: __dirname + '/locales',
    register: Locales
});
Locales.setLocale('ch');

global.sharedObj = {proto: proto};

let forceQuit = false;
let downloading = false;
let mainWindow;
let tray;
let settings = {};
let isFullScreen = false;
let isWin = process.platform === 'win32';
let isOsx = process.platform === 'darwin';
let isSuspend = false;
let userData = app.getPath('userData');
let imagesCacheDir = `${userData}/images`;
let voicesCacheDir = `${userData}/voices`;
let mainMenu = [
    {
        label: pkg.name,
        submenu: [
            {
                label: `About ${pkg.name}`,
                selector: 'orderFrontStandardAboutPanel:',
            },
            {
                label: Locales.__('Main').Preferences,
                accelerator: 'Cmd+,',
                click() {
                    mainWindow.show();
                    mainWindow.webContents.send('show-settings');
                }
            },
            {
                type: 'separator'
            },
            {
                role: 'hide'
            },
            {
                role: 'hideothers'
            },
            {
                role: 'unhide'
            },
            {
                label: Locales.__('Main').Check,
                accelerator: 'Cmd+U',
                click() {
                    checkForUpdates();
                }
            },
            {
                type: 'separator'
            },
            {
                label: Locales.__('Main').Quit,
                accelerator: 'Command+Q',
                selector: 'terminate:',
                click() {
                    forceQuit = true;
                    mainWindow = null;
                    app.quit();
                }
            }
        ]
    },
    {
        label: Locales.__('File').Title,
        submenu: [
            {
                label: Locales.__('File').New,
                accelerator: 'Cmd+N',
                click() {
                    mainWindow.show();
                    mainWindow.webContents.send('show-newchat');
                }
            },
            {
                label: Locales.__('File').Search,
                accelerator: 'Cmd+F',
                click() {
                    mainWindow.show();
                    mainWindow.webContents.send('show-search');
                }
            },
            {
                label: Locales.__('File').BatchSend,
                accelerator: 'Cmd+B',
                click() {
                    mainWindow.show();
                    mainWindow.webContents.send('show-batchsend');
                }
            },
            {
                type: 'separator',
            },
            {
                label: Locales.__('File').InsertEmoji,
                accelerator: 'Cmd+I',
                click() {
                    mainWindow.show();
                    mainWindow.webContents.send('show-emoji');
                }
            },
            {
                type: 'separator',
            },
            {
                label: Locales.__('File').Next,
                accelerator: 'Cmd+J',
                click() {
                    mainWindow.show();
                    mainWindow.webContents.send('show-next');
                }
            },
            {
                label: Locales.__('File').Prev,
                accelerator: 'Cmd+K',
                click() {
                    mainWindow.show();
                    mainWindow.webContents.send('show-previous');
                }
            },
        ]
    },
    // {
    //     label: Locales.__('Conversations').Title,
    //     submenu: [
    //         {
    //             label: Locales.__('Conversations').Loading,
    //         }
    //     ],
    // },
    // {
    //     label: Locales.__('Contacts').Title,
    //     submenu: [
    //         {
    //             label: Locales.__('Contacts').Loading,
    //         }
    //     ],
    // },
    {
        label: Locales.__('Edit').Title,
        submenu: [
            {
                role: 'undo',
                label: Locales.__('Edit').Undo
            },
            {
                role: 'redo',
                label: Locales.__('Edit').Redo
            },
            {
                type: 'separator'
            },
            {
                role: 'cut',
                label: Locales.__('Edit').Cut
            },
            {
                role: 'copy',
                label: Locales.__('Edit').Copy
            },
            {
                role: 'paste',
                label: Locales.__('Edit').Paste
            },
            {
                role: 'pasteandmatchstyle',
                label: Locales.__('Edit').PasteMatch
            },
            {
                role: 'delete',
                label: Locales.__('Edit').Delete
            },
            {
                role: 'selectall',
                label: Locales.__('Edit').SelectAll
            }
        ]
    },
    {
        label: Locales.__('View').Title,
        submenu: [
            {
                label: isFullScreen ? Locales.__('View').ExitFull : Locales.__('View').EnterFull,
                accelerator: 'Shift+Cmd+F',
                click() {
                    isFullScreen = !isFullScreen;

                    mainWindow.show();
                    mainWindow.setFullScreen(isFullScreen);
                }
            },
            {
                label: Locales.__('View').ToggleConversations,
                accelerator: 'Shift+Cmd+M',
                click() {
                    mainWindow.show();
                    mainWindow.webContents.send('show-conversations');
                }
            },
            {
                type: 'separator',
            },
            {
                type: 'separator',
            },
            {
                role: 'toggledevtools',
                label: Locales.__('View').ToggleDevtools
            },
            {
                role: 'togglefullscreen',
                label: Locales.__('View').ToggleFull
            }
        ]
    },
    {
        lable: Locales.__('Window').Title,
        role: 'window',
        submenu: [
            {
                lable: Locales.__('Window').Min,
                role: 'minimize'
            },
            {
                lable: Locales.__('Window').Close,
                role: 'close'
            }
        ]
    },
    {
        lable: Locales.__('Help').Title,
        role: 'help',
        submenu: [
            {
                label: Locales.__('Help').FeedBack,
                click() {
                    shell.openExternal('https://github.com/wildfirechat/pc-chat/issues');
                }
            },
            {
                label: Locales.__('Help').Fork,
                click() {
                    shell.openExternal('https://github.com/wildfirechat/pc-chat');
                }
            },
            {
                type: 'separator'
            },
            // {
            //     label: '💕 Follow me on Twitter 👏',
            //     click() {
            //         shell.openExternal('https://twitter.com/var_darling');
            //     }
            // }
            {
                role: 'reload',
                label: Locales.__('Help').Reload
            },
            {
                role: 'forcereload',
                label: Locales.__('Help').ForceReload
            },
        ]
    }
];
let trayMenu = [
    // {
    //     label: `你有 0 条消息`,
    //     click() {
    //         mainWindow.show();
    //         mainWindow.webContents.send('show-messages');
    //     }
    // },
    {
        label: '切换主窗口',
        click() {
            let isVisible = mainWindow.isVisible();
            isVisible ? mainWindow.hide() : mainWindow.show();
        }
    },
    {
        type: 'separator'
    },
    {
        label: '偏好...',
        accelerator: 'Cmd+,',
        click() {
            mainWindow.show();
            mainWindow.webContents.send('show-settings');
        }
    },
    {
        label: Locales.__('Help').Fork,
        click() {
            shell.openExternal('https://github.com/wildfirechat/pc-chat');
        }
    },
    {
        type: 'separator'
    },
    {
        label: Locales.__('View').ToggleDevtools,
        accelerator: 'Alt+Command+I',
        click() {
            mainWindow.show();
            mainWindow.toggleDevTools();
        }
    },
    // {
    //     label: 'Hide menu bar icon',
    //     click() {
    //         mainWindow.webContents.send('hide-tray');
    //     }
    // },
    {
        type: 'separator'
    },
    {
        label: Locales.__('Main').Check,
        accelerator: 'Cmd+U',
        click() {
            checkForUpdates();
        }
    },
    {
        label: Locales.__('Main').Quit,
        accelerator: 'Command+Q',
        selector: 'terminate:',
        click() {
            forceQuit = true;
            mainWindow = null;
            global.sharedObj.proto.disconnect(0);
            console.log('--------------- disconnect', global.sharedObj.proto);
            var now = new Date();
            var exitTime = now.getTime() + 1000;
            while (true) {
                now = new Date();
                if (now.getTime() > exitTime)
                    break;
            }
            app.exit(0);
        }
    }
];
let avatarPath = tmp.dirSync();
let avatarCache = {};
let avatarPlaceholder = `${__dirname}/src/assets/images/user-fallback.png`;
const icon = `${__dirname}/src/assets/images/dock.png`;
let blink = null

async function getIcon(cookies, userid, src) {
    var cached = avatarCache[userid];
    var icon;

    if (cached) {
        return cached;
    }

    if (cookies && src) {
        try {
            let response = await axios({
                url: src,
                method: 'get',
                responseType: 'arraybuffer',
                headers: {
                    Cookie: cookies,
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/603.3.8 (KHTML, like Gecko) Version/10.1.2 Safari/603.3.8',
                },
            });
            // eslint-disable-next-line
            let base64 = new Buffer(response.data, 'binary').toString('base64');

            icon = `${avatarPath.name}/${userid}.jpg`;
            fs.writeFileSync(icon, base64.replace(/^data:image\/png;base64,/, ''), 'base64');
        } catch (ex) {
            console.error(ex);
            icon = avatarPlaceholder;
        }
    }

    var image = nativeImage.createFromPath(icon);

    image = image.resize({ width: 24, height: 24 });

    avatarCache[userid] = image;

    return image;
}

function checkForUpdates() {
    if (downloading) {
        dialog.showMessageBox({
            type: 'info',
            buttons: ['OK'],
            title: pkg.name,
            message: `Downloading...`,
            detail: `Please leave the app open, the new version is downloading. You'll receive a new dialog when downloading is finished.`
        });

        return;
    }

    autoUpdater.checkForUpdates();
}

function updateTray(unread = 0) {
    if (!isOsx) {
        // Always show the tray icon on windows
        settings.showOnTray = true;
    }

    // Update unread mesage count
    // trayMenu[0].label = `你有 ${unread} 条信息`;

    if (settings.showOnTray) {
        if (tray
            && updateTray.lastUnread === unread) {
            return;
        }

        let contextmenu = Menu.buildFromTemplate(trayMenu);
        let icon = `${__dirname}/src/assets/images/icon.png`;

        // Make sure the last tray has been destroyed
        setTimeout(() => {
            if (!tray) {
                // Init tray icon
                tray = new Tray(icon);

                tray.on('right-click', () => {
                    tray.popUpContextMenu();
                });

                tray.on('click', () => {
                    let isVisible = mainWindow.isVisible();
                    isVisible ? mainWindow.hide() : mainWindow.show();
                });
            }

            tray.setImage(icon);
            tray.setContextMenu(contextmenu);
            execBlink(unread > 0);
            // Avoid tray icon been recreate
            updateTray.lastUnread = unread;
        });
    } else {
        if (!tray) return;

        if (!isOsx) {
          tray.destroy();
        }
        tray = null;
    }


}

async function autostart() {
    var launcher = new AutoLaunch({
        name: 'wildfireChat',
        path: '/Applications/wildfirechat.app',
    });

    if (settings.startup) {
        if (!isOsx) {
            mainWindow.webContents.send('show-errors', {
                message: 'Currently only supports the OSX.'
            });
            return;
        }

        launcher.enable()
            .catch(ex => {
                console.error(ex);
            });
    } else {
        launcher.disable();
    }
}

function createMenu() {
    var menu = Menu.buildFromTemplate(mainMenu);

    if (isOsx) {
        Menu.setApplicationMenu(menu);
    } else {
        mainWindow.setMenu(null);
    }
}

function regShortcut() {
    // if(isWin) {
        globalShortcut.register('CommandOrControl+G', () => {
            mainWindow.webContents.toggleDevTools();
        })
    // }
}

const createMainWindow = () => {
    var mainWindowState = windowStateKeeper({
        defaultWidth: 900,
        defaultHeight: 600,
    });

    mainWindow = new BrowserWindow({
        x: mainWindowState.x,
        y: mainWindowState.y,
        minWidth: 400,
        minHeight: 400,
        titleBarStyle: 'hiddenInset',
        backgroundColor: 'none',
        // 以下两属性设置时会导致win不能正常unmaximize. electron bug
        // transparent: true,
        // resizable: false,
        webPreferences: {
            scrollBounce: true
        },
        frame: !isWin,
        icon
    });

    mainWindow.setSize(400, 480);
    mainWindow.loadURL(
        `file://${__dirname}/src/index.html`
    );
    mainWindow.webContents.on('did-finish-load', () => {
        try {
            mainWindow.show();
            mainWindow.focus();
        } catch (ex) { }
    });

    mainWindow.webContents.on('new-window', (event, url) => {
        event.preventDefault();
        shell.openExternal(url);
    });

    mainWindow.on('close', e => {
        if (forceQuit || !tray) {
            mainWindow = null;
            app.quit();
        } else {
            e.preventDefault();
            mainWindow.hide();
        }
    });

    ipcMain.on('settings-apply', (event, args) => {
        settings = args.settings;
        mainWindow.setAlwaysOnTop(!!settings.alwaysOnTop);

        try {
            updateTray();
            autostart();
        } catch (ex) {
            console.error(ex);
        }
    });

    ipcMain.on('show-window', event => {
        if (!mainWindow.isVisible()) {
            mainWindow.show();
            mainWindow.focus();
        }
    });

    ipcMain.on('close-window', event => {
        mainWindow.hide();
    });

    // ipcMain.on('min-window', event => {
    //     mainWindow.minimize();
    // });

    // ipcMain.on('max-window', event => {
    //     mainWindow.maximize();
    // });

    ipcMain.on('unmax-window', event => {
        mainWindow.unmaximize();
    });

    ipcMain.on('toggle-max', event => {
        var isMax = mainWindow.isMaximized();
        if(isMax){
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
    });

    ipcMain.on('exec-blink', (event, args) => {
        var isBlink = args.isBlink;
        execBlink(isBlink, args.interval);
    });

    // TODO 不明白这儿是做什么？
    ipcMain.on('menu-update', async (event, args) => {
        var { cookies, contacts = [], conversations = [] } = args;
        var conversationsMenu = mainMenu.find(e => e.label === 'Conversations');
        var contactsMenu = mainMenu.find(e => e.label === 'Contacts');
        var shouldUpdate = false;

        if (!isOsx) {
            return;
        }

        if (conversations.length
            && conversations.map(e => e.name).join() !== conversationsMenu.submenu.map(e => e.label).join()) {
            shouldUpdate = true;

            conversations = await Promise.all(
                conversations.map(async (e, index) => {
                    let icon = await getIcon(cookies, e.id, e.avatar);

                    return {
                        label: e.name,
                        accelerator: `Cmd+${index}`,
                        icon,
                        click() {
                            mainWindow.show();
                            mainWindow.webContents.send('message-chatto', {
                                id: e.id,
                            });
                        }
                    };
                })
            );
            conversationsMenu.submenu = conversations;
        }

        if (contacts.length) {
            shouldUpdate = true;

            contacts = await Promise.all(
                contacts.map(async e => {
                    let icon = await getIcon(cookies, e.id, e.avatar);

                    return {
                        label: e.name,
                        icon,
                        click() {
                            mainWindow.show();
                            mainWindow.webContents.send('show-userinfo', {
                                id: e.id,
                            });
                        }
                    };
                })
            );
            contactsMenu.submenu = contacts;
        }

        if (shouldUpdate) {
            createMenu();
        }
    });

    ipcMain.on('message-unread', (event, args) => {
        var counter = args.counter;
        //if (settings.showOnTray) {
            updateTray(counter);
        //}
    });

    ipcMain.on('file-paste', (event) => {
        var image = clipboard.readImage();
        var args = { hasImage: false };

        if (!image.isEmpty()) {
            let filename = tmp.tmpNameSync() + '.png';

            args = {
                hasImage: true,
                filename: filename,
                raw: image.toPNG(),
            };

            fs.writeFileSync(filename, image.toPNG());
        }

        event.returnValue = args;
    });

    ipcMain.on('file-download', async (event, args) => {
        var filename = args.filename;

        // TODO bug here
        fs.writeFileSync(filename, args.raw.replace(/^data:image\/png;base64,/, ''), {
            encoding: 'base64',
            // Overwrite file
            flag: 'wx',
        });
        event.returnValue = filename;
    });

    ipcMain.on('open-file', async (event, filename) => {
        shell.openItem(filename);
    });

    ipcMain.on('open-folder', async (event, dir) => {
        shell.openItem(dir);
    });

    ipcMain.on('open-map', (event, args) => {
        event.preventDefault();
        shell.openExternal(args.map);
    });

    ipcMain.on('open-image', async (event, args) => {
        var filename = `${imagesCacheDir}/img_${args.dataset.id}`;

        fs.writeFileSync(filename, args.base64.replace(/^data:image\/png;base64,/, ''), 'base64');
        shell.openItem(filename);
    });

    ipcMain.on('is-suspend', (event, args) => {
        event.returnValue = isSuspend;
    });

    ipcMain.once('logined', event => {
        mainWindow.setResizable(true);
        mainWindow.setSize(mainWindowState.width, mainWindowState.height);
        mainWindowState.manage(mainWindow);
    });

    powerMonitor.on('resume', () => {
        isSuspend = false;
        mainWindow.webContents.send('os-resume');
    });

    powerMonitor.on('suspend', () => {
        isSuspend = true;
    });

    if (isOsx) {
        app.setAboutPanelOptions({
            applicationName: pkg.name,
            applicationVersion: pkg.version,
            copyright: 'Made with 💖 by trazyn && wildfiechat. \n https://github.com/wildfirechat/pc-chat',
            credits: `With the invaluable help of: \n https://github.com/trazyn/weweChat`,
            version: pkg.version
        });
    }

    [imagesCacheDir, voicesCacheDir].map(e => {
        if (!fs.existsSync(e)) {
            fs.mkdirSync(e);
        }
    });

    mainWindow.webContents.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/603.3.8 (KHTML, like Gecko) Version/10.1.2 Safari/603.3.8');
    createMenu();
    regShortcut();
};

app.setName(pkg.name);
app.dock && app.dock.setIcon(icon);

app.on('ready', createMainWindow);
app.on('before-quit', () => {
    // Fix issues #14
    forceQuit = true;
    if (!isOsx) {
      tray.destroy();
    }
});
app.on('activate', e => {
    if (!mainWindow.isVisible()) {
        mainWindow.show();
    }
});

function clearBlink() {
    if(blink){
        clearInterval(blink)
    }
    blink = null
}

function execBlink (flag, _interval) {
    let interval = _interval ? _interval : 500;
    let icon= [`${__dirname}/src/assets/images/icon.png`,
            `${__dirname}/src/assets/images/Remind_icon.png`];
    let count = 0;
    if(flag){
        if (blink) {
            return;
        }
        blink = setInterval(function(){
            toggleTrayIcon(icon[count++]);
            count = count > 1 ? 0 : 1;
        }, interval);
    } else {
        clearBlink();
        toggleTrayIcon(icon[0]);
    }

}

function toggleTrayIcon(icon){
    tray.setImage(icon);
}

autoUpdater.on('update-not-available', e => {
    dialog.showMessageBox({
        type: 'info',
        buttons: ['OK'],
        title: pkg.name,
        message: `${pkg.name} is up to date :)`,
        detail: `${pkg.name} ${pkg.version} is currently the newest version available, It looks like you're already rocking the latest version!`
    });

    console.log('Update not available.');
});

autoUpdater.on('update-available', e => {
    downloading = true;
    checkForUpdates();
});

autoUpdater.on('error', err => {
    dialog.showMessageBox({
        type: 'error',
        buttons: ['Cancel update'],
        title: pkg.name,
        message: `Failed to update ${pkg.name} :(`,
        detail: `An error occurred in retrieving update information, Please try again later.`,
    });

    downloading = false;
    console.error(err);
});

autoUpdater.on('update-downloaded', info => {
    var { releaseNotes, releaseName } = info;
    var index = dialog.showMessageBox({
        type: 'info',
        buttons: ['Restart', 'Later'],
        title: pkg.name,
        message: `The new version has been downloaded. Please restart the application to apply the updates.`,
        detail: `${releaseName}\n\n${releaseNotes}`
    });
    downloading = false;

    if (index === 1) {
        return;
    }

    autoUpdater.quitAndInstall();
    setTimeout(() => {
        mainWindow = null;
        app.quit();
    });
});
