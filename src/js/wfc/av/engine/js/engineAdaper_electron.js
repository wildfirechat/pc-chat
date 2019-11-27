

const currentWindow = require('electron').remote.getCurrentWindow();
var ipcRenderer = require('electron').ipcRenderer;

class WfcEngineAdaper {
  initCallUI = null;
  startMedia = null;
  setRemoteOffer = null;
  setRemoteAnswer = null;
  setRemoteIceCandidate = null;
  endMedia = null;
  downgrade2Voice = null;

  setInitCallUI(initCallUI) {
    this.initCallUI = initCallUI;
  }
  setStartMedia(startMedia) {
    this.startMedia = startMedia;
  }
  setSetRemoteOffer(setRemoteOffer) {
    this.setRemoteOffer = setRemoteOffer;
  }
  setSetRemoteAnswer(setRemoteAnswer) {
    this.setRemoteAnswer = setRemoteAnswer;
  }
  setSetRemoteIceCandidate(setRemoteIceCandidate) {
    this.setRemoteIceCandidate = setRemoteIceCandidate;
  }
  setEndMedia(endMedia) {
    this.endMedia = endMedia;
  }
  setDowngrade2Voice(downgrade2Voice) {
    this.downgrade2Voice = downgrade2Voice;
  }


  init() {
    ipcRenderer.on('initCallUI', function(event, message) {
      self.initCallUI(message);
    });

    ipcRenderer.on('startMedia', function(event, message) { // 监听父页面定义的端口
        self.startMedia(message);
    });

    ipcRenderer.on('setRemoteOffer', (event, message) => {
      self.setRemoteOffer(JSON.parse(message));
    });

    ipcRenderer.on('setRemoteAnswer', (event, message) => {
      self.setRemoteAnswer(JSON.parse(message));
    });

    ipcRenderer.on('setRemoteIceCandidate', (event, message) => {
      self.setRemoteIceCandidate(message);
    });

    ipcRenderer.on('endMedia', function() { // 监听父页面定义的端口
        self.endMedia();
    });

    ipcRenderer.on('downgrade2Voice', function() {
        self.downgrade2Voice();
    });
  }

  destory() {
    ipcRenderer.removeAllListeners(['startPreview', 'startMedia', 'setRemoteOffer', 'setRemoteAnswer', 'setRemoteIceCandidate', 'endMedia']);
    this.initCallUI = null;
    this.startMedia = null;
    this.setRemoteOffer = null;
    this.setRemoteAnswer = null;
    this.setRemoteIceCandidate = null;
    this.endMedia = null;
    this.downgrade2Voice = null;
  }

  onCallButton() {
    ipcRenderer.send('onCallButton');
  }
  onCreateAnswerOffer(desc) {
    ipcRenderer.send('onCreateAnswerOffer', JSON.stringify(desc));
  }

  onIceCandidate(candidate) {
    ipcRenderer.send('onIceCandidate', JSON.stringify(candidate));
  }

  onHangupButton() {
    ipcRenderer.send('onHangupButton');
  }

  downToVoice() {
    ipcRenderer.send('downToVoice');
  }
}

const self = new WfcEngineAdaper();
export default self;
