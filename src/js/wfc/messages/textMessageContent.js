/*
 * Copyright (c) 2020 WildFireChat. All rights reserved.
 */

import MessageContent from './messageContent'
import MessageContentType from './messageContentType';
import wfc from '../client/wfc'
import QuoteInfo from "../model/quoteInfo";
export default class TextMessageContent extends MessageContent {
    content;
    quoteInfo;

    constructor(content, mentionedType = 0, mentionedTargets = []) {
        super(MessageContentType.Text, mentionedType, mentionedTargets);
        this.content = content;
    }

    digest() {
        return this.content;
    }

    encode() {
        let payload = super.encode();
        payload.searchableContent = this.content;
        if(this.quoteInfo){
            let obj = {
                "quote": this.quoteInfo.encode()
            }
            let orgStr = JSON.stringify(obj);
            let str= orgStr.replace(/"u":"([0-9]+)"/, "\"u\":$1");

            payload.binaryContent = wfc.utf8_to_b64(str);
        }
        return payload;
    };

    decode(payload) {
        super.decode(payload);
        this.content = payload.searchableContent;
        if(payload.binaryContent && payload.binaryContent.length > 0){
            let obj = JSON.parse(wfc.b64_to_utf8(payload.binaryContent)).quote;

            this.quoteInfo = new QuoteInfo();
            this.quoteInfo.decode(obj);
        }
    }

    setQuoteInfo(quoteInfo){
        this.quoteInfo = quoteInfo;
    }

}
