import {observable, action} from 'mobx';
import {remote, ipcRenderer} from '../../platform';

import storage from 'utils/storage';
import helper from 'utils/helper';

class Settings {
    @observable alwaysOnTop = false;
    @observable showOnTray = false;
    @observable showNotification = true;
    @observable confirmImagePaste = true;
    @observable startup = false;
    @observable showRedIcon = true;

    @action setAlwaysOnTop(alwaysOnTop) {
        self.alwaysOnTop = alwaysOnTop;
        self.save();
    }

    @action setShowRedIcon(showRedIcon) {
        self.showRedIcon = showRedIcon;
        self.save();
    }

    @action setShowOnTray(showOnTray) {
        self.showOnTray = showOnTray;
        self.save();
    }

    @action setConfirmImagePaste(confirmImagePaste) {
        self.confirmImagePaste = confirmImagePaste;
        self.save();
    }

    @action setShowNotification(showNotification) {
        self.showNotification = showNotification;
        self.save();
    }

    @action setStartup(startup) {
        self.startup = startup;
        self.save();
    }

    @action
    async init() {
        var settings = await storage.get('settings');
        var { alwaysOnTop, showOnTray, showNotification, showRedIcon, startup } = self;

        if (settings && Object.keys(settings).length) {
            // Use !! force convert to a bool value
            self.alwaysOnTop = !!settings.alwaysOnTop;
            self.showOnTray = !!settings.showOnTray;
            self.showNotification = !!settings.showNotification;
            self.confirmImagePaste = !!settings.confirmImagePaste;
            self.startup = !!settings.startup;
            self.showRedIcon = !!settings.showRedIcon;
        } else {
            await storage.set('settings', {
                alwaysOnTop,
                showOnTray,
                showNotification,
                startup,
                showRedIcon,
            });
        }

        // Alway show the tray icon on windows
        if (!helper.isOsx) {
            self.showOnTray = true;
        }

        self.save();
        return settings;
    }

    save() {
        var { alwaysOnTop, showOnTray, showNotification, confirmImagePaste, showRedIcon, startup} = self;

        storage.set('settings', {
            alwaysOnTop,
            showOnTray,
            showNotification,
            confirmImagePaste,
            startup,
            showRedIcon,
        });

        ipcRenderer.send('settings-apply', {
            settings: {
                alwaysOnTop,
                showOnTray,
                showNotification,
                confirmImagePaste,
                startup,
                showRedIcon,
            }
        });
    }
}

const self = new Settings();
export default self;
