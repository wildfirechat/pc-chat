import Base from './base'
export default class TextMessageContent extends Base{
    content ;
    name ;

    encode(){
        console.log('child', this.base);
    };

    decode(contentStr){
        super.decode(contentStr);
        this.content = JSON.parse(contentStr).content;
    }
}

export const Type = 1;

// const textMessageContent = new TextMessageContent();
// export default textMessageContent;