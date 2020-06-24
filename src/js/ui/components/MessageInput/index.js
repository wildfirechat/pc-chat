import React, {Component} from 'react';
import Popup from "reactjs-popup";
import PropTypes from 'prop-types';
import Checkbox from 'rc-checkbox';
import {ipcRenderer, isElectron} from '../../../platform';
import clazz from 'classname';

import classes from './style.css';
import Emoji from './Emoji';
import Tribute from "tributejs";
import TextMessageContent from '../../../wfc/messages/textMessageContent';
import PTextMessageContent from '../../../wfc/messages/ptextMessageContent';
import ConversationType from '../../../wfc/model/conversationType';
import wfc from '../../../wfc/client/wfc'
import pinyin from '../../han';
import EventType from '../../../wfc/client/wfcEvent';
import GroupInfo from '../../../wfc/model/groupInfo';
import GroupType from '../../../wfc/model/groupType';
import GroupMemberType from '../../../wfc/model/groupMemberType';
import avenginekitProxy from '../../../wfc/av/engine/avenginekitproxy';
import CheckBox from "rc-checkbox";
import Config from "../../../config";
import { parser as emojiParse } from 'utils/emoji';

export default class MessageInput extends Component {
    static propTypes = {
        me: PropTypes.object,
        sendMessage: PropTypes.func.isRequired,
        showMessage: PropTypes.func.isRequired,
        confirmSendImage: PropTypes.func.isRequired,
        process: PropTypes.func.isRequired,
        conversation: PropTypes.object,
        target: PropTypes.any,
    };

    static defaultProps = {
        me: {},
    };

    tribute;
    mentions = [];

    initMention(conversation) {
        // TODO group, channel
        console.log('initMention');
        let type = conversation.conversationType;
        if (type === ConversationType.Single
            || type === ConversationType.ChatRoom) {
            return
        }

        let mentionMenuItems = [];
        let groupInfo = wfc.getGroupInfo(conversation.target);
        let members = wfc.getGroupMembers(conversation.target);
        if (!members) {
            return;
        }
        mentionMenuItems.push({
            key: "所有人",
            value: '@' + conversation.target,
            avatar: groupInfo.portrait,
            searchKey: '所有人' + pinyin.letter('所有人', '', null)
        });
        let userIds = [];
        members.forEach(e => {
            userIds.push(e.memberId);
        });

        let userInfos = wfc.getUserInfos(userIds, groupInfo.target);
        userInfos.forEach(e => {
            e.groupDisplayName = wfc.getGroupMemberDisplayNameEx(e);
        });
        userInfos.forEach((e) => {
            mentionMenuItems.push({
                key: e.groupDisplayName,
                value: '@' + e.uid,
                avatar: e.portrait,
                searchKey: e.groupDisplayName + pinyin.letter(e.groupDisplayName, '', null)
            });
        });

        this.tribute = new Tribute({
            // menuContainer: document.getElementById('content'),
            values: mentionMenuItems,
            selectTemplate: (item) => {
                if (typeof item === 'undefined') return null;
                // if (this.range.isContentEditable(this.current.element)) {
                //     return '<span contenteditable="false"><a href="http://zurb.com" target="_blank" title="' + item.original.email + '">' + item.original.value + '</a></span>';
                // }
                this.mentions.push({key: item.original.key, value: item.original.value});

                return '@' + item.original.key;
            },
            menuItemTemplate: function (item) {
                return '<img width="24" height="24" src="' + item.original.avatar + ' "> ' + item.original.key;
            },
            lookup: (item) => {
                return item.searchKey;
            },
            menuContainer: document.body,
        });
        this.tribute.attach(document.getElementById('messageInput'));
    }

    handleMention(text) {
        let textMessageContent = new TextMessageContent();
        textMessageContent.content = text;
        this.mentions.forEach(e => {
            if (text.indexOf(e.key) > -1) {
                if (e.value === '@' + this.props.conversation.target) {
                    textMessageContent.mentionedType = 2;
                } else {
                    if (textMessageContent.mentionedType !== 2) {
                        textMessageContent.mentionedType = 1;
                        textMessageContent.mentionedTargets.push(e.value.substring(1));
                    }
                }
            }
        });

        this.mentions.length = 0;
        return textMessageContent;
    }

    canisend() {
        let target = this.props.target;
        if (target instanceof GroupInfo) {
            let groupInfo = target;
            if (groupInfo.type === GroupType.Restricted) {
                let groupMember = wfc.getGroupMember(groupInfo.target, wfc.getUserId());
                if (groupInfo.mute === 1 && groupMember.type === GroupMemberType.Normal) {
                    return false;
                }
            }
        }

        if (this.props.conversation) {
            return true;
        }

        return false;
    }

    async handleEnter(e) {
        var message = this.refs.input.innerHTML.trim();
        var conversation = this.props.conversation;

        if (
            !conversation
            || !this.canisend()
            || !message
            || e.charCode !== 13
        ) return;

        if (e.ctrlKey && e.charCode === 13) {
            e.preventDefault();
            this.refs.input.innerHTML= this.refs.input.innerHTML+ "\n";
            return;
        }

        // TODO batch
        var batch = conversation.length > 1;

        // You can not send message to yourself
        // await this.props.sendMessage(
        //     new TextMessageContent(message)
        // )

        // TODO 处理表情路径变化
        message = message.replace(/<img class="emoji" draggable="false" alt="/g, '')
            .replace(/" src="assets\/twemoji\/72x72\/[0-9a-z]+\.png">/g, '')

        let textMessageContent = this.handleMention(message);
        this.props.sendMessage(textMessageContent);
        this.refs.input.innerHTML= '';
        wfc.setConversationDraft(conversation, '');
        e.preventDefault();
    }

    state = {
        showEmoji: false
    };

    toggleEmoji(show = !this.state.showEmoji) {
        this.setState({showEmoji: show});
    }

    audioCall(show = !this.state.showEmoji) {
        avenginekitProxy.startCall(this.props.conversation, true, [this.props.conversation.target]);
    }

    videoCall(show = !this.state.showEmoji) {
        avenginekitProxy.startCall(this.props.conversation, false, [this.props.conversation.target]);
    }

    async screenShot() {
        if (!isElectron()) {
            return;
        }
        let ret = wfc.screenShot();
        if ('done' === ret) {
            var args = ipcRenderer.sendSync('file-paste');
            if (args.hasImage && this.canisend()) {
                if ((await this.props.confirmSendImage(args.filename)) === false) {
                    return;
                }

                let parts = [
                    new window.Blob([new window.Uint8Array(args.raw)], {type: 'image/png'})
                ];
                let file = new window.File(parts, args.filename, {
                    lastModified: new Date(),
                    type: 'image/png'
                });
                this.batchProcess(file);
            }
        }
    }

    writeEmoji(emoji) {
        var input = this.refs.input;

        //input.value += `[${emoji}]`;
        // input.innerHTML += emojiParse(emoji);
        this.insertTextAtCaret(emojiParse(emoji));
        input.focus();
    }


    createElementFromHTML(htmlString) {
        let div = document.createElement('div');
        div.innerHTML = htmlString.trim();

        // Change this to div.childNodes to support multiple top-level nodes
        return div.firstChild;
    }

    insertTextAtCaret(text) {
        let sel, range;
        if (window.getSelection) {
            sel = window.getSelection();
            if (sel.getRangeAt && sel.rangeCount) {
                range = sel.getRangeAt(0);
                range.deleteContents();
                if(text.startsWith('<')){
                    let imgEmoji = this.createElementFromHTML(text);
                    range.insertNode(imgEmoji);
                    range = document.createRange();
                    range.setStartAfter(imgEmoji);
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }else {
                    range.insertNode( document.createTextNode(text) );
                }
            }
        } else if (document.selection && document.selection.createRange) {
            document.selection.createRange().text = text;
        }
    }

    async batchProcess(file) {
        if (this.canisend() === false) {
            return;
        }
        this.props.process(file);
    }

    async handlePaste(e) {
        if (!isElectron()) {
            let result = this.readClipImage(e);
            if (this.canisend() && result.hasImage) {
                e.preventDefault();
                let url = URL.createObjectURL(result.file);
                if ((await this.props.confirmSendImage(url)) === false) {
                    URL.revokeObjectURL(url);
                    return;
                }
                this.batchProcess(result.file);
                URL.revokeObjectURL(url);
            }
            return;
        }
        var args = ipcRenderer.sendSync('file-paste');

        if (args.hasImage && this.canisend()) {
            e.preventDefault();

            if ((await this.props.confirmSendImage(args.filename)) === false) {
                return;
            }

            let parts = [
                new window.Blob([new window.Uint8Array(args.raw)], {type: 'image/png'})
            ];
            let file = new window.File(parts, args.filename, {
                lastModified: new Date(),
                type: 'image/png'
            });

            this.batchProcess(file);
        }
    }

    readClipImage(event) {
        let result = {hasImage: false, file: null};
        if (event.clipboardData || event.originalEvent) {
            const clipboardData = (event.clipboardData || event.originalEvent.clipboardData);
            if (clipboardData.items) {
                let blob;
                for (let i = 0; i < clipboardData.items.length; i++) {
                    if (clipboardData.items[i].type.indexOf('image') !== -1) {
                        blob = clipboardData.items[i].getAsFile();
                        result.hasImage = true;
                        result.file = blob;
                        break;
                    }
                }
            }
        }
        return result;
    };

    onGroupInfosUpdate = (groupInfos) => {
        console.log('onGroupInfosupdate', groupInfos);
        if (!this.props || !this.shouldHandleMention(this.props.conversation)) {
            return;
        }
        for (const groupInfo of groupInfos) {
            if (groupInfo.target === this.props.conversation.target) {
                if (this.tribute) {
                    this.tribute.detach(document.getElementById('messageInput'));
                    this.tribute = null;
                }
                this.initMention(this.props.conversation);
                break;
            }
        }
    }

    componentDidMount() {
        wfc.eventEmitter.on(EventType.GroupInfosUpdate, this.onGroupInfosUpdate);
        wfc.eventEmitter.on('mention', this.updateMention);
        if (!this.shouldHandleMention(this.props.conversation)) {
            return;
        }
        if (this.props.conversation && !this.tribute) {
            this.initMention(this.props.conversation);
        }
    }

    componentWillUnmount() {
        wfc.eventEmitter.removeListener(EventType.GroupInfosUpdate, this.onGroupInfosUpdate);
        wfc.eventEmitter.removeListener('mention', this.updateMention);
    }

    shouldHandleMention(conversation) {
        if (!conversation) {
            return false;
        }
        return conversation.type === ConversationType.Group;
    }

    componentWillReceiveProps(nextProps) {
        var input = this.refs.input;
        if (!input) {
            return;
        }

        if (
            this.props.conversation
            && nextProps.conversation
            && !this.props.conversation.equal(nextProps.conversation)
        ) {
            let text = input.value.trim();
            let conversationInfo = wfc.getConversationInfo(this.props.conversation);
            if(!conversationInfo){
                return;
            }
            if (text !== conversationInfo.draft) {
                wfc.setConversationDraft(this.props.conversation, text)
            }

            conversationInfo = wfc.getConversationInfo(nextProps.conversation);
            input.value = conversationInfo ? conversationInfo.draft : '';

            if (this.tribute) {
                this.tribute.detach(document.getElementById('messageInput'));
                this.tribute = null;
            }

            if (this.shouldHandleMention(nextProps.conversation)) {
                this.initMention(nextProps.conversation);
            }
        } else if (nextProps.conversation) {
            let conversationInfo = wfc.getConversationInfo(nextProps.conversation);
            if(!conversationInfo){
                return;
            }
            input.value = conversationInfo.draft ? conversationInfo.draft : '';

            if (!this.tribute && this.shouldHandleMention(nextProps.conversation)) {
                this.initMention(nextProps.conversation);
            }
        }

    }

    updateMention = (mentionUser) => {
        var input = this.refs.input;
        let groupDisplayName = wfc.getGroupMemberDisplayNameEx(mentionUser)
        if (mentionUser) {
            input.value += ' @' + groupDisplayName + ' ';
            this.mentions.push({key: groupDisplayName, value: '@' + mentionUser.uid});
            input.focus();
        }
    }


    pickGroupMemberToVoip(audioOnly, close) {
        let groupMemberIds = wfc.getGroupMemberIds(this.props.conversation.target);
        let userInfos = wfc.getUserInfos(groupMemberIds, this.props.conversation.target);

        let checkedIds = new Set();
        let onChange = (e) => {
            if (e.target.checked) {
                checkedIds.add(e.target.name);
            } else {
                checkedIds.delete(e.target.name);
            }
        };

        let startCall = () => {
            if (checkedIds.size > 0) {
                avenginekitProxy.startCall(this.props.conversation, audioOnly, [...checkedIds])
            }

            close();
        }

        let selfUid = wfc.getUserId();

        return (
            <div style={{margin: 20}}>
                <div className={classes.voipTargetList}>
                    {
                        userInfos.map(u => {
                            return (
                                <p key={u.uid}>
                                    <label>
                                        <Checkbox
                                            type="checkbox"
                                            defaultChecked={u.uid === selfUid}
                                            disabled={u.uid === selfUid}
                                            onChange={onChange}
                                            name={u.uid}
                                        />
                                        {u.displayName}
                                    </label>
                                </p>
                            )
                        })

                    }
                </div>

                <button onClick={startCall}>start call</button>
            </div>
        )
    }

    render() {
        var canisend = this.canisend();
        let isGroup = this.props.conversation && this.props.conversation.type === ConversationType.Group;

        return (
            <div
                className={
                    clazz(
                        classes.container,
                        this.props.className,
                        {
                            [classes.shouldSelectUser]: !canisend,
                        }
                    )
                }
            >
                <div
                    className={classes.tips}
                >
                    请先选择一个会话 或 已禁言。
                </div>

                <div className={classes.action}>
                    <i
                        className="icon-ion-android-attach"
                        id="showUploader"
                        onClick={e => canisend && this.refs.uploader.click()}
                    />

                    {
                        isGroup ? (
                            !Config.ENABLE_MULTI_VOIP_CALL ? '' :
                                <Popup key={'voip-video'}
                                       trigger={
                                           <i
                                               className="icon-ion-android-camera"
                                               id="videoCall"
                                           />
                                       }
                                       modal
                                       closeOnDocumentClick
                                       position={"top center"}
                                >
                                    {close => (
                                        this.pickGroupMemberToVoip(false, close)
                                    )
                                    }
                                </Popup>

                        ) : (
                            !Config.ENABLE_SINGLE_VOIP_CALL ? '' :
                            <i
                                className="icon-ion-android-camera"
                                id="videoCall"
                                    onClick={e => canisend && this.videoCall()}
                            />
                        )
                    }

                    {
                        isGroup ? (
                            !Config.ENABLE_MULTI_VOIP_CALL ? '' :
                                <Popup key={'voip-audio'}
                                       trigger={
                                           <i
                                               className="icon-ion-ios-telephone"
                                               id="audioCall"
                                           />
                                       }
                                       modal
                                       closeOnDocumentClick={true}
                                >
                                    {close => (
                                        this.pickGroupMemberToVoip(true, close)
                                    )
                                    }
                                </Popup>

                        ) : (!Config.ENABLE_SINGLE_VOIP_CALL ? '' :
                            <i
                                className="icon-ion-ios-telephone"
                                id="audioCall"
                                    onClick={e => canisend && this.audioCall()}
                            />
                        )
                    }

                    <i
                        className="icon-ion-ios-heart"
                        id="showEmoji"
                        onClick={e => canisend && this.toggleEmoji()}
                        style={{
                            color: 'red',
                        }}
                    />
                    {
                        isElectron() && (
                            <i
                                className="icon-ion-scissors"
                                id="screenShot"
                                onClick={e => canisend && this.screenShot()}
                                style={{
                                    color: 'black',
                                }}
                            />
                        )
                    }

                    <input
                        onChange={e => {
                            this.batchProcess(e.target.files[0]);
                            e.target.value = '';
                        }}
                        ref="uploader"
                        style={{
                            display: 'none',
                        }}
                        type="file"
                    />

                    <Emoji
                        close={e => setTimeout(() => this.toggleEmoji(false), 100)}
                        output={emoji => this.writeEmoji(emoji)}
                        show={this.state.showEmoji}
                    />
                </div>

                <div contentEditable={true}
                    className={classes.test}
                    id="messageInput"
                    ref="input"
                    placeholder="输入内容发送，Ctrl + Enter 换行 ..."
                    readOnly={!canisend}
                    onPaste={e => this.handlePaste(e)}
                    onKeyPress={e => this.handleEnter(e)}
                />
            </div>
        );
    }
}
