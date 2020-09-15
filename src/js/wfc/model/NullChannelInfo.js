/*
 * Copyright (c) 2020 WildFireChat. All rights reserved.
 */

import ChannelInfo from "./channelInfo";

export default class NullChannelInfo extends ChannelInfo{
    constructor (channelId) {
        super()
        this.channelId = channelId;
        this.name = `<${channelId}>`
    }
}
