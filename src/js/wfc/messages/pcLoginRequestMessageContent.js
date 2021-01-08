/*
 * Copyright (c) 2020 WildFireChat. All rights reserved.
 */


/*
 * Copyright © 2020 WildFireChat. All rights reserved.
 */

import MessageContent from './messageContent'
import MessageContentType from './messageContentType'
import wfc from '../client/wfc'

export default class PCLoginRequestMessageContent extends MessageContent{
    sessionId;
    platform;

    constructor (sessionId, platform) {
        super(MessageContentType.Pc_Login_Request);
        this.sessionId = sessionId;
        this.platform = platform;
    }

    encode () {
        let payload = super.encode()
        payload.content = this.target;
        let obj = {
            t:this.sessionId,
            p:this.platform
        };
        payload.binaryContent = wfc.utf8_to_b64(JSON.stringify(obj));
        return payload;
    }

    decode (payload) {
        super.decode(payload)
        this.target = payload.content;
        let obj = JSON.parse(wfc.b64_to_utf8(payload.binaryContent));
        this.platform = obj.p;
        this.sessionId = obj.t;
    }

    digest () {
        return '';
    }
}
