import MessageContent from '../../messages/messageContent';
import MessageContentType from '../../messages/messageContentType';
import wfc from "../../client/wfc"

export default class CallAnswerTMessageContent extends MessageContent {
  callId;
  audioOnly;

  constructor(mentionedType = 0, mentionedTargets = []) {
      super(MessageContentType.VOIP_CONTENT_TYPE_ACCEPT_T, mentionedType, mentionedTargets);
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
      payload.binaryContent = wfc.utf8_to_b64(obj);
      return payload;
  };

  decode(payload) {
      super.decode(payload);
      this.callId = payload.content;
      let str = wfc.b64_to_utf8(payload.binaryContent);

      this.audioOnly = (str === '1');
  }
}
