import { observable, action } from 'mobx';
import axios from 'axios';
import wfc from '../../wfc/client/wfc';
import storage from 'utils/storage';

import GroupInfo from '../../wfc/model/groupInfo';
import UserInfo from '../../wfc/model/userInfo';

const isArray = (arr) => {
    return Object.prototype.toString.call(arr) === '[object Array]';
};
class ContactInfo {
    @observable show = false;
    // maybe userInfo, GroupInfo, ChannelInfo, ChatRoomInfo
    @observable user = {};

    @observable groupList = {};

    @observable isNewFriend = false;
    @observable users = false;

    @action
    async toggle(show = self.show, user = self.user) {
        self.show = show;
        self.user = user;
        self.isNewFriend = isArray(user);
        if (user instanceof GroupInfo) {
            var userIds = [];
            // userIds.push();
            let members = wfc.getGroupMembers(user.target);
            members.forEach(m => {
                userIds.push(m.memberId);
            });
            self.users = wfc.getUserInfos(userIds, user);
        }
    }

    @action
    async toggleGroup(show = self.show, groupList = self.groupList) {
        self.show = show;
        self.groupList = groupList;
    };

};

const self = new ContactInfo();
export default self;
