
import { observable, action } from 'mobx';
import pinyin from '../han';

import contacts from './contacts';
import storage from 'utils/storage';
import GroupInfo from '../../wfc/model/groupInfo';

class Search {
    @observable result = {
        query: '',
        friend: [],
        groups: [],
    };
    @observable searching = false;

    @action filter(text = '') {
        var list;
        var groups = [];
        var friend = [];

        text = pinyin.letter(text.toLocaleLowerCase(), '', null);

        list = contacts.memberList.filter(e => {
            let name = contacts.contactItemName(e);
            var res = pinyin.letter(name, '', null).toLowerCase().indexOf(text) > -1;

            // if (e.RemarkName) {
            //     res = res || pinyin.letter(e.RemarkName, null).toLowerCase().indexOf(text) > -1;
            // }

            return res;
        });

        list.map(e => {
            if (e instanceof GroupInfo) {
                return groups.push(e);
            }

            friend.push(e);
        });

        if (text) {
            self.result = {
                query: text,
                friend,
                groups,
            };
        } else {
            self.result = {
                query: text,
                friend: [],
                groups: [],
            };
        }

        self.searching = true;
        return self.result;
    }

    @action reset() {
        self.result = {
            query: '',
            friend: [],
            groups: [],
        };
        self.toggle(false);
    }

    @action toggle(searching = !self.searching) {
        self.searching = searching;
    }
}

const self = new Search();
export default self;
