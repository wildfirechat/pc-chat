import {observable, action} from 'mobx';
import axios from 'axios';

import storage from 'utils/storage';

class ContactInfo {
    @observable show = false;
    // maybe userInfo, GroupInfo, ChannelInfo, ChatRoomInfo
    @observable user = {};

    @action
    async toggle(show = self.show, user = self.user) {
        self.show = show;
        self.user = user;
    }

}

const self = new ContactInfo();
export default self;
