
import { observable, action } from 'mobx';
import axios from 'axios';

import sessions from './sessions';
import helper from 'utils/helper';
import storage from 'utils/storage';

class UserInfo {
    @observable show = false;
    @observable remove = false;
    @observable conversation;
    @observable user = {};
    @observable pallet = [];

    // remove表示，是否有权限将其从group、channel、chatroom中删除
    @action async toggle(show = self.show, conversation = self.conversation, user = self.user, remove = false) {

        self.remove = remove;
        self.show = show;
        self.user = user;
        self.conversation = conversation;

        // Try to get from cache
        var pallet = user.pallet;

        if (show) {
            if (pallet) {
                self.pallet = user.pallet;
            } else {
                // TODO 取消注释，控制用户界面背景颜色
                // pallet = await helper.getPallet(user.portrait);
                pallet = await helper.getPallet(user.xxx);

                // Cache the pallet
                self.user.pallet = pallet;
                self.pallet = pallet;
            }
        }
    }

    @action updateUser(user) {
        // TODO
    }

    @action async setRemarkName(name, id) {
        // TODO
    }

    @action async removeMember(roomId, userid) {
        // TODO
    }
}

const self = new UserInfo();
export default self;
