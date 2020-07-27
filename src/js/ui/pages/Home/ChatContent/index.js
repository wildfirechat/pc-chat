import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { ipcRenderer, popMenu, isElectron, fs, ContextMenuTrigger, hideMenu } from '../../../../platform';
import clazz from 'classname';
import moment from 'moment';
import axios from 'axios';

import classes from './style.css';
import Avatar from 'components/Avatar';
import PreviewImage from './PreviewImage'
import helper from 'utils/helper';
import { parser as emojiParse } from 'utils/emoji';
import { on, off } from 'utils/event';
import MessageContentType from '../../../../wfc/messages/messageContentType';
import UnsupportMessageContent from '../../../../wfc/messages/unsupportMessageConten';
import wfc from '../../../../wfc/client/wfc'
import UserInfo from '../../../../wfc/model/userInfo';
import GroupInfo from '../../../../wfc/model/groupInfo';
import NotificationMessageContent from '../../../../wfc/messages/notification/notificationMessageContent';
import MessageStatus from '../../../../wfc/messages/messageStatus';
import BenzAMRRecorder from 'benz-amr-recorder';
import MessageConfig from '../../../../wfc/client/messageConfig';
import UnknownMessageContent from '../../../../wfc/messages/unknownMessageContent';
import EventType from '../../../../wfc/client/wfcEvent';
import ConversationType from '../../../../wfc/model/conversationType';

import GroupType from '../../../../wfc/model/groupType';
import GroupMemberType from '../../../../wfc/model/groupMemberType';
import InfiniteScroll from 'react-infinite-scroller';
import nodePath from 'path';

import UserCard from '../../../components/userCard';
import {gt, gte, numberValue} from '../../../../wfc/util/longUtil'
import {copyImg, copyText} from "../../../utils/clipboard";

@inject(stores => ({
    sticky: stores.sessions.sticky,
    empty: stores.chat.empty,
    removeChat: stores.sessions.removeConversation,
    messages: stores.chat.messageList,
    loading: stores.sessions.loading,
    loadOldMessages: stores.chat.loadOldMessages,
    conversation: stores.chat.conversation,
    target: stores.chat.target,
    togglePreviewImage: stores.chat.togglePreviewImage,
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
    isMyFriend: wfc.isMyFriend,
    showUserinfo: async (isme, user) => {
        var caniremove = false;
        if (stores.chat.target instanceof GroupInfo) {
            let groupInfo = stores.chat.target;
            if (groupInfo.target === wfc.getUserId()) {
                caniremove = true;
            }
            let groupMember = wfc.getGroupMember(groupInfo.target, wfc.getUserId());
            if (groupInfo.type === GroupType.Restricted) {
                if (!groupMember || groupMember.type === GroupMemberType.Normal) {
                    return;
                }
            }

        }
        wfc.getUserInfo(user.uid, true);

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
    showMembers: (target, isShow) => {
        // TODO show channel members
        if (target instanceof GroupInfo) {
            let groupInfo = target;
            let groupMember = wfc.getGroupMember(groupInfo.target, wfc.getUserId());
            if (groupInfo.type === GroupType.Restricted) {
                // if (!groupMember || groupMember.type === GroupMemberType.Normal) {
                //     return;
                // }
            }

        }
        if (isShow) {
            stores.members.toggle(isShow, target);
        } else {
            stores.members.toggle(isShow);
        }
    },
    showContact: (userid) => {
        var user = stores.contacts.memberList.find(e => e.UserName === userid);
        stores.userinfo.toggle(true, user);
    },
    showForward: (message) => stores.forward.toggle(true, message),
    showAddFriend: (user) => stores.addfriend.toggle(true, user),
    recallMessage: stores.chat.recallMessage,
    rememberConversation: stores.settings.rememberConversation,
    showConversation: stores.chat.showConversation,
    toggleConversation: stores.chat.toggleConversation,
    showUserName: stores.members.showUserName,
    showMember: stores.members.show,
    OverallUserCard: stores.OverallUserCard
}))
@observer
export default class ChatContent extends Component {
    lastBottomMessage;
    isAudioPlaying = false;
    arm;
    deliveries;
    readEntries;
    state = {
        isShowMembers: false,
        isShowUserCard: false,
        user: {},
        config: { top: 30, right: 30 }
    }
    hideUserCard() {
        this.setState({
            isShowUserCard: !this.state.isShowUserCard
        });
    }
    showUserCard(user, ev) {
        var isMyFriend = this.props.isMyFriend(user.uid) || user.uid === WildFireIM.config.loginUser.uid;
        // var height = document.body.offsetHeight;
        // var width = document.body.offsetWidth;
        var cardWidth = 310;
        var cardHeight = 250;
        // width: 280px;
        // height: 200px;
        var top = ev.clientY - cardHeight < 0 ? 0 : (ev.clientY - cardHeight);
        var left = ev.clientX - cardWidth < 0 ? 0 : (ev.clientX - cardWidth);
        setTimeout(()=>{
            this.props.OverallUserCard.toggle(true, user, { top: top, left: left }, isMyFriend)
        },200)
        wfc.getUserInfo(user.uid, true);
        ev.preventDefault();
        ev.stopPropagation();
        return false;
        // this.setState({
        //     isShowUserCard: !this.state.isShowUserCard,
        //     user: user,
        //     config: { top: top, left: left },
        //     isMyFriend: isMyFriend
        // });
    }
    getMessageContent(message) {
        var uploading = message.status === MessageStatus.Sending;

        if (message.messageContent instanceof UnsupportMessageContent) {
            let unsupportMessageContent = message.messageContent;
            return emojiParse(unsupportMessageContent.digest(message));
        }

        switch (MessageConfig.getMessageContentType(message.messageContent)) {
            case MessageContentType.Text:
            case MessageContentType.P_Text:
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

                let imgSrc;
                if (fs && image.localPath && fs.existsSync(image.localPath)) {
                    imgSrc = image.localPath;
                } else if (image.thumbnail) {
                    imgSrc = `data:image/jpeg;base64, ${image.thumbnail}`;
                } else {
                    imgSrc = image.remotePath;
                }
                if (uploading) {
                    return `
                        <div>
                            <img class="open-image unload" data-id="${message.messageId}" src="${imgSrc}" data-fallback="${image.fallback}" />
                            <i class="icon-ion-android-arrow-up"></i>
                        </div>
                    `;
                }
                return `<img class="open-image unload" data-remote-path="${image.remotePath}" data-id="${message.messageId}" src="${imgSrc}" data-fallback="${image.fallback}" />`;
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
                let videoThumbnailSrc;
                if (video.localPath) {
                    videoThumbnailSrc = `${video.localPath}#t=0.1`;
                } else if (video.thumbnail) {
                    videoThumbnailSrc = `data:image/jpeg;base64, ${video.thumbnail}`;
                } else {
                    videoThumbnailSrc = `${video.remotePath}#t=0.1`;
                }

                if (uploading) {
                    return `
                        <div>
                            <video preload="metadata" controls src="data:image/jpeg;base64,${videoThumbnailSrc}"></video>

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
                        <video preload="metadata" controls src="${video.localPath}#t=0.1" />
                    `;
                } else {
                    return `
                        <video preload="metadata" poster="data:image/jpeg;base64, ${video.thumbnail}" controls src="${video.remotePath}#t=0.1" />
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
                let download = false;
                if (fs) {
                    download = fs.existsSync(file.localPath);
                }

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

            case MessageContentType.Location:
                // Location sharing...
                return `
                    <div class="${classes.locationSharing}">
                        <i class="icon-ion-ios-location"></i>
                        Location sharing, Please check your phone.
                    </div>
                `;

            case MessageContentType.VOIP_CONTENT_TYPE_START:
                /* eslint-disable */
                let voip = message.messageContent;
                let desc;
                if (voip.status === 0) {
                    desc = '对方未接听';

                } else if (voip.status === 1) {
                    desc = '通话中';
                } else {
                    if (voip.connectTime && voip.connectedTime > 0) {
                        let duration = (voip.endTime - voip.connectTime()) / 1000;
                        desc = `通话时长: ${duration}`

                    } else {
                        desc = '对方未接听';
                    }
                }
                // fixme me
                desc = '视频通话';

                return `
                    <div >
                        <i class="icon-ion-android-call"></i>
                        <span>
                            ${desc}
                        </span>

                    </div>
                `;
            default:
                let unknownMessageContent = message.messageContent;
                console.log('unknown', unknownMessageContent.digest(message), message);
                return emojiParse(unknownMessageContent.digest(message));
        }
    }

    renderMessages(list, from) {
        //return list.data.map((e, index) => {
        console.log('to render message count', list.length);
        var chatch = {};
        return list.map((e) => {
            var message = e;
            let user;
            if (message.conversation.type === ConversationType.Group) {
                user = wfc.getUserInfo(message.from, false, message.conversation.target);
            } else {
                user = wfc.getUserInfo(message.from);
            }
            let type = message.messageContent.type;

            if (message.messageContent instanceof NotificationMessageContent) {
                return (
                    <div
                        key={message.messageId}
                        className={clazz('unread', classes.message, classes.system)}
                        dangerouslySetInnerHTML={{ __html: message.messageContent.formatNotification(message) }} />
                );
            }


            // if (!user) {
            //     return false;
            // }
            // console.warn("message", message);
            var time = new Date(numberValue(message.timestamp));
            var timem = +new Date(time.getFullYear() + '/' + (time.getMonth() + 1) + '/' + (time.getDate()) + ' ' + (time.getHours()) + ':' + (time.getMinutes()))
            var isShwoTime = !!chatch[timem];
            if (!isShwoTime) {
                chatch[timem] = timem;
            }
            return (
                <div key={message.messageId}>
                    {
                        !isShwoTime ? (<div
                            className={clazz('unread', classes.message, classes.system)}
                            data-force-rerennder={message.forceRerender}
                            dangerouslySetInnerHTML={{ __html: helper.timeFormat(message.timestamp) }} />) : ''
                    }
                    <div className={clazz('unread', classes.message, {
                        [classes.uploading]: message.status === MessageStatus.Sending,

                        [classes.isme]: message.direction === 0,
                        [classes.isText]: type === MessageContentType.Text || type === MessageContentType.P_Text || (message.messageContent instanceof UnknownMessageContent) || (message.messageContent instanceof UnsupportMessageContent),
                        // [classes.isLocation]: type === MessageContentType.Location,
                        [classes.isImage]: type === MessageContentType.Image,
                        [classes.isEmoji]: type === MessageContentType.Sticker,
                        [classes.isVoice]: type === MessageContentType.Voice,
                        [classes.isVideo]: type === MessageContentType.Video,
                        [classes.isFile]: type === MessageContentType.File,
                        [classes.isVoip]: type === MessageContentType.VOIP_CONTENT_TYPE_START
                    })}>

                        <div>
                            {
                                this.userInfoLayout(user, message)
                            }

                            {this.props.showUserName && <p
                                className={classes.username}
                                //dangerouslySetInnerHTML={{__html: user.DisplayName || user.RemarkName || user.NickName}}
                                dangerouslySetInnerHTML={{ __html: wfc.getUserDisplayName(user.uid) }}
                            />}

                            {
                                this.messageContentLayout(message)
                            }

                        </div>
                    </div>
                </div>
            );
        });
    }

    userInfoLayout(user, message) {
        if (isElectron()) {
            return (
                <Avatar
                    //src={message.isme ? message.HeadImgUrl : user.HeadImgUrl}
                    src={user.portrait ? user.portrait : 'assets/images/user-fallback.png'}
                    className={classes.avatar}
                    onContextMenu={e => this.showUserAction(user)}
                    onClick={ev => this.showUserCard(user, ev)}
                />
            );
        } else {
            return (
                <div>
                    <ContextMenuTrigger id={`user_item_${user.uid}_${message.messageId}`}>
                        <Avatar
                            //src={message.isme ? message.HeadImgUrl : user.HeadImgUrl}
                            src={user.portrait ? user.portrait : 'assets/images/user-fallback.png'}
                            className={classes.avatar}
                            onClick={ev => this.showUserCard(user, ev)}
                        />
                    </ContextMenuTrigger>
                    {
                        this.showUserAction(user, `user_item_${user.uid}_${message.messageId}`)
                    }
                </div>
            );
        }

    }

    messageContentLayout(message) {
        if (isElectron()) {
            return (
                <div>
                    <div className={classes.content} data-message-id={message.messageId}
                        onClick={e => this.handleClick(e)}>
                        <p
                            onContextMenu={e => this.showMessageAction(message)}
                            dangerouslySetInnerHTML={{ __html: this.getMessageContent(message) }} />
                    </div>
                    {
                        message.direction === 0 && wfc.isCommercialServer() && wfc.isReceiptEnabled() && wfc.isUserReceiptEnabled() ?
                            <p style={{
                                fontSize:'10px',
                                color:'#a9a9a9',
                                userSelect:'none'
                            }}>{this.formatReceiptMessage(message.timestamp)}</p> : ''
                    }
                </div>
            );
        } else {
            return (
                <div>
                    <ContextMenuTrigger id={`menu_item_${message.messageId}`}>
                        <div className={classes.content} data-message-id={message.messageId}
                            onClick={e => this.handleClick(e)}>
                            <p
                                // onContextMenu={e => this.showMessageAction(message)}
                                dangerouslySetInnerHTML={{ __html: this.getMessageContent(message) }} />
                        </div>
                    </ContextMenuTrigger>
                    {
                        this.showMessageAction(message, `menu_item_${message.messageId}`)
                    }
                    {
                        message.direction === 0 ?
                        <p style={{
                            fontSize:'10px',
                            color:'#a9a9a9',
                            userSelect:'none'
                        }}>{this.formatReceiptMessage(message.timestamp)}</p> : ''
                    }
                </div>
            );
        }
    }

    // 点击消息的响应
    async handleClick(e) {
        var target = e.target;

        let messageId;
        let currentElement = e.target;
        while (currentElement) {
            messageId = currentElement.dataset.messageId;
            if (messageId) {
                break;
            } else {
                currentElement = currentElement.parentElement;
            }
        }
        if (!currentElement || !currentElement.dataset) {
            return;
        }
        messageId = Number(currentElement.dataset.messageId);

        console.log('handle message click', messageId);

        // Open the image
        if (target.tagName === 'IMG'
            && target.classList.contains('open-image')) {
            let base64;
            let src;
            if (target.src.startsWith('file') || target.src.startsWith('http')) {
                src = target.src;
            } else {
                // thumbnail
                if (target.src.startsWith('data')) {
                    base64 = target.src.split(',')[1];
                }
                src = target.dataset.remotePath;
            }
            // file
            if (src) {
                // Get image from cache and convert to base64
                let response = await axios.get(src, { responseType: 'arraybuffer' });
                // eslint-disable-next-line
                base64 = Buffer.from(response.data, 'binary').toString('base64');
            }


            if (false) {
                ipcRenderer.send('open-image', {
                    dataset: target.dataset,
                    base64,
                });
            } else {
                this.props.togglePreviewImage(e, true, messageId);
            }

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
            if (isElectron()) {
                ipcRenderer.send('open-map', {
                    map: target.dataset.map,
                });
            } else {
                // TODO
            }
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
            // eslint-disable-next-line
            if (isElectron()) {
                // let response = await axios.get(file.remotePath, { responseType: 'arraybuffer' });
                // let base64 = Buffer.from(response.data, 'binary').toString('base64');
                // let filename = ipcRenderer.sendSync(
                //     'file-download',
                //     {
                //         filename: `${message.messageId}_${file.name}`,
                //         raw: base64,
                //     },
                // );
                // file.localPath = filename;
                //
                // wfc.updateMessageContent(message.messageId, file);
                // this.props.forceRerenderMessage(message.messageId);
                ipcRenderer.send('file-download', {messageId : message.messageId, remotePath : file.remotePath});
            } else {
                let varExt = file.remotePath.split('.');
                if (varExt[varExt.length - 1] === "txt" || varExt[varExt.length -1] === "log") {
                    window.open(file.remotePath);
                }
                else {
                    let iframe;
                    iframe = document.getElementById("hiddenDownloader");
                    if (iframe == null) {
                        iframe = document.createElement('iframe');
                        iframe.id = "hiddenDownloader";
                        iframe.style.visibility = 'hidden';
                        document.body.appendChild(iframe);
                    }
                    iframe.src = file.remotePath;
                }
            }
        }
    }

    // electron only
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
                    let dir = path.split(nodePath.sep).slice(0, -1).join(nodePath.sep);
                    ipcRenderer.send('open-folder', dir);
                }
            },
        ];
        popMenu(templates);
    }

    showUserAction(userInfo, menuId) {
        if (this.props.conversation.type !== ConversationType.Group || userInfo.uid === wfc.getUserId()) {
            return;
        }

        var templates = [
            {
                label: `@${wfc.getGroupMemberDisplayName(this.props.conversation.target, userInfo.uid)}`,
                click: () => {
                    wfc.eventEmitter.emit('mention', userInfo);
                }
            },
        ];
        return popMenu(templates, userInfo, menuId);
    }

    showMessageAction(message, menuId) {

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

        if (caniforward) {
            templates.unshift({
                label: 'Forward',
                click: () => {
                    this.props.showForward(message);
                }
            });
        }

        if([MessageContentType.Text, MessageContentType.Image].indexOf(message.messageContent.type) >= 0){
            templates.unshift({
                label: 'copy',
                click: () => {
                    // this.props.showForward(message);
                    let blob;
                    if(message.messageContent.type === MessageContentType.Image){
                        copyImg(message.messageContent.localPath ? message.messageContent.localPath : message.messageContent.remotePath);
                    } else {
                        copyText(message.messageContent.content);
                    }
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

        return popMenu(templates, message, menuId);
    }

    componentWillMount() {
        console.log('componentWillMount');
        wfc.eventEmitter.on(EventType.UserInfosUpdate, this.onUserInfosUpdate);
        wfc.eventEmitter.on(EventType.GroupInfosUpdate, this.onGroupInfosUpdate);
        wfc.eventEmitter.on(EventType.MessageReceived, this.onMessageDelivered)
        wfc.eventEmitter.on(EventType.MessageRead, this.onMessageRead)
    }

    componentWillUnmount() {
        this.lastBottomMessage = null;
        !this.props.rememberConversation && this.props.reset();
        this.stopAudio();

        wfc.eventEmitter.removeListener(EventType.UserInfosUpdate, this.onUserInfosUpdate);
        wfc.eventEmitter.removeListener(EventType.GroupInfosUpdate, this.onGroupInfosUpdate);
        wfc.eventEmitter.removeListener(EventType.MessageReceived, this.onMessageDelivered)
        wfc.eventEmitter.removeListener(EventType.MessageRead, this.onMessageRead)
    }

    stopAudio() {
        if (this.amr) {
            this.amr.stop();
            this.amr = null;
        }
    }

    componentDidUpdate() {
        this.scrollToBottom();
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
            title = wfc.getUserDisplayName(this.props.target.uid);
        } else if (target instanceof GroupInfo) {
            title = target.name;
        } else {
            console.log('chatTo.........', target);
            title = 'TODO';
        }
        return title;
    }
    showMembers(target) {
        // this.setState({
        //     isShowMembers: !this.state.isShowMembers
        // });
        // console.warn(this.props.showMember,this.state.isShowMembers);

        let isShowMember = sessionStorage.getItem("isShowMember");
        this.props.showMembers(target, isShowMember !== 'true');
        // if(!this.props.showMember == )
        // if (this.props.showMember != this.state.isShowMembers) {
        // }else{
        //     this.props.showMembers(target, !this.props.showMember);
        // }
    }
    render() {
        if(this.props.conversation){
            this.deliveries = wfc.getConversationDelivery(this.props.conversation);
            this.readEntries = wfc.getConversationRead(this.props.conversation);
        }

        var { loading, showConversation, messages, conversation, target } = this.props;


        // maybe userName, groupName, ChannelName or ChatRoomName
        let title = this.title();

        return (
            <div
                className={clazz(classes.container, {
                    [classes.hideConversation]: !showConversation,
                })}>
                <UserCard showCard={this.state.isShowUserCard}
                    user={this.state.user} config={this.state.config} isCurrentUser={!this.state.isMyFriend}
                    hideCard={() => this.hideUserCard(false)} />
                {
                    conversation ? (
                        <div>
                            <header>
                                <div className={classes.info}>
                                    <p
                                        dangerouslySetInnerHTML={{ __html: title }}
                                        title={title} />


                                </div>

                                {
                                    <span
                                        className={classes.signature}
                                        // dangerouslySetInnerHTML={{__html: signature || '...'}}
                                        onClick={e => this.showMembers(target)}
                                        >
                                        <i className="icon-ion-android-more-vertical" />
                                    </span>
                                }

                            </header>

                            <div
                                className={classes.messages}
                                // onScroll={e => this.handleScroll(e)}
                                ref={(div) => {
                                    this.messageList = div;
                                }}>
                                <InfiniteScroll
                                    pageStart={0}
                                    loadMore={this.loadFunc}
                                    initialLoad={true}
                                    isReverse={true}
                                    hasMore={true}
                                    loader={<div className="loader" key={0}>Loading ...</div>}
                                    useWindow={false}
                                >
                                    {
                                        //this.renderMessages(messages.get(user.UserName), user)
                                        this.renderMessages(messages, target)
                                    }
                                </InfiniteScroll>
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
                <PreviewImage onRef={ref => (this.previewImage = ref)} />
            </div>
        );
    }

    scrollToBottom = () => {
        if (this.props.messages && this.props.messages.length > 0) {
            let currentBottomMessage = this.props.messages[this.props.messages.length - 1];
            if (this.lastBottomMessage && this.lastBottomMessage.messageId === currentBottomMessage.messageId) {
                console.log('not scroll to bottom', this.lastBottomMessage.messageId, currentBottomMessage.messageId);
                return;
            }
            console.log('scroll to bottom');
            this.lastBottomMessage = currentBottomMessage;
        }

        if (this.messageList) {
            const scrollHeight = this.messageList.scrollHeight;
            const height = this.messageList.clientHeight;
            // const maxScrollTop = scrollHeight - height;
            var messageList = this.messageList;
            setTimeout(() => {
                messageList.scrollTop = scrollHeight > 0 ? scrollHeight : 0;
            }, 300)
        }
    }

    loadFunc = () => {
        console.log('---------------loadFunc');
        this.props.loadOldMessages();
    }

    onUserInfosUpdate = (userInfos) => {
        for (const userInfo of userInfos) {
            this.props.OverallUserCard.onUserInfoUpdate(userInfo)
            }
        //TODO optimize
        this.forceUpdate();
    }

    onGroupInfosUpdate = (groupInfos) => {
        // TODO optimize
        this.forceUpdate();
    }
    onMessageDelivered = (deliveries) => {
        if(!this.props.conversation){
            return ;
        }
        //single
        if(this.props.conversation.type === 0){
            let recvDt = deliveries.get(this.props.conversation.target);
            if(recvDt) {
                this.forceUpdate();
            }
        }else if(this.props.conversation.type === 1){
            // group
            // TODO optimize
            this.forceUpdate();
        }
    }

    onMessageRead = (readEntries) => {
        if(!this.props.conversation){
            return ;
        }
        //single
        if(this.props.conversation.type === 0){
            for (const readEntry of readEntries) {
                if(readEntry.userId === this.props.conversation.target){
                    this.forceUpdate();
                }
            }
        }else if(this.props.conversation.type === 1){
            // group
            // TODO optimize
            this.forceUpdate();
        }
    }

    formatReceiptMessage(timestamp){
        let receiptDesc = '';
        if(this.props.conversation.type === 0){
            let recvDt = this.deliveries ? this.deliveries.get(this.props.conversation.target) : 0;
            let readDt = this.readEntries ? this.readEntries.get(this.props.conversation.target) : 0;
            if(readDt && gte(readDt, timestamp)){
                receiptDesc = '已读';
            }else if(recvDt && gte(recvDt, timestamp)){
                receiptDesc = '未读'
            }else {
                receiptDesc = '未送达'
            }
        }else if(this.props.conversation.type === 1){
            let groupMembers = wfc.getGroupMemberIds(this.props.conversation.target, false);
            if(!groupMembers || groupMembers.length === 0){
                receiptDesc = '';
            }else {
                let memberCount = groupMembers.length;
                let recvCount = 0;
                let readCount = 0;

                groupMembers.forEach(memberId => {
                    let recvDt = this.deliveries ? this.deliveries.get(memberId) : 0;
                    let readDt = this.readEntries ? this.readEntries.get(memberId) : 0;
                    if(readDt && gte(readDt, timestamp)){
                        readCount ++;
                        recvCount ++;
                    }else if(recvDt && gte(recvDt, timestamp)){
                        recvCount ++;
                    }
                });
                receiptDesc = `已送达 ${recvCount}/${memberCount}，已读 ${readCount}/${memberCount}`
            }
        }

        return receiptDesc;
    }

    zeroPad(nr, base) {
        var len = (String(base).length - String(nr).length) + 1;
        return len > 0 ? new Array(len).join('0') + nr : nr;
    }
}
