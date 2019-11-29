import { voipEventEmit, voipEventOn, isElectron } from '../../platform'
const path = require('path');


voipEventOn('onReceiveOffer', function (event, offer) {
  if (!self.destroyed && self.onReceiveOffer) {
    self.onReceiveOffer(offer);
  }
});
voipEventOn('onCreateAnswerOffer', function (event, offer) {
  console.log("onrecive offer " + offer);
  console.log("onCreateAnswerOffer " + self.onCreateAnswerOffer);
  if (!self.destroyed && self.onCreateAnswerOffer) {
    console.log("onrecive offer11111 ");
    self.onCreateAnswerOffer(JSON.parse(offer));
  }
});


voipEventOn('onIceStateChange', function (event, msg) {
  if (!self.destroyed && self.onIceStateChange) {
    self.onIceStateChange(msg);
  }
});

voipEventOn('offerCount', function (event, msg) {
  console.log(msg);
});

voipEventOn('onIceCandidate', function (event, offer) {
  console.log("onrecive candidate " + offer);
  if (!self.destroyed && self.onIceCandidate) {
    self.onIceCandidate(JSON.parse(offer));
  }
});

voipEventOn('onCallButton', (event) => {
  if (!self.destroyed && self.onCallButton) {
    self.onCallButton();
  }
});

voipEventOn('onHangupButton', (event) => {
  if (!self.destroyed && self.onHangupButton) {
    self.onHangupButton();
  }
});

voipEventOn('downToVoice', (event) => {
  if (!self.destroyed && self.downToVoice) {
    self.downToVoice();
  }
});

voipEventOn('pong', (event) => {
  console.log("receive pong");
  setTimeout(function () {
    self.sendPing();
  }, 1000);
});

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
      voipEventEmit(this.callWin.webContents, 'startMedia', { 'isInitiator': isInitiator, 'audioOnly': audioOnly });
    }
  }

  downgrade2Voice() {
    if (!this.destroyed && this.callWin) {
      voipEventEmit(this.callWin.webContents, 'downgrade2Voice');
    }
  }

  endMedia() {
    if (!this.destroyed && this.callWin) {
      voipEventEmit(this.callWin.webContents, 'endCall');
    }
  }

  updateEngineToVoice() {
    if (!this.destroyed && this.callWin) {
      voipEventEmit(this.callWin.webContents, 'updateEngineToVoice');
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
    if (isElectron()) {
      let BrowserWindow = require('electron').remote.BrowserWindow;
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
      // win.webContents.openDevTools();
      win.on('close', () => {
        if (!self.destroyed) {
          if (self.onCallWindowClose) {
            self.onCallWindowClose();
          }
          self.destory();
        }
      });


      // win.loadURL(
      //   `file://${__dirname}/src/index.html?voip`
      // );

      win.loadURL(path.join('file://', process.cwd(), 'src/js/wfc/av/engine/index.html'));
      win.show();
    }
  }

  sendPing() {
    console.log("send ping");
    if (!this.destory) {
      voipEventEmit(this.callWin.webContents, 'ping');
    }

  }

  initCallUI(isMoCall, audioOnly) {
    if (!this.destroyed) {
      voipEventEmit(this.callWin.webContents, 'initCallUI', { voiceOnly: audioOnly, moCall: isMoCall });
    }
  }

  setRemoteOffer(signal) {
    console.log("set remote offer1");
    if (!this.destroyed) {
      console.log("set remote offer2");
      voipEventEmit(this.callWin.webContents, 'setRemoteOffer', JSON.stringify(signal));
    }
  }

  setRemoteAnswer(signal) {
    if (!this.destroyed) {
      voipEventEmit(this.callWin.webContents, 'setRemoteAnswer', JSON.stringify(signal));
    }
  }

  setRemoteIceCandidate(signal) {
    if (!this.destroyed) {
      voipEventEmit(this.callWin.webContents, 'setRemoteIceCandidate', JSON.stringify(signal));
    }
  }
}

const self = new WfcControlAdaper();
export default self;
