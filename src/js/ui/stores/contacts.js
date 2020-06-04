
import { observable, action } from 'mobx';
import { ipcRenderer } from '../../platform';
import axios from 'axios';
import pinyin from '../han';

import chat from './chat';
import storage from 'utils/storage';
import helper from 'utils/helper';
import { normalize } from 'utils/emoji';
import wfc from '../../wfc/client/wfc'
import UserInfo from '../../wfc/model/userInfo';
import GroupInfo from '../../wfc/model/groupInfo';
import NullUserInfo from '../../wfc/model/nullUserInfo';
import NullGroupInfo from '../../wfc/model/nullGroupInfo';

class Contacts {
    @observable loading = false;
    @observable showGroup = true;
    @observable memberList = []; // 包含GroupInfo、UserInfo和ChannelInfo
    @observable filtered = {
        query: '',
        result: [],
        count:0
    };

    @action group(list, showall = false) {
        var mappings = {};
        var sorted = [];

        list.map(e => {
            if (!e) {
                return;
            }

            // If 'showall' is false, just show your friends
            // if (showall === false
            //     && !(e instanceof UserInfo)) {
            //     return;
            // }

            let name = self.contactItemName(e);
            var prefix = (pinyin.letter(name, '', null).toString()[0] + '').replace('?', '#');
            var group = mappings[prefix];

            if (!group) {
                group = mappings[prefix] = [];
            }
            group.push(e);
        });

        for (let key in mappings) {
            sorted.push({
                prefix: key,
                list: mappings[key],
            });
        }

        sorted.sort((a, b) => a.prefix.charCodeAt(0) - b.prefix.charCodeAt(0));
        return sorted;
    }

    contactItemName(item) {
        var name = '';
        if (item instanceof UserInfo) {
            name = wfc.getUserDisplayName(item.uid);
        } else if (item instanceof GroupInfo) {
            name = item.name;
        }
        return name;
    }

    // TODO refactor to getContact, and the return mayby userInfo, GroupInfo 
    @action async getUser(userid) {
        return self.memberList.find(e => e.uid === userid);
    }

    @action getContacts() {
        self.loading = true;

        self.memberList = [];
        let friendListIds = wfc.getMyFriendList(false);
        console.log('fi', friendListIds.length);
        if (friendListIds.length > 0) {
            friendListIds.map((e) => {
                let u = wfc.getUserInfo(e);
                if (!(u instanceof NullUserInfo)) {
                    self.memberList.push(u);
                }
            });
        }

        // if (self.showGroup) {
        //     let groupList = wfc.getMyGroupList();
        //     groupList.map(e => {
        //         let g = wfc.getGroupInfo(e);
        //         if (!(g instanceof NullGroupInfo)) {
        //             self.memberList.push(g);
        //         }
        //     });
        // }

        console.log('contacts lenght', self.memberList.length);
        self.loading = false;
        self.filtered.result = self.group(self.memberList, true);
        self.filtered.count = self.memberList.length;

        return (window.list = self.memberList);
    }

    @action filter(text = '', showall = false) {
        text = pinyin.letter(text.toLocaleLowerCase(), '', null);
        var list = self.memberList.filter(e => {
            let name = self.contactItemName(e);
            var res = pinyin.letter(name, '', null).toLowerCase().indexOf(text) > -1;

            // if (e.RemarkName) {
            //     res = res || pinyin.letter(e.RemarkName, null).toLowerCase().indexOf(text) > -1;
            // }

            return res;
        });

        if (!self.showGroup) {
            list = list.filter(e => {
                return !(e instanceof GroupInfo);
            });
        }

        self.filtered = {
            query: text,
            result: list.length ? self.group(list, showall) : [],
            count: list.length
        };
    }

    @action toggleGroup(showGroup) {
        self.showGroup = showGroup;
    }

    @action async deleteUser(id) {
        // TODO
    }

    @action async updateUser(user) {
        // TODO
    }
}

const self = new Contacts();
export default self;
