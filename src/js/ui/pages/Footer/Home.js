
import React, { Component } from 'react';
import { inject } from 'mobx-react';

import MessageInput from 'components/MessageInput';

@inject(stores => ({
    sendMessage: stores.chat.sendMessage,
    conversation: stores.chat.conversation,
    showMessage: stores.snackbar.showMessage,
    me: stores.sessions.user,
    confirmSendImage: async(image) => {
        if (!stores.settings.confirmImagePaste) {
            return true;
        }

        var confirmed = await stores.confirmImagePaste.toggle(true, image);
        return confirmed;
    },
    process: stores.chat.process,
}))
export default class Message extends Component {
    render() {
        var { sendMessage, showMessage, me = {}, confirmSendImage, process, conversation } = this.props;

        return (
            <MessageInput {...{
                sendMessage,
                showMessage,
                me: me.User,
                confirmSendImage,
                process,
                conversation,
            }} />
        );
    }
}
