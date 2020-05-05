import { observable, action } from 'mobx';
import wfc from '../../wfc/client/wfc'

class OverallUserCard {
    @observable show = false;
    @observable isMyFriend = false;
    @observable user={};
    @observable config={top:30,left:30};

    @action toggle(show = self.show, user = self.user, config = self.config, isMyFriend = self.isMyFriend) {
        self.show = show;
        self.user = user;
        self.config = config;
        self.isMyFriend = isMyFriend;
    }
}

const self = new OverallUserCard();
export default self;
