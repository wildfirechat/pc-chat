
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
import MessageContentType from '../../../wfc/messages/messageContentType';
import UnsupportMessageContent from '../../../wfc/messages/unsupportMessageConten';
import wfc from '../../../wfc/wfc'
import UserInfo from '../../../wfc/model/userInfo';
import GroupInfo from '../../../wfc/model/groupInfo';
import NotificationMessageContent from '../../../wfc/messages/notification/notificationMessageContent';
import MessageStatus from '../../../wfc/messages/messageStatus';
import { fs } from 'file-system';
import BenzAMRRecorder from 'benz-amr-recorder';
import MessageConfig from '../../../wfc/messageConfig';
import UnknownMessageContent from '../../../wfc/messages/unknownMessageContent';
import EventType from '../../../wfc/wfcEvent';


@inject(stores => ({
    sticky: stores.sessions.sticky,
    empty: stores.chat.empty,
    removeChat: stores.sessions.removeConversation,
    messages: stores.chat.messageList,
    loading: stores.sessions.loading,
    loadOldMessages: stores.chat.loadOldMessages,
    conversation: stores.chat.conversation,
    target: stores.chat.target,
    getTimePanel: (messageTime) => {
        // 当天的消息，以每5分钟为一个跨度显示时间；
        // 消息超过1天、小于1周，显示为“星期 消息发送时间”；
        // 消息大于1周，显示为“日期 消息发送时间”。

    },
    reset: () => {
        //stores.chat.user = false;
    },
    isFriend: (id) => {
        var user = stores.contacts.memberList.find(e => e.UserName === id) || {};
        return helper.isContact(user);
    },
    showUserinfo: async (isme, user) => {

        var caniremove = false;
        if (stores.chat.target instanceof GroupInfo) {
            let groupInfo = stores.chat.target;
            if (groupInfo.target === wfc.getUserId()) {
                caniremove = true;
            }
        }

        stores.userinfo.toggle(true, stores.chat.conversation, user, caniremove);
    },
    getMessage: (messageId) => {
        var list = stores.chat.messageList;
        messageId = Number(messageId);
        return list.find(e => e.messageId === messageId);
    },
    deleteMessage: (messageId) => {
        stores.chat.deleteMessage(messageId);
    },
    showMembers: (target) => {
        // TODO show channel members
        if (target instanceof GroupInfo) {
            stores.members.toggle(true, target);
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
    latestMessage;
    isAudioPlaying = false;
    arm;

    getMessageContent(message) {
        var uploading = message.status === MessageStatus.Sending;

        if (message.messageContent instanceof UnsupportMessageContent) {
            let unsupportMessageContent = message.messageContent;
            return emojiParse(unsupportMessageContent.digest());
        }

        switch (MessageConfig.getMessageContentType(message.messageContent)) {
            case MessageContentType.Unknown:
                let unknownMessageContent = message.messageContent;
                console.log('unknown', unknownMessageContent.digest(), message);
                return emojiParse(unknownMessageContent.digest());
            case MessageContentType.Text:
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
            case MessageContentType.Image:
                // Image
                let image = message.messageContent;

                if (uploading) {
                    return `
                        <div>
                            <img class="open-image unload" data-id="${message.messageId}" src="${image.localPath}" data-fallback="${image.fallback}" />
                            <i class="icon-ion-android-arrow-up"></i>
                        </div>
                    `;
                }
                // return `<img class="open-image unload" data-id="${message.messageId}" src="${image.remotePath}" data-fallback="${image.fallback}" />`;
                // TODO: 图片数据，需要base64编码
                if (image.localPath) {
                    return `<img class="open-image unload" data-id="${message.messageId}" src="${image.localPath}" data-fallback="${image.fallback}" />`;
                } else {
                    //return `<img class="open-image unload" data-id="${message.messageId}" src="data:image/jpeg;base64, ${image.thumbnail}" data-fallback="${image.fallback}" />`;
                    return `<img class="open-image unload" data-id="${message.messageId}" src="${image.remotePath}" data-fallback="${image.fallback}" />`;
                }
            case MessageContentType.Voice:
                /* eslint-disable */
                // Voice
                let voice = message.messageContent;
                let times = voice.duration * 1000;
                let width = 40 + 7 * (times / 2000);
                let seconds = 0;
                /* eslint-enable */

                if (times < 60 * 1000) {
                    seconds = Math.ceil(times / 1000);
                }

                // TODO
                console.log('render voice message content', voice.duration);
                return `
                    <div class="play-voice" style="width: ${width}px" data-voice="${voice.remotePath}">
                        <i class="icon-ion-android-volume-up"></i>
                        <span>
                            ${seconds || '60+'}"
                        </span>

                        <audio controls="controls">
                            <source src="${voice.remotePath}"  type="audio/AMR" />
                        </audio>
                    </div>
                `;
            case 47:
            case MessageContentType.Sticker:
                // External emoji
                let emoji = message.messageContent;

                if (emoji) {
                    if (uploading) {
                        return `
                            <div>
                                <img class="unload disabledDrag" src="${emoji.src}" data-fallback="${emoji.fallback}" />
                                <i class="icon-ion-android-arrow-up"></i>
                            </div>
                        `;
                    }
                    return `<img src="${emoji.remotePath}" class="unload disabledDrag" data-fallback="${emoji.fallback}" />`;
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

            case MessageContentType.Video:
                // Video message
                let video = message.messageContent;

                if (uploading) {
                    return `
                        <div>
                            <video preload="metadata" controls src="${video.localPath}"></video>

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

                if (video.localPath) {
                    return `
                        <video preload="metadata" controls src="${video.localPath}" />
                    `;
                } else {
                    return `
                        <video preload="metadata" poster="data:image/jpeg;base64, ${video.thumbnail}" controls src="${video.remotePath}" />
                    `;
                }

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

            case MessageContentType.File:
                // File message
                let file = message.messageContent;
                let download = fs.existsSync(file.localPath);

                /* eslint-disable */
                return `
                    <div class="${classes.file}" data-id="${message.messageId}">
                        <img src="assets/images/filetypes/${helper.getFiletypeIcon(file.extension)}" class="disabledDrag" />

                        <div>
                            <p>${file.name}</p>
                            <p>${helper.humanSize(file.size)}</p>
                        </div>

                        ${
                    uploading
                        ? '<i class="icon-ion-android-arrow-up"></i>'
                        : (download ? '<i class="icon-ion-android-more-horizontal is-file"></i>' : '<i class="icon-ion-android-arrow-down is-download"></i>')
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
            var user = wfc.getUserInfo(message.from);
            let type = message.messageContent.type;

            if (message.messageContent instanceof NotificationMessageContent) {
                return (
                    <div
                        key={message.messageId}
                        className={clazz('unread', classes.message, classes.system)}
                        dangerouslySetInnerHTML={{ __html: message.messageContent.formatNotification() }} />
                );
            }


            // if (!user) {
            //     return false;
            // }

            return (
                <div key={message.messageId}>
                    <div
                        className={clazz('unread', classes.message, classes.system)}
                        dangerouslySetInnerHTML={{ __html: helper.timeFormat(message.timestamp) }} />
                    <div className={clazz('unread', classes.message, {
                        // File is uploading
                        [classes.uploading]: message.status === MessageStatus.Sending,

                        [classes.isme]: message.direction === 0,
                        //[classes.isText]: type === 1 && !message.location,
                        [classes.isText]: type === MessageContentType.Text || (message.messageContent instanceof UnknownMessageContent) || (message.messageContent instanceof UnsupportMessageContent),
                        [classes.isLocation]: type === MessageContentType.Location,
                        [classes.isImage]: type === MessageContentType.Image,
                        //[classes.isEmoji]: type === 47 || type === 49 + 8,
                        [classes.isEmoji]: type === MessageContentType.Sticker,
                        [classes.isVoice]: type === MessageContentType.Voice,
                        [classes.isVideo]: type === MessageContentType.Video,
                        [classes.isFile]: type === MessageContentType.File,

                        [classes.isContact]: type === 42,
                        // App messages，只在手机上显示的消息
                        [classes.appMessage]: [49 + 2000, 49 + 17, 49 + 6].includes(type),
                        [classes.isTransfer]: type === 49 + 2000,
                        [classes.isLocationSharing]: type === 49 + 17,
                    })}>

                        <div>
                            <Avatar
                                //src={message.isme ? message.HeadImgUrl : user.HeadImgUrl}
                                src={user.portrait ? user.portrait : 'assets/images/user-fallback.png'}
                                className={classes.avatar}
                                onClick={ev => this.props.showUserinfo(message.direction === 0, user)}
                            />

                            <p
                                className={classes.username}
                                //dangerouslySetInnerHTML={{__html: user.DisplayName || user.RemarkName || user.NickName}}
                                dangerouslySetInnerHTML={{ __html: user.displayName }}
                            />

                            <div className={classes.content}>
                                <p
                                    onContextMenu={e => this.showMessageAction(message)}
                                    dangerouslySetInnerHTML={{ __html: this.getMessageContent(message) }} />
                            </div>
                        </div>
                    </div>
                </div>
            );
        });
    }

    // 点击消息的响应
    async handleClick(e) {
        console.log('handle click', e.target.tagName);
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
            let source = audio.querySelector('source');
            let voiceUrl = source.src;

            if (this.isAudioPlaying) {
                console.log('pause current', this.isAudioPlaying);
                let current = document.getElementsByClassName(classes.playing);
                if (current.length > 0) {
                    let currentAudio = current.item(0).querySelector('audio');
                    currentAudio.pause();
                    currentAudio.currentTime = 0;
                    currentAudio.classList.remove(classes.playing)
                    this.isAudioPlaying = false;
                    this.amr.stop();
                    this.amr = null;
                    if (audio == currentAudio) {
                        return;
                    }
                }
            }

            audio.onplay = () => {
                this.amr = new BenzAMRRecorder();
                this.amr.initWithUrl(voiceUrl).then(() => {
                    this.isAudioPlaying = true;
                    this.amr.play();
                });
                this.amr.onEnded(() => {
                    this.isAudioPlaying = false;
                    // do not uncomment the following line
                    // this.amr = null;
                    target.classList.remove(classes.playing)
                    audio.pause();
                    audio.currentTime = 0;
                })
                target.classList.add(classes.playing)
            };
            // audio不支持amr，所以下面两个回调不会走
            // audio.onended = () => {
            //     console.log('onended');
            //     target.classList.remove(classes.playing)
            // };
            audio.onerror = (e) => {
                target.classList.remove(classes.playing)
                console.log('on error', e);
            }
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
            let file = message.messageContent;
            this.showFileAction(file.localPath);
        }

        // Download file
        if (target.tagName === 'I'
            && target.classList.contains('is-download')) {
            let message = this.props.getMessage(e.target.parentElement.dataset.id);
            let file = message.messageContent;
            let response = await axios.get(file.remotePath, { responseType: 'arraybuffer' });
            // eslint-disable-next-line
            let base64 = new window.Buffer(response.data, 'binary').toString('base64');
            let filename = ipcRenderer.sendSync(
                'file-download',
                {
                    filename: `${this.props.downloads}/${message.messageId}_${file.name}`,
                    raw: base64,
                },
            );

            file.localPath = filename;
            wfc.updateMessageContent(message.messageId, file);
            setTimeout(() => {
                message.download = {
                    done: true,
                    path: filename,
                };
            });
        }
    }

    showFileAction(path) {
        var templates = [
            {
                label: 'Open file',
                click: () => {
                    ipcRenderer.send('open-file', path);
                }
            },
            {
                label: 'Open the folder',
                click: () => {
                    let dir = path.split('/').slice(0, -1).join('/');
                    ipcRenderer.send('open-folder', dir);
                }
            },
        ];
        var menu = new remote.Menu.buildFromTemplate(templates);

        menu.popup(remote.getCurrentWindow());
    }

    showMessageAction(message) {

        if (message.messageContent instanceof NotificationMessageContent) {
            return;
        }

        var caniforward = !(message.messageContent instanceof NotificationMessageContent)
        var templates = [
            {
                label: 'Delete',
                click: () => {
                    this.props.deleteMessage(message.messageId);
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

        if (message.direction === 0
            && (Date.now() + wfc.getServerDeltaTime() - message.timestamp) < 2 * 60 * 1000) {
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
        let covnersationInfo = wfc.getConversationInfo(this.props.conversation);
        var menu = new remote.Menu.buildFromTemplate([
            {
                label: '全屏模式/正常模式',
                click: () => {
                    this.props.toggleConversation();
                }
            },
            {
                type: 'separator',
            },
            {
                label: '清空会话消息',
                click: () => {
                    this.props.empty(this.props.conversation);
                }
            },
            {
                type: 'separator'
            },
            {
                label: covnersationInfo.isTop ? '取消置顶' : '置顶',
                click: () => {
                    this.props.sticky(covnersationInfo);
                }
            },
            {
                label: '删除会话',
                click: () => {
                    this.props.removeChat(this.props.conversation);
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
            this.props.loadOldMessages();
        }

        // if (viewport.clientHeight + viewport.scrollTop === viewport.scrollHeight) {
        //     wfc.clearConversationUnreadStatus(this.props.conversation);
        //     wfc.eventEmitter.emit(EventType.ConversationInfoUpdate, this.props.conversation);
        // }

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

    componentWillUnmount() {
        !this.props.rememberConversation && this.props.reset();
        this.stopAudio();
    }

    stopAudio() {
        if (this.amr) {
            this.amr.stop();
            this.amr = null;
        }
    }

    // shouldComponentUpdate(nextProps, nextState) {
    //     return true;
    // }

    componentDidUpdate() {
        var viewport = this.refs.viewport;
        var tips = this.refs.tips;

        if (this.props.conversation) {
            wfc.clearConversationUnreadStatus(this.props.conversation);
        }

        if (viewport) {
            let newestMessage = this.props.messages[this.props.messages.length - 1];
            let images = viewport.querySelectorAll('img.unload');

            let lastLatestMesage = this.latestMessage;
            this.latestMessage = newestMessage;

            // Scroll to bottom when you sent message
            if (newestMessage && newestMessage.direction === 0) {
                if (!lastLatestMesage || lastLatestMesage.messageId !== newestMessage.messageId) {
                    viewport.scrollTop = viewport.scrollHeight;
                    return;
                }
            }

            // Scroll to bottom when you receive message and you alread at the bottom
            if (viewport.clientHeight + viewport.scrollTop === viewport.scrollHeight) {
                viewport.scrollTop = viewport.scrollHeight;
                return;
            }

            // Show the unread messages count
            // TODO unread logic
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
                    // viewport.scrollTop = viewport.scrollHeight;
                    // this.scrollTop = viewport.scrollTop;
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
        // When the chat target has been changed, show the last message in viewport

        // if (nextProps.conversation) {
        //     wfc.clearConversationUnreadStatus(nextProps.conversation);
        //     wfc.eventEmitter.emit(EventType.ConversationInfoUpdate, this.props.conversation);
        // }
        this.scrollTop = -1;
        this.stopAudio();
    }

    title() {
        var title;
        let target = this.props.target;
        if (target instanceof UserInfo) {
            title = this.props.target.displayName;
        } else if (target instanceof GroupInfo) {
            title = target.name;
        } else {
            title = 'TODO';
        }
        return title;
    }

    render() {
        var { loading, showConversation, messages, conversation, target } = this.props;

        var signature = '点击查看群成员';
        if (target instanceof UserInfo) {
            signature = '';
        }

        // maybe userName, groupName, ChannelName or ChatRoomName
        let title = this.title();

        return (
            <div
                className={clazz(classes.container, {
                    [classes.hideConversation]: !showConversation,
                })}
                onClick={e => this.handleClick(e)}>
                {
                    conversation ? (
                        <div>
                            <header>
                                <div className={classes.info}>
                                    <p
                                        dangerouslySetInnerHTML={{ __html: title }}
                                        title={title} />

                                    <span
                                        className={classes.signature}
                                        dangerouslySetInnerHTML={{ __html: signature || '' }}
                                        onClick={e => this.props.showMembers(target)}
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
                                    this.renderMessages(messages, target)
                                }
                            </div>
                        </div>
                    ) : (
                            <div className={clazz({
                                [classes.noselected]: !target,
                            })}>
                                <img
                                    className="disabledDrag"
                                    src="assets/images/noselected.png" />
                                <h1>请选择会话 :(</h1>
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
