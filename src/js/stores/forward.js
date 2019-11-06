
import { observable, action } from 'mobx';
import pinyin from '../han';

import contacts from './contacts';
import wfc from '../wfc/client/wfc'
import UserInfo from '../wfc/model/userInfo';
import GroupInfo from '../wfc/model/groupInfo';
import Conversation from '../wfc/model/conversation';
import ConversationType from '../wfc/model/conversationType';
import Message from '../wfc/messages/message'

class Forward {
    @observable show = false;
    @observable message = {};
    @observable list = [];
    @observable query = '';

    @action async toggle(show = self.show, message = {}) {
        self.show = show;
        if (show) {
            self.message = message;
        }

        if (show === false) {
            self.query = '';
            self.list.replace([]);
        }
    }

    @action search(text = '') {
        var list;

        self.query = text;

        if (text) {
            list = contacts.memberList.filter(e => {
                let displayName = contacts.contactItemName(e);
                if (e.uid === wfc.getUserId()) {
                    return false;
                }

                return pinyin.letter(displayName, '', null).toLowerCase().indexOf(pinyin.letter(text.toLocaleLowerCase(), '', null)) > -1;
            });
            self.list.replace(list);

            return;
        }

        self.list.replace([]);
    }

    @action async send(userid) {
        var contact = await contacts.getUser(userid);

        let msg = new Message();
        msg.messageContent = self.message.messageContent;
        if (contact instanceof UserInfo) {
            msg.conversation = new Conversation(ConversationType.Single, userid, 0);

        } else if (contact instanceof GroupInfo) {
            msg.conversation = new Conversation(ConversationType.Group, userid, 0);
        }

        wfc.sendMessage(msg)
    }
}

const self = new Forward();
export default self;
