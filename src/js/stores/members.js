
import { observable, action } from 'mobx';
import pinyin from './../han';

import helper from 'utils/helper';
import GroupInfo from '../wfc/model/groupInfo';
import wfc from '../wfc/client/wfc'

class Members {
    @observable show = false;
    // 可能是groupInfo，或者channelInfo
    @observable target;
    @observable list = [];
    @observable filtered = [];
    @observable query = '';

    @action async toggle(show = self.show, target = self.target) {
        let userIds = [];
        let users = [];
        if (target instanceof GroupInfo) {
            let members = wfc.getGroupMembers(target.target);
            members.forEach(m => {
                userIds.push(m.memberId);
            });
            users = wfc.getUserInfos(userIds, target);
        } else {
            return;
        }

        var list = [];
        self.show = show;
        self.target = target;

        if (show === false) {
            self.query = '';
            self.filtered.replace([]);
            return;
        }

        self.list.replace(users);

        Promise.all(
            users.map(async e => {
                var pallet = e.pallet;

                if (!pallet) {
                    e.pallet = await helper.getPallet(e.portrait);
                }
                list.push(e);
            })
        ).then(() => {
            self.list.replace(list);
        });
    }

    @action search(text = '') {
        var list;

        self.query = text;

        if (text) {
            list = self.list.filter(e => {
                return pinyin.letter(e.displayName, '', null).toLowerCase().indexOf(pinyin.letter(text.toLocaleLowerCase(), '', null)) > -1;
            });
            self.filtered.replace(list);

            return;
        }

        self.filtered.replace([]);
    }
}

const self = new Members();
export default self;
