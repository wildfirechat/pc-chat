/*
 * Copyright (c) 2020 WildFireChat. All rights reserved.
 */

import MessageContent from '../../messages/messageContent';
import MessageContentType from '../../messages/messageContentType';
import CallEndReason from '../engine/callEndReason'
import wfc from "../../client/wfc"

export default class CallByeMessageContent extends MessageContent {
  callId;
  reason;

  constructor(mentionedType = 0, mentionedTargets = []) {
      super(MessageContentType.VOIP_CONTENT_TYPE_END, mentionedType, mentionedTargets);
  }

  digest() {
      return '';
  }

  encode() {
      let payload = super.encode();
      payload.content = this.callId;
      payload.binaryContent = wfc.utf8_to_b64(JSON.stringify({r : this.reason}));
      return payload;
  };

  decode(payload) {
      super.decode(payload);
      this.callId = payload.content;
      this.reason = payload.binaryContent ? JSON.parse(wfc.b64_to_utf8(payload.binaryContent)).r : CallEndReason.REASON_Unknown;
  }
}
