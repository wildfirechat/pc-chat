
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ipcRenderer, isElectron } from '../../../platform';
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

export default class MessageInput extends Component {
    static propTypes = {
        me: PropTypes.object,
        sendMessage: PropTypes.func.isRequired,
        showMessage: PropTypes.func.isRequired,
        confirmSendImage: PropTypes.func.isRequired,
        process: PropTypes.func.isRequired,
        conversation: PropTypes.object,
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
        mentionMenuItems.push({ key: "所有人", value: '@' + conversation.target, avatar: groupInfo.portrait, searchKey: '所有人' + pinyin.letter('所有人', '', null) });
        let userIds = [];
        members.forEach(e => {
            userIds.push(e.memberId);
        });

        let userInfos = wfc.getUserInfos(userIds, groupInfo.target);
        userInfos.forEach((e) => {
            mentionMenuItems.push({ key: e.displayName, value: '@' + e.uid, avatar: e.portrait, searchKey: e.displayName + pinyin.letter(e.displayName, '', null) });
        });

        this.tribute = new Tribute({
            // menuContainer: document.getElementById('content'),
            values: mentionMenuItems,
            selectTemplate: (item) => {
                if (typeof item === 'undefined') return null;
                // if (this.range.isContentEditable(this.current.element)) {
                //     return '<span contenteditable="false"><a href="http://zurb.com" target="_blank" title="' + item.original.email + '">' + item.original.value + '</a></span>';
                // }
                this.mentions.push({ key: item.original.key, value: item.original.value });

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
        // var user = this.props.user;

        // if (
        //     true
        //     && user.length === 1
        //     && user.slice(-1).pop().UserName === this.props.me.UserName
        // ) {
        //     this.props.showMessage('Can\'t send messages to yourself.');
        //     return false;
        // }

        if (this.props.conversation) {
            return true;
        }

        return false;
    }

    async handleEnter(e) {
        var message = this.refs.input.value.trim();
        var conversation = this.props.conversation;

        if (
            !conversation
            || !this.canisend()
            || !message
            || e.charCode !== 13
        ) return;

        // TODO batch
        var batch = conversation.length > 1;

        // You can not send message to yourself
        // await this.props.sendMessage(
        //     new TextMessageContent(message)
        // )
        let textMessageContent = this.handleMention(message);
        this.props.sendMessage(textMessageContent);
        this.refs.input.value = '';
    }

    state = {
        showEmoji: false
    };

    toggleEmoji(show = !this.state.showEmoji) {
        this.setState({ showEmoji: show });
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
                    new window.Blob([new window.Uint8Array(args.raw)], { type: 'image/png' })
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

        input.value += `[${emoji}]`;
        input.focus();
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
                new window.Blob([new window.Uint8Array(args.raw)], { type: 'image/png' })
            ];
            let file = new window.File(parts, args.filename, {
                lastModified: new Date(),
                type: 'image/png'
            });

            this.batchProcess(file);
        }
    }
    readClipImage(event) {
        let result = { hasImage: false, file: null };
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

        if (
            true
            && input
            && input.value
            && this.props.conversation
            && !this.props.conversation.equal(nextProps.conversation)
        ) {
            // When user has changed clear the input
            // TODO save draft
            input.value = '';
            if (this.tribute) {
                this.tribute.detach(document.getElementById('messageInput'));
                this.tribute = null;
            }

            if (this.shouldHandleMention(nextProps.conversation)) {
                this.initMention(nextProps.conversation);
            }
        } else if (nextProps.conversation) {
            if (!this.tribute && this.shouldHandleMention(nextProps.conversation)) {
                this.initMention(nextProps.conversation);
            }
        }

    }

    updateMention = (mentionUser) => {
        var input = this.refs.input;
        if (mentionUser) {
            input.value += ' @' + mentionUser.displayName + ' ';
            this.mentions.push({ key: mentionUser.displayName, value: '@' + mentionUser.uid });
            input.focus();
        }
    }

    render() {
        var canisend = this.canisend();

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
                    请先选择一个会话。
                </div>

                <input
                    id="messageInput"
                    ref="input"
                    type="text"
                    placeholder="输入内容发送 ..."
                    readOnly={!canisend}
                    onPaste={e => this.handlePaste(e)}
                    onKeyPress={e => this.handleEnter(e)}
                />

                <div className={classes.action}>
                    <i
                        className="icon-ion-android-attach"
                        id="showUploader"
                        onClick={e => canisend && this.refs.uploader.click()}
                    />

                    <i
                        className="icon-ion-ios-heart"
                        id="showEmoji"
                        onClick={e => canisend && this.toggleEmoji(true)}
                        style={{
                            color: 'red',
                        }}
                    />
                    <i
                        className="icon-ion-scissors"
                        id="screenShot"
                        onClick={e => canisend && this.screenShot()}
                        style={{
                            color: 'black',
                        }}
                    />

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
            </div>
        );
    }
}
