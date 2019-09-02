import { observable, action } from 'mobx';
import pinyin from '../han/han';

import helper from 'utils/helper';
import GroupInfo from '../wfc/model/groupInfo';
import wfc from '../wfc/wfc';

// 群菜单
class GroupMenus {
    @observable show = false;
    @observable target;

    @action async toggle(show = self.show, target = self.target) {
        self.show = show;
        self.target = target;
    }
}

const self = new GroupMenus();
export default self;
