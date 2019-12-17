import MessageContent from '../../messages/messageContent';
import { Base64 } from 'js-base64';
import MessageContentType from '../../messages/messageContentType';

export default class CallStartMessageContent extends MessageContent {
  callId;
  targetId;
  connectTime;
  endTime;
  status;
  audioOnly;

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
          t: this.targetId,
      };
      payload.binaryContent = Base64.encode(JSON.stringify(obj));
      return payload;
  };

  decode(payload) {
      super.decode(payload);
      this.callId = payload.content;
      let json = Base64.decode(payload.binaryContent);
      let obj = JSON.parse(json);

      this.connectTime = obj.c;
      this.endTime = obj.e;
      this.status = obj.s;
      this.audioOnly = (obj.a === 1);
      this.targetId = obj.t;
  }
}
