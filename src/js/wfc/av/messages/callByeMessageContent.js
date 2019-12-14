import MessageContent from '../../messages/messageContent';
import MessageContentType from '../../messages/messageContentType';

export default class CallByeMessageContent extends MessageContent {
  callId;

  constructor(mentionedType = 0, mentionedTargets = []) {
      super(MessageContentType.VOIP_CONTENT_TYPE_END, mentionedType, mentionedTargets);
  }

  digest() {
      return '';
  }

  encode() {
      let payload = super.encode();
      payload.content = this.callId;
      return payload;
  };

  decode(payload) {
      super.decode(payload);
      this.callId = payload.content;
  }
}
