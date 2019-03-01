
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { ipcRenderer, remote } from 'electron';
import clazz from 'classname';
import moment from 'moment';
import axios from 'axios';

import classes from './style.css';
import Avatar from 'components/Avatar';
import helper from 'utils/helper';
import { parser as emojiParse } from 'utils/emoji';
import { on, off } from 'utils/event';
import { ContentType_Text, ContentType_Image } from '../../../wfc/messages/messageTypes';

@inject(stores => ({
    user: stores.chat.user,
    sticky: stores.chat.sticky,
    empty: stores.chat.empty,
    removeChat: stores.chat.removeChat,
    messages: stores.chat.messageList,
    loading: stores.session.loading,
    loadOldMessages: stores.chat.loadOldMessages,
    reset: () => {
        //stores.chat.user = false;
    },
    isFriend: (id) => {
        var user = stores.contacts.memberList.find(e => e.UserName === id) || {};
        return helper.isContact(user);
    },
    showUserinfo: async (isme, user) => {
        var caniremove = helper.isChatRoomOwner(stores.chat.user);

        if (isme) {
            user = stores.session.user.User;
        } else {
            stores.contacts.memberList.find(e => {
                // Try to find contact in your contacts
                if (e.UserName === user.UserName) {
                    return (user = e);
                }
            });
        }

        stores.userinfo.toggle(true, user, caniremove);
    },
    getMessage: (messageid) => {
        var list = stores.chat.messages.get(stores.chat.user.UserName);
        return list.data.find(e => e.MsgId === messageid);
    },
    deleteMessage: (messageid) => {
        stores.chat.deleteMessage(stores.chat.user.UserName, messageid);
    },
    showMembers: (user) => {
        if (helper.isChatRoom(user.UserName)) {
            stores.members.toggle(true, user);
        }
    },
    showContact: (userid) => {
        var user = stores.contacts.memberList.find(e => e.UserName === userid);
        stores.userinfo.toggle(true, user);
    },
    showForward: (message) => stores.forward.toggle(true, message),
    parseMessage: (message, from) => {
        var isChatRoom = message.isme ? false : helper.isChatRoom(message.FromUserName);
        var user = from;

        message = Object.assign({}, message);

        if (isChatRoom) {
            let matchs = message.Content.split(':<br/>');

            // Get the newest chat room infomation
            from = stores.contacts.memberList.find(e => from.UserName === e.UserName);
            user = from.MemberList.find(e => e.UserName === matchs[0]);
            message.Content = matchs[1];
        }

        // If user is null, that mean user has been removed from this chat room
        return { message, user };
    },
    showAddFriend: (user) => stores.addfriend.toggle(true, user),
    recallMessage: stores.chat.recallMessage,
    downloads: stores.settings.downloads,
    rememberConversation: stores.settings.rememberConversation,
    showConversation: stores.chat.showConversation,
    toggleConversation: stores.chat.toggleConversation,
}))
@observer
export default class ChatContent extends Component {
    getMessageContent(message) {
        var uploading = message.uploading;

        console.log('getMessageContent');
        console.log(message);
        switch (message.content.type) {
            case ContentType_Text:
                if (message.location) {
                    return `
                        <img class="open-map unload" data-map="${message.location.href}" src="${message.location.image}" />
                        <label>${message.location.label}</label>
                    `;
                }
                // Text message
                //let text = Object.assign(new TextMessageContent(), message.content);
                let textMessageContent = message.messageContent;
                return emojiParse(textMessageContent.content);
            case ContentType_Image:
                // Image
                let image = message.messageContent;
                console.log(image.localPath);
                console.log(image.remotePath);

                console.log('xxxxxxxx', typeof image.thumbnail);
                // let base64data = Buffer.from(image.thumbnail, 'binary').toString('base64');
                // Buffer.from
                // let base64data = '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';
                // console.log(base64data);

                if (uploading) {
                    return `
                        <div>
                            <img class="open-image unload" data-id="${message.MsgId}" src="${image.src}" data-fallback="${image.fallback}" />
                            <i class="icon-ion-android-arrow-up"></i>
                        </div>
                    `;
                }
                // return `<img class="open-image unload" data-id="${message.messageId}" src="${image.remotePath}" data-fallback="${image.fallback}" />`;
                // TODO 图片数据，需要base64编码
                return `<img class="open-image unload" data-id="${message.messageId}" src="data:image/jpeg;base64, ${image.thumbnail}" data-fallback="${image.fallback}" />`;
            case 34:
                /* eslint-disable */
                // Voice
                let voice = message.voice;
                let times = message.VoiceLength;
                let width = 40 + 7 * (times / 2000);
                let seconds = 0;
                /* eslint-enable */

                if (times < 60 * 1000) {
                    seconds = Math.ceil(times / 1000);
                }

                return `
                    <div class="play-voice" style="width: ${width}px" data-voice="${voice.src}">
                        <i class="icon-ion-android-volume-up"></i>
                        <span>
                            ${seconds || '60+'}"
                        </span>

                        <audio controls="controls">
                            <source src="${voice.src}" />
                        </audio>
                    </div>
                `;
            case 47:
            case 49 + 8:
                // External emoji
                let emoji = message.emoji;

                if (emoji) {
                    if (uploading) {
                        return `
                            <div>
                                <img class="unload disabledDrag" src="${emoji.src}" data-fallback="${emoji.fallback}" />
                                <i class="icon-ion-android-arrow-up"></i>
                            </div>
                        `;
                    }
                    return `<img src="${emoji.src}" class="unload disabledDrag" data-fallback="${emoji.fallback}" />`;
                }
                return `
                    <div class="${classes.invalidEmoji}">
                        <div></div>
                        <span>Send an emoji, view it on mobile</span>
                    </div>
                `;

            case 42:
                // Contact Card
                let contact = message.contact;
                let isFriend = this.props.isFriend(contact.UserName);
                let html = `
                    <div class="${clazz(classes.contact, { 'is-friend': isFriend })}" data-userid="${contact.UserName}">
                        <img src="${contact.image}" class="unload disabledDrag" />

                        <div>
                            <p>${contact.name}</p>
                            <p>${contact.address}</p>
                        </div>
                `;

                if (!isFriend) {
                    html += `
                        <i class="icon-ion-android-add" data-userid="${contact.UserName}"></i>
                    `;
                }

                html += '</div>';

                return html;

            case 43:
                // Video message
                let video = message.video;

                if (uploading) {
                    return `
                        <div>
                            <video preload="metadata" controls src="${video.src}"></video>

                            <i class="icon-ion-android-arrow-up"></i>
                        </div>
                    `;
                }

                if (!video) {
                    console.error('Invalid video message: %o', message);

                    return `
                        Receive an invalid video message, please see the console output.
                    `;
                }

                return `
                    <video preload="metadata" poster="${video.cover}" controls src="${video.src}" />
                `;

            case 49 + 2000:
                // Money transfer
                let transfer = message.transfer;

                return `
                    <div class="${classes.transfer}">
                        <h4>Money Transfer</h4>
                        <span>💰 ${transfer.money}</span>
                        <p>如需收钱，请打开手机微信确认收款。</p>
                    </div>
                `;

            case 49 + 6:
                // File message
                let file = message.file;
                let download = message.download;

                /* eslint-disable */
                return `
                    <div class="${classes.file}" data-id="${message.MsgId}">
                        <img src="assets/images/filetypes/${helper.getFiletypeIcon(file.extension)}" class="disabledDrag" />

                        <div>
                            <p>${file.name}</p>
                            <p>${helper.humanSize(file.size)}</p>
                        </div>

                        ${
                    uploading
                        ? '<i class="icon-ion-android-arrow-up"></i>'
                        : (download.done ? '<i class="icon-ion-android-more-horizontal is-file"></i>' : '<i class="icon-ion-android-arrow-down is-download"></i>')
                    }
                    </div>
                `;
            /* eslint-enable */

            case 49 + 17:
                // Location sharing...
                return `
                    <div class="${classes.locationSharing}">
                        <i class="icon-ion-ios-location"></i>
                        Location sharing, Please check your phone.
                    </div>
                `;
        }
    }

    renderMessages(list, from) {
        //return list.data.map((e, index) => {
        return list.map((e) => {
            // var { message, user } = this.props.parseMessage(e, from);
            var message = e;
            var user = 'xxx';
            var type = message.MsgType;

            if ([
                // WeChat system message
                10000,
                // Custome message
                19999
            ].includes(type)) {
                return (
                    <div
                        key={index}
                        className={clazz('unread', classes.message, classes.system)}
                        dangerouslySetInnerHTML={{ __html: e.Content }} />
                );
            }

            if (!user) {
                return false;
            }

            return (
                <div className={clazz('unread', classes.message, {
                    // File is uploading
                    [classes.uploading]: message.uploading === true,

                    [classes.isme]: message.direction === 0,
                    //[classes.isText]: type === 1 && !message.location,
                    [classes.isText]: message.messageContent.type == ContentType_Text,
                    [classes.isLocation]: type === 1 && message.location,
                    [classes.isImage]: type === 3,
                    [classes.isEmoji]: type === 47 || type === 49 + 8,
                    [classes.isVoice]: type === 34,
                    [classes.isContact]: type === 42,
                    [classes.isVideo]: type === 43,

                    // App messages
                    [classes.appMessage]: [49 + 2000, 49 + 17, 49 + 6].includes(type),
                    [classes.isTransfer]: type === 49 + 2000,
                    [classes.isLocationSharing]: type === 49 + 17,
                    [classes.isFile]: type === 49 + 6,
                })} key={message.messageId}>
                    <div>
                        <Avatar
                            //src={message.isme ? message.HeadImgUrl : user.HeadImgUrl}
                            src={'http://img.hao661.com/qq.hao661.com/uploads/allimg/180822/0U61415T-0.jpg'}
                            className={classes.avatar}
                            onClick={ev => this.props.showUserinfo(message.isme, user)}
                        />

                        <p
                            className={classes.username}
                            //dangerouslySetInnerHTML={{__html: user.DisplayName || user.RemarkName || user.NickName}}
                            dangerouslySetInnerHTML={{ __html: message.from || user.RemarkName || user.NickName }}
                        />

                        <div className={classes.content}>
                            <p
                                onContextMenu={e => this.showMessageAction(message)}
                                dangerouslySetInnerHTML={{ __html: this.getMessageContent(message) }} />
                            <span className={classes.times}>{moment(message.timestamp).fromNow()}</span>
                        </div>
                    </div>
                </div>
            );
        });
    }

    async handleClick(e) {
        var target = e.target;

        // Open the image
        if (target.tagName === 'IMG'
            && target.classList.contains('open-image')) {
            // Get image from cache and convert to base64
            let response = await axios.get(target.src, { responseType: 'arraybuffer' });
            // eslint-disable-next-line
            let base64 = new window.Buffer(response.data, 'binary').toString('base64');

            ipcRenderer.send('open-image', {
                dataset: target.dataset,
                base64,
            });

            return;
        }

        // Play the voice message
        if (target.tagName === 'DIV'
            && target.classList.contains('play-voice')) {
            let audio = target.querySelector('audio');

            audio.onplay = () => target.classList.add(classes.playing);
            audio.onended = () => target.classList.remove(classes.playing);
            audio.play();

            return;
        }

        // Open the location
        if (target.tagName === 'IMG'
            && target.classList.contains('open-map')) {
            ipcRenderer.send('open-map', {
                map: target.dataset.map,
            });
        }

        // Show contact card
        if (target.tagName === 'DIV'
            && target.classList.contains('is-friend')) {
            this.props.showContact(target.dataset.userid);
        }

        // Add new friend
        if (target.tagName === 'I'
            && target.classList.contains('icon-ion-android-add')) {
            this.props.showAddFriend({
                UserName: target.dataset.userid
            });
        }

        // Add new friend
        if (target.tagName === 'A'
            && target.classList.contains('add-friend')) {
            this.props.showAddFriend({
                UserName: target.dataset.userid
            });
        }

        // Open file & open folder
        if (target.tagName === 'I'
            && target.classList.contains('is-file')) {
            let message = this.props.getMessage(e.target.parentElement.dataset.id);
            this.showFileAction(message.download);
        }

        // Download file
        if (target.tagName === 'I'
            && target.classList.contains('is-download')) {
            let message = this.props.getMessage(e.target.parentElement.dataset.id);
            let response = await axios.get(message.file.download, { responseType: 'arraybuffer' });
            // eslint-disable-next-line
            let base64 = new window.Buffer(response.data, 'binary').toString('base64');
            let filename = ipcRenderer.sendSync(
                'file-download',
                {
                    filename: `${this.props.downloads}/${message.MsgId}_${message.file.name}`,
                    raw: base64,
                },
            );

            setTimeout(() => {
                message.download = {
                    done: true,
                    path: filename,
                };
            });
        }
    }

    showFileAction(download) {
        var templates = [
            {
                label: 'Open file',
                click: () => {
                    ipcRenderer.send('open-file', download.path);
                }
            },
            {
                label: 'Open the folder',
                click: () => {
                    let dir = download.path.split('/').slice(0, -1).join('/');
                    ipcRenderer.send('open-folder', dir);
                }
            },
        ];
        var menu = new remote.Menu.buildFromTemplate(templates);

        menu.popup(remote.getCurrentWindow());
    }

    showMessageAction(message) {
        var caniforward = [1, 3, 47, 43, 49 + 6].includes(message.MsgType);
        var templates = [
            {
                label: 'Delete',
                click: () => {
                    this.props.deleteMessage(message.MsgId);
                }
            },
        ];
        var menu;

        if (caniforward) {
            templates.unshift({
                label: 'Forward',
                click: () => {
                    this.props.showForward(message);
                }
            });
        }

        if (message.isme
            && message.CreateTime - new Date() < 2 * 60 * 1000) {
            templates.unshift({
                label: 'Recall',
                click: () => {
                    this.props.recallMessage(message);
                }
            });
        }

        if (message.uploading) return;

        menu = new remote.Menu.buildFromTemplate(templates);
        menu.popup(remote.getCurrentWindow());
    }

    showMenu() {
        var user = this.props.user;
        var menu = new remote.Menu.buildFromTemplate([
            {
                label: 'Toggle the conversation',
                click: () => {
                    this.props.toggleConversation();
                }
            },
            {
                type: 'separator',
            },
            {
                label: 'Empty Content',
                click: () => {
                    this.props.empty(user);
                }
            },
            {
                type: 'separator'
            },
            {
                label: helper.isTop(user) ? 'Unsticky' : 'Sticky on Top',
                click: () => {
                    this.props.sticky(user);
                }
            },
            {
                label: 'Delete',
                click: () => {
                    this.props.removeChat(user);
                }
            },
        ]);

        menu.popup(remote.getCurrentWindow());
    }

    handleScroll(e) {
        var tips = this.refs.tips;
        var viewport = e.target;
        var unread = viewport.querySelectorAll(`.${classes.message}.unread`);
        var rect = viewport.getBoundingClientRect();
        var counter = 0;

        const offset = 100 // 100 px before the request
        if (viewport.scrollTop < offset) {
            console.log(viewport.scrollTop);
            this.props.loadOldMessages();
        }

        Array.from(unread).map(e => {
            if (e.getBoundingClientRect().top > rect.bottom) {
                counter += 1;
            } else {
                e.classList.remove('unread');
            }
        });

        if (counter) {
            tips.innerHTML = `You has ${counter} unread messages.`;
            tips.classList.add(classes.show);
        } else {
            tips.classList.remove(classes.show);
        }
    }

    scrollBottomWhenSentMessage() {
        var { user, messages } = this.props;
        var list = messages.get(user.id);

        return list.slice(-1).isme;
    }

    componentWillUnmount() {
        !this.props.rememberConversation && this.props.reset();
    }

    componentDidUpdate() {
        var viewport = this.refs.viewport;
        var tips = this.refs.tips;


        // scroll to bottom
        viewport.scrollTop = viewport.scrollHeight;

        return;
        if (viewport) {
            let newestMessage = this.props.messages.get(this.props.user.UserName).data.slice(-1)[0];
            let images = viewport.querySelectorAll('img.unload');

            // Scroll to bottom when you sent message
            if (newestMessage
                && newestMessage.isme) {
                viewport.scrollTop = viewport.scrollHeight;
                return;
            }

            // Show the unread messages count
            if (viewport.scrollTop < this.scrollTop) {
                let counter = viewport.querySelectorAll(`.${classes.message}.unread`).length;

                if (counter) {
                    tips.innerHTML = `You has ${counter} unread messages.`;
                    tips.classList.add(classes.show);
                }
                return;
            }

            // Auto scroll to bottom when message has been loaded
            Array.from(images).map(e => {
                on(e, 'load', ev => {
                    off(e, 'load');
                    e.classList.remove('unload');
                    viewport.scrollTop = viewport.scrollHeight;
                    this.scrollTop = viewport.scrollTop;
                });

                on(e, 'error', ev => {
                    var fallback = ev.target.dataset.fallback;

                    if (fallback === 'undefined') {
                        fallback = 'assets/images/broken.png';
                    }

                    ev.target.src = fallback;
                    ev.target.removeAttribute('data-fallback');

                    off(e, 'error');
                });
            });

            // Hide the unread message count
            tips.classList.remove(classes.show);
            viewport.scrollTop = viewport.scrollHeight;
            this.scrollTop = viewport.scrollTop;

            // Mark message has been loaded
            Array.from(viewport.querySelectorAll(`.${classes.message}.unread`)).map(e => e.classList.remove('unread'));
        }
    }

    componentWillReceiveProps(nextProps) {
        // When the chat user has been changed, show the last message in viewport
        if (this.props.user && nextProps.user
            && this.props.user.UserName !== nextProps.user.UserName) {
            this.scrollTop = -1;
        }
    }

    render() {
        var { loading, showConversation, user, messages } = this.props;
        var title = user.RemarkName || user.NickName;
        var signature = user.Signature;

        // if (loading) return false;

        return (
            <div
                className={clazz(classes.container, {
                    [classes.hideConversation]: !showConversation,
                })}
                onClick={e => this.handleClick(e)}>
                {
                    user ? (
                        <div>
                            <header>
                                <div className={classes.info}>
                                    <p
                                        dangerouslySetInnerHTML={{ __html: title }}
                                        title={title} />

                                    <span
                                        className={classes.signature}
                                        dangerouslySetInnerHTML={{ __html: signature || 'No Signature' }}
                                        onClick={e => this.props.showMembers(user)}
                                        title={signature} />
                                </div>

                                <i
                                    className="icon-ion-android-more-vertical"
                                    onClick={() => this.showMenu()} />
                            </header>

                            <div
                                className={classes.messages}
                                onScroll={e => this.handleScroll(e)}
                                ref="viewport">
                                {
                                    //this.renderMessages(messages.get(user.UserName), user)
                                    this.renderMessages(messages, user)
                                }
                            </div>
                        </div>
                    ) : (
                            <div className={clazz({
                                [classes.noselected]: !user,
                            })}>
                                <img
                                    className="disabledDrag"
                                    src="assets/images/noselected.png" />
                                <h1>No Chat selected :(</h1>
                            </div>
                        )
                }

                <div
                    className={classes.tips}
                    ref="tips">
                    Unread message.
                </div>
            </div>
        );
    }
}
