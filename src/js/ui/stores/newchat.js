
import { observable, action } from 'mobx';
import axios from 'axios';
import pinyin from '../han';

import contacts from './contacts';
import UserInfo from '../../wfc/model/userInfo'
import resizeImage from 'resize-image'


class NewChat {
    @observable show = false;
    @observable query = '';
    @observable list = [];
    @observable alreadySelected='';


    @action toggle(show = !self.show,alreadySelected = [] ) {
        self.show = show;
        self.alreadySelected = alreadySelected.join(',');
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

    // Return Promise

}

const self = new NewChat();
export default self;
