import { isElectron, ipcRenderer, BrowserWindow, PostMessageEventEmitter, AppPath } from '../../platform'
import wfc from '../client/wfc';
const path = require('path');


class WfcControlAdaper {

  onCallWindowClose;
  onReceiveOffer;
  onCreateAnswerOffer;
  onIceCandidate;
  onIceStateChange;
  onCallButton;
  onHangupButton;
  downToVoice;
  destroyed;
  callWin;
  events;

  voipEventEmit(event, args) {
    if (isElectron()) {
      // renderer/main to renderer
      this.callWin.webContents.send(event, args);
    } else {
      this.events.emit(event, args);
    }
  }

  voipEventOn(event, listener) {
    if (isElectron()) {
      // listen for event from main
      ipcRenderer.on(event, listener);
    } else {
      this.events.on(event, listener);
    }
  }

  voipEventRemoveAllListeners(events = []) {
    if (isElectron()) {
      // renderer
      events.forEach(e => ipcRenderer.removeAllListeners(e));
    } else {
      this.events.stop();
    }
  }

  init(win) {
    this.callWin = win;
    this.destroyed = false;

    if (!isElectron()) {
      this.events = new PostMessageEventEmitter(win, window.location.origin)
    }

    this.voipEventOn('onReceiveOffer', (event, offer) => {
      if (!self.destroyed && self.onReceiveOffer) {
        self.onReceiveOffer(offer);
      }
    });
    this.voipEventOn('onCreateAnswerOffer', (event, offer) => {
      console.log("onrecive offer " + offer);
      console.log("onCreateAnswerOffer " + self.onCreateAnswerOffer);
      if (!self.destroyed && self.onCreateAnswerOffer) {
        console.log("onrecive offer11111 ");
        self.onCreateAnswerOffer(JSON.parse(offer));
      }
    });


    this.voipEventOn('onIceStateChange', (event, msg) => {
      if (!self.destroyed && self.onIceStateChange) {
        self.onIceStateChange(msg);
      }
    });

    this.voipEventOn('offerCount', (event, msg) => {
      console.log(msg);
    });

    this.voipEventOn('onIceCandidate', (event, offer) => {
      console.log("onrecive candidate " + offer);
      if (!self.destroyed && self.onIceCandidate) {
        self.onIceCandidate(JSON.parse(offer));
      }
    });

    this.voipEventOn('onCallButton', (event) => {
      if (!self.destroyed && self.onCallButton) {
        self.onCallButton();
      }
    });

    this.voipEventOn('onHangupButton', (event) => {
      if (!self.destroyed && self.onHangupButton) {
        self.onHangupButton();
      }
    });

    this.voipEventOn('downToVoice', (event) => {
      if (!self.destroyed && self.downToVoice) {
        self.downToVoice();
      }
    });

    this.voipEventOn('pong', (event) => {
      console.log("receive pong");
      setTimeout(() => {
        self.sendPing();
      }, 1000);
    });

  }

  destory() {
    this.callWin = null;
    this.onCallWindowClose = null;
    this.onReceiveOffer = null;
    this.onCreateAnswerOffer = null;
    this.onIceCandidate = null;
    this.onCallButton = null;
    this.onHangupButton = null;
    this.downToVoice = null;
    this.destroyed = true;

    this.voipEventRemoveAllListeners(['onReceiveOffer', 'onCreateAnswerOffer', , 'onIceStateChange', 'offerCount', 'onIceCandidate', 'onCallButton', 'onHangupButton', 'downToVoice', 'pong']);
  }

  startMedia(isInitiator, audioOnly) {
    if (!this.destroyed && this.callWin) {
      this.voipEventEmit('startMedia', { 'isInitiator': isInitiator, 'audioOnly': audioOnly });
    }
  }

  downgrade2Voice() {
    if (!this.destroyed && this.callWin) {
      this.voipEventEmit('downgrade2Voice');
    }
  }

  endMedia() {
    if (!this.destroyed && this.callWin) {
      this.voipEventEmit('endCall');
    }
  }

  updateEngineToVoice() {
    if (!this.destroyed && this.callWin) {
      this.voipEventEmit('updateEngineToVoice');
    }
  }

  setOnCallWindowsClose(onCallWindowClose) {
    this.onCallWindowClose = onCallWindowClose;
  }

  setOnReceiveOffer(onReceiveOffer) {
    this.onReceiveOffer = onReceiveOffer;
  }

  setOnCreateAnswerOffer(onCreateAnswerOffer) {
    this.onCreateAnswerOffer = onCreateAnswerOffer
  }
  setOnIceCandidate(onIceCandidate) {
    this.onIceCandidate = onIceCandidate;
  }
  setOnIceStateChange(onIceStateChange) {
    this.onIceStateChange = onIceStateChange;
  }

  setOnCallButton(onCallButton) {
    this.onCallButton = onCallButton;
  }
  setOnHangupButton(onHangupButton) {
    this.onHangupButton = onHangupButton;
  }
  setDownToVoice(downToVoice) {
    this.downToVoice = downToVoice;
  }

  showCallUI(isMoCall, audioOnly, targetUserInfo) {
    if (isElectron()) {
      let win = new BrowserWindow(
        {
          width: 360,
          height: 640 + 15,
          resizable: true,
          maximizable: true,
          webPreferences: {
            scrollBounce: true,
            nativeWindowOpen: true,
          },
        }
      );

      win.webContents.on('did-finish-load', () => {
        self.init(win);
        self.initCallUI(isMoCall, audioOnly, targetUserInfo);
        //self.sendPing();
      });
      // win.webContents.openDevTools();
      win.on('close', () => {
        if (!self.destroyed) {
          if (self.onCallWindowClose) {
            self.onCallWindowClose();
          }
          self.destory();
        }
      });

      win.loadURL(path.join('file://', AppPath, 'src/index.html?voip'));
      win.show();
    } else {
      let win = window.open(window.location.origin + '?voip', 'target', 'width=360,height=640,left=200,top=200,toolbar=no,menubar=no,resizable=no,location=no, maximizable');
      win.addEventListener('load', () => {
        self.init(win);
        self.initCallUI(isMoCall, audioOnly, targetUserInfo);
      }, true);
    }
  }

  sendPing() {
    console.log("send ping");
    if (!this.destory) {
      this.voipEventEmit('ping');
    }

  }

  initCallUI(isMoCall, audioOnly, targetUserInfo) {
    if (!this.destroyed) {
      this.voipEventEmit('initCallUI', { audioOnly: audioOnly, moCall: isMoCall, targetUserInfo: targetUserInfo });
    }
  }

  setRemoteOffer(signal) {
    console.log("set remote offer1");
    if (!this.destroyed) {
      console.log("set remote offer2");
      this.voipEventEmit('setRemoteOffer', JSON.stringify(signal));
    }
  }

  setRemoteAnswer(signal) {
    if (!this.destroyed) {
      this.voipEventEmit('setRemoteAnswer', JSON.stringify(signal));
    }
  }

  setRemoteIceCandidate(signal) {
    if (!this.destroyed) {
      this.voipEventEmit('setRemoteIceCandidate', JSON.stringify(signal));
    }
  }
}

const self = new WfcControlAdaper();
export default self;
