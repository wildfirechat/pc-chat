import MessageContent from './messageContent'
import MessagePayload from './messagePayload';
import MessageContentType from './messageContentType';
export default class LocationMessageContent extends MessageContent {
    title;
    // base64 encoded, 不包含头部:data:image/png;base64,
    thumbnail;
    lat;
    long;

    digest() {
        return '位置'
    }

    encode() {
        let payload = super.encode();
        payload.searchableContent = this.title;
        payload.binaryContent = this.thumbnail;
        let location = {
            lat:this.lat,
            long:this.long
        };
        payload.content = JSON.stringify(location);
        return payload;
    };

    decode(payload) {
        super.decode(payload);
        this.title = payload.searchableContent;
        this.thumbnail = payload.binaryContent;
        let location = JSON.parse(payload.content);
        this.lat = location.lat;
        this.long = location.long;
    }

}
