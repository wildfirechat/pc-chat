import MessageContent from './baseContent'
export default class TextMessageContent extends MessageContent{
    content;

    encode(){
        // TODO
    };

    decode(content){
        // TODO
    }
}

export const Type = 1;

// const textMessageContent = new TextMessageContent();
// export default textMessageContent;