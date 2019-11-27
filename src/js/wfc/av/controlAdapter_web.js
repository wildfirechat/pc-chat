import { ipcRenderer } from 'electron';

const BrowserWindow = require('electron').remote.BrowserWindow;
const path = require('path');

class WfcControlAdaper {
  callWin;

  onCallWindowClose;
  onReceiveOffer;
  onCreateAnswerOffer;
  onIceCandidate;
  onCallButton;
  onHangupButton;
  downToVoice;

  init(win) {
    this.callWin = win;
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
  }

  startMedia(isInitiator, audioOnly) {
    if (this.callWin) {
      this.callWin.webContents.send('startMedia', { 'isInitiator': isInitiator, 'audioOnly': audioOnly });
    }
  }

  downgrade2Voice() {
    if (this.callWin) {
      this.callWin.webContents.send('downgrade2Voice');
    }
  }

  endMedia() {
    if (this.callWin) {
      this.callWin.webContents.send('endMedia');
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
  setOnCallButton(onCallButton) {
    this.onCallButton = onCallButton;
  }
  setOnHangupButton(onHangupButton) {
    this.onHangupButton = onHangupButton;
  }
  setDownToVoice(downToVoice) {
    this.downToVoice = downToVoice;
  }

  showCallUI(isMoCall, audioOnly) {
      let win = new BrowserWindow(
          {
              width: 700,
              height: 400,
              webPreferences: {
                scrollBounce: true,
                nativeWindowOpen: true,
              },
          }
      );

      win.webContents.on('did-finish-load', () => {
        self.init(win);
        self.initCallUI(isMoCall, audioOnly);
      });
      win.webContents.openDevTools();
      win.on('close', () => {
          win = null;
          self.callWin = null;
          if (self.onCallWindowClose) {
            self.onCallWindowClose();
          }
          self.destory();
      });

      win.loadURL(path.join('file://', process.cwd(), 'src/js/wfc/av/engine/index.html'));
      win.show();
      this.callWin = win;
      ipcRenderer.on('onReceiveOffer', function(event, offer) {
          if(self.onReceiveOffer) {
            self.onReceiveOffer(offer);
          }
      });
      ipcRenderer.on('onCreateAnswerOffer', function(event, offer) {
        console.log("onrecive offer " + offer);
        console.log("onCreateAnswerOffer " + self.onCreateAnswerOffer);
        if (self.onCreateAnswerOffer) {
          console.log("onrecive offer11111 ");
          self.onCreateAnswerOffer(JSON.parse(offer));
        }
      });

      ipcRenderer.on('onIceCandidate', function(event, offer) {
        console.log("onrecive candidate " + offer);
        if (self.onIceCandidate) {
          self.onIceCandidate(JSON.parse(offer));
        }
      });

      ipcRenderer.on('onCallButton', (event) => {
        if (self.onCallButton) {
          self.onCallButton();
        }
      });

      ipcRenderer.on('onHangupButton', (event) => {
        if (self.onHangupButton) {
            self.onHangupButton();
        }
      });

      ipcRenderer.on('downToVoice', (event) => {
        if (self.downToVoice()) {
          self.downToVoice();
        }
      });
  }

  initCallUI(isMoCall, audioOnly) {
    if (this.callWin) {
      this.callWin.send('initCallUI', { voiceOnly: audioOnly, moCall: isMoCall });
    }
  }

  setRemoteOffer(signal) {
    console.log("set remote offer1");
    if (this.callWin) {
      console.log("set remote offer2");
      this.callWin.webContents.send('setRemoteOffer', JSON.stringify(signal));
    }
  }

  setRemoteAnswer(signal) {
    if (this.callWin) {
      this.callWin.webContents.send('setRemoteAnswer', JSON.stringify(signal));
    }
  }

  setRemoteIceCandidate(signal) {
    if (this.callWin) {
      this.callWin.webContents.send('setRemoteIceCandidate', JSON.stringify(signal));
    }
  }
}

const self = new WfcControlAdaper();
export default self;
