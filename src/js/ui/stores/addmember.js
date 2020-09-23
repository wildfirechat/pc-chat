
import { observable, action } from 'mobx';
import axios from 'axios';
import pinyin from './../han';

import contacts from './contacts';
import sessions from './sessions';
import helper from 'utils/helper';
import wfc from '../../wfc/client/wfc'
import UserInfo from "../../wfc/model/userInfo";

class AddMember {
    @observable show = false;
    @observable query = '';
    @observable list = [];

    @action toggle(show = !self.show) {
        self.show = show;
    }

    @action search(text) {
        text = pinyin.letter(text.toLocaleLowerCase(), '', null);

        var list = contacts.memberList.filter(e => {
            let name = contacts.contactItemName(e);
            var res = pinyin.letter(name, '', null).toLowerCase().indexOf(text) > -1;

            return e instanceof UserInfo && res;
        });

        self.query = text;
        self.list.replace(list);
    }

    @action reset() {
        self.query = '';
        self.list.replace([]);
    }

    @action async addMember(groupId, userids) {
        // TODO
        wfc.addGroupMembers(groupId, userids, [0], null, null, (errorCode) => {
            console.log('add group member failed', errorCode);
        })
    }
}

const self = new AddMember();
export default self;
