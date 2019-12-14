import MessageContent from '../../messages/messageContent';
import { Base64 } from 'js-base64';
import MessageContentType from '../../messages/messageContentType';

export default class CallModifyMessageContent extends MessageContent {
  callId;
  audioOnly;

  constructor(mentionedType = 0, mentionedTargets = []) {
      super(MessageContentType.VOIP_CONTENT_TYPE_MODIFY, mentionedType, mentionedTargets);
  }

  digest() {
      return '';
  }

  encode() {
      let payload = super.encode();
      payload.content = this.callId;

      var obj;
      if (this.audioOnly) {
          obj = '1';
      } else {
          obj = '0';
      }
      payload.binaryContent = Base64.encode(obj);
      return payload;
  };

  decode(payload) {
      super.decode(payload);
      this.callId = payload.content;
      let str = Base64.decode(payload.binaryContent);

      this.audioOnly = (str === '1');
  }
}
