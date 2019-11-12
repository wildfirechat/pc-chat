
import { observable, action } from 'mobx';
import wfc from '../../wfc/client/wfc'

class AddFriend {
    @observable show = false;
    user;

    @action toggle(show = self.show, user = self.user) {
        self.show = show;
        self.user = user;
    }

    @action async sendRequest(message) {
        wfc.sendFriendRequest(self.user.uid, message, null, null);
    }
}

const self = new AddFriend();
export default self;
