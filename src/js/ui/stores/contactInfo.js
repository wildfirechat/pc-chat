
import { observable, action } from 'mobx';
import axios from 'axios';

import storage from 'utils/storage';

class ContactInfo {
    @observable show = false;
    // maybe userInfo, GroupInfo, ChannelInfo, ChatRoomInfo
    @observable user = {};

    @action async toggle(show = self.show, user = self.user) {
        self.show = show;
        self.user = user;
    }

    @action updateUser(user) {
        self.user = user;
    }

    @action async setRemarkName(name, id) {
        // TODO
        var auth = await storage.get('auth');
        var response = await axios.post('/cgi-bin/mmwebwx-bin/webwxoplog', {
            BaseRequest: {
                Sid: auth.wxsid,
                Uin: auth.wxuin,
                Skey: auth.skey,
            },
            CmdId: 2,
            RemarkName: name.trim(),
            UserName: id,
        });

        return +response.data.BaseResponse.Ret === 0;
    }
}

const self = new ContactInfo();
export default self;
