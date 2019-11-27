import { ipcRenderer } from 'electron';

const BrowserWindow = require('electron').remote.BrowserWindow;
const path = require('path');

ipcRenderer.on('onReceiveOffer', function(event, offer) {
    if(!self.destroyed && self.onReceiveOffer) {
      self.onReceiveOffer(offer);
    }
});
ipcRenderer.on('onCreateAnswerOffer', function(event, offer) {
  console.log("onrecive offer " + offer);
  console.log("onCreateAnswerOffer " + self.onCreateAnswerOffer);
  if (!self.destroyed && self.onCreateAnswerOffer) {
    console.log("onrecive offer11111 ");
    self.onCreateAnswerOffer(JSON.parse(offer));
  }
});


ipcRenderer.on('onIceStateChange', function(event, msg) {
  if (!self.destroyed && self.onIceStateChange) {
    self.onIceStateChange(msg);
  }
});

ipcRenderer.on('offerCount', function(event, msg) {
  console.log(msg);
});

ipcRenderer.on('onIceCandidate', function(event, offer) {
  console.log("onrecive candidate " + offer);
  if (!self.destroyed && self.onIceCandidate) {
    self.onIceCandidate(JSON.parse(offer));
  }
});

ipcRenderer.on('onCallButton', (event) => {
  if (!self.destroyed && self.onCallButton) {
    self.onCallButton();
  }
});

ipcRenderer.on('onHangupButton', (event) => {
  if (!self.destroyed && self.onHangupButton) {
      self.onHangupButton();
  }
});

ipcRenderer.on('downToVoice', (event) => {
  if (!self.destroyed && self.downToVoice) {
    self.downToVoice();
  }
});

ipcRenderer.on('pong', (event) => {
  console.log("receive pong");
  setTimeout(function() {
    self.sendPing();
  }, 1000);
});

class WfcControlAdaper {
  callWin;

  onCallWindowClose;
  onReceiveOffer;
  onCreateAnswerOffer;
  onIceCandidate;
  onIceStateChange;
  onCallButton;
  onHangupButton;
  downToVoice;
  destroyed;

  init(win) {
    this.callWin = win;
    this.destroyed = false;
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
  }

  startMedia(isInitiator, audioOnly) {
    if (!this.destroyed && this.callWin) {
      this.callWin.webContents.send('startMedia', { 'isInitiator': isInitiator, 'audioOnly': audioOnly });
    }
  }

  downgrade2Voice() {
    if (!this.destroyed && this.callWin) {
      this.callWin.webContents.send('downgrade2Voice');
    }
  }

  endMedia() {
    if (!this.destroyed && this.callWin) {
      this.callWin.webContents.send('endCall');
    }
  }

  updateEngineToVoice() {
    if (!this.destroyed && this.callWin) {
      this.callWin.webContents.send('updateEngineToVoice');
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
          //self.sendPing();
      });
      //win.webContents.openDevTools();
      win.on('close', () => {
          if (!self.destroyed) {
          win = null;
          if (self.onCallWindowClose) {
            self.onCallWindowClose();
          }
          self.destory();
        }
      });

      win.loadURL(path.join('file://', process.cwd(), 'src/js/wfc/av/engine/index.html'));
      win.show();
      this.callWin = win;
  }

  sendPing() {
    console.log("send ping");
    if (this.callWin) {
      this.callWin.send('ping');
    }

  }

  initCallUI(isMoCall, audioOnly) {
    if (!this.destroyed && this.callWin) {
      this.callWin.send('initCallUI', { voiceOnly: audioOnly, moCall: isMoCall });
    }
  }

  setRemoteOffer(signal) {
    console.log("set remote offer1");
    if (!this.destroyed && this.callWin) {
      console.log("set remote offer2");
      this.callWin.webContents.send('setRemoteOffer', JSON.stringify(signal));
    }
  }

  setRemoteAnswer(signal) {
    if (!this.destroyed && this.callWin) {
      this.callWin.webContents.send('setRemoteAnswer', JSON.stringify(signal));
    }
  }

  setRemoteIceCandidate(signal) {
    if (!this.destroyed && this.callWin) {
      this.callWin.webContents.send('setRemoteIceCandidate', JSON.stringify(signal));
    }
  }
}

const self = new WfcControlAdaper();
export default self;
