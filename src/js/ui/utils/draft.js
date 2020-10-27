import wfc from "../../wfc/client/wfc";
import {stringValue} from "../../wfc/util/longUtil";

export default class Draft{

    static setConversationDraft(conversation, draftText, quoteMessage){
        if(!draftText && !quoteMessage){
            wfc.setConversationDraft(conversation, '');
            return;
        }
        let obj = {
            text: draftText,
            quoteMessageUid: quoteMessage ? stringValue(quoteMessage.messageUid) : ''
        }
        wfc.setConversationDraft(conversation, JSON.stringify(obj));
    }

    static getConversationDraft(conversation){
        let obj = {
            text: '',
            quotedMessage: null
        }
        let conversationInfo = wfc.getConversationInfo(conversation);
        if(!conversationInfo.draft){
            return obj;
        }
        // 兼容处理
        if(!conversationInfo.draft.startsWith("{")){
            obj.text = conversationInfo.draft;
            return obj;
        }
        let draft =  JSON.parse(conversationInfo.draft);
        obj.text = draft.text;
        if(draft.quoteMessageUid){
            let msg = wfc.getMessageByUid(draft.quoteMessageUid);
            obj.quotedMessage = msg;
        }
        return obj;
    }
}
