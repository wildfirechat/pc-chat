import MessageContent from '../../messages/messageContent';
import { Base64 } from 'js-base64';
import MessageContentType from '../../messages/messageContentType';

export default class CallSignalMessageContent extends MessageContent {
  callId;
  payload;

  constructor(mentionedType = 0, mentionedTargets = []) {
      super(MessageContentType.VOIP_CONTENT_TYPE_SIGNAL, mentionedType, mentionedTargets);
  }

  digest() {
      return '';
  }

  encode() {
      let payload = super.encode();
      payload.content = this.callId;
      payload.binaryContent = Base64.encode(this.payload);
      return payload;
  };

  decode(payload) {
      super.decode(payload);
      this.callId = payload.content;
      this.payload = Base64.decode(payload.binaryContent);
  }
}
