import MessageContent from '../../messages/messageContent';
import MessageContentType from '../../messages/messageContentType';
import wfc from "../../client/wfc"

export default class CallStartMessageContent extends MessageContent {
  callId;
  targetIds = [];
  connectTime;
  endTime;
  status;
  audioOnly;
  pin;

  constructor(mentionedType = 0, mentionedTargets = []) {
      super(MessageContentType.VOIP_CONTENT_TYPE_START, mentionedType, mentionedTargets);
  }

  digest() {
      if (this.audioOnly) {
          return '[语音通话]';
      } else {
          return '[视频通话]';
      }
  }

  encode() {
      let payload = super.encode();
      payload.content = this.callId;

      let obj = {
          c: this.connectTime,
          e: this.endTime,
          s: this.status,
          a: this.audioOnly ? 1 : 0,
          ts: this.targetIds,
          t:this.targetIds[0],
          p:this.pin
      };
      payload.binaryContent = wfc.utf8_to_b64(JSON.stringify(obj));
      return payload;
  };

  decode(payload) {
      super.decode(payload);
      this.callId = payload.content;
      let json = wfc.b64_to_utf8(payload.binaryContent);
      let obj = JSON.parse(json);

      this.connectTime = obj.c;
      this.endTime = obj.e;
      this.status = obj.s;
      this.audioOnly = (obj.a === 1);
      this.targetIds = obj.ts;
      if(!this.targetIds){
          this.targetIds = [obj.t];
      }
      this.pin = obj.p;
  }
}
