import clazz from 'classname';
import React, { Component } from 'react';
import { parser as emojiParse } from 'utils/emoji';
import helper from 'utils/helper';
import ConversationType from '../../../../wfc/model/conversationType';
import classes from './style.css';
import ConversationInfo from '../../../../wfc/model/conversationInfo';
import { isElectron, popMenu, ContextMenuTrigger, hideMenu } from '../../../../platform'


export default class ConversationItem extends Component {
    active = false;

    // 1. 原来是空的
    // 2. 绑定新的数据(新会话，会话更新了, 会话的target更新了)
    // 3. 选中、取消选中
    shouldComponentUpdate(nextProps) {
        if (!this.props.conversationInfo || this.active === undefined) {
            return true;
        }

        if (!ConversationInfo.equals(this.props.conversationInfo, nextProps.conversationInfo)) {
            return true;
        }

        if (nextProps.currentConversation && this.active !== (nextProps.currentConversation.equal(nextProps.conversationInfo.conversation))) {
            return true;
        }

        return false;
    }

    showContextMenu(conversationInfo, menuId) {
        let templates = [
            {
                label: 'Send Message',
                click: () => {
                    this.props.chatTo(conversationInfo.conversation);
                }
            },
            {
                label: conversationInfo.isTop ? 'Unsticky' : 'Sticky on Top',
                click: () => {
                    this.props.sticky(conversationInfo);
                }
            },
            {
                label: 'Delete',
                click: () => {
                    this.props.removeChat(conversationInfo);
                }
            },
            {
                label: 'Mark as Read',
                click: () => {
                    this.props.markedRead(conversationInfo);
                }
            },
        ];

        return popMenu(templates, conversationInfo, menuId);
    }

    handleError(e) {
        if (!e.target.src.endsWith('assets/images/user-fallback.png')) {
            e.target.src = 'assets/images/user-fallback.png';
        }
    }

    render() {
        let e = this.props.conversationInfo;
        let conversation = this.props.currentConversation;
        this.active = conversation && conversation.equal(e.conversation);
        let chatTo = this.props.chatTo;
        var muted = e.isSilent;
        var isTop = e.isTop;
        let unreadCount = e.unreadCount;
        let hasUnread = unreadCount.unread > 0 || unreadCount.unreadMention > 0 || unreadCount.unreadMentionAll > 0;
        var portrait = e.portrait();
        let txtUnread = unreadCount.unread > 99 ? "..." : unreadCount.unread;
        let isSilent = <svg style={{ position: 'absolute', right: '13px', bottom: '6px' }} t="1588487171323" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1576" width="20" height="20"><path d="M826.20416 844.65664a39.5264 39.5264 0 0 1-28.16-11.71456L240.68096 275.59936a39.89504 39.89504 0 0 1-0.04096-56.2176c14.97088-15.09376 41.2672-15.09376 56.32-0.04096l40.59136 40.59136a244.77696 244.77696 0 0 1 113.78688-65.65888 61.37856 61.37856 0 0 1 60.39552-50.93376 61.35808 61.35808 0 0 1 60.27264 50.3808 242.8928 242.8928 0 0 1 182.39488 208.44544c15.95392 138.01472 36.08576 245.49376 58.18368 310.80448a61.44 61.44 0 0 1 3.072 25.088l38.66624 38.64576c7.53664 7.51616 11.69408 17.55136 11.65312 28.24192a39.30112 39.30112 0 0 1-11.73504 28.09856 38.97344 38.97344 0 0 1-28.03712 11.61216zM268.8 244.4288a2.8672 2.8672 0 0 0-2.06848 0.83968 3.072 3.072 0 0 0-0.04096 4.34176l557.3632 557.3632c2.2528 2.27328 3.33824 0.90112 4.13696 0.14336 0.88064-0.90112 1.04448-1.69984 1.04448-2.23232a3.072 3.072 0 0 0-0.88064-2.1504l-52.87936-52.87936 2.74432-10.24c1.35168-5.0176 1.2288-9.99424-0.43008-14.80704-23.28576-68.73088-43.43808-175.86176-59.904-318.40256a206.41792 206.41792 0 0 0-167.13728-179.73248l-16.40448-3.13344 1.82272-18.7392a24.4736 24.4736 0 1 0-48.90624-0.2048l2.60096 19.27168-17.05984 3.2768a207.68768 207.68768 0 0 0-120.4224 71.20896l-12.88192 15.50336-68.52608-68.5056a2.99008 2.99008 0 0 0-2.17088-0.9216z m242.95424 593.12128a104.28416 104.28416 0 0 1-83.74272-42.86464h-159.37536a60.2112 60.2112 0 0 1-49.4592-25.35424 62.5664 62.5664 0 0 1-8.2944-56.36096c22.1184-65.41312 42.25024-172.89216 58.18368-310.80448 1.69984-14.52032 4.7104-28.95872 8.97024-42.9056l8.92928-29.30688L751.616 794.68544h-156.11904a104.1408 104.1408 0 0 1-83.74272 42.86464zM306.25792 401.26464l-0.67584 5.16096c-16.46592 142.41792-36.59776 249.52832-59.86304 318.32064-2.70336 8.00768-1.49504 16.44544 3.33824 23.1424 4.56704 6.38976 11.71456 10.01472 19.59936 10.01472H448.512l5.30432 9.1136c12.32896 21.13536 33.9968 33.75104 57.9584 33.75104a67.33824 67.33824 0 0 0 57.91744-33.71008l5.30432-9.15456h87.87968L306.25792 401.26464z" fill="#8a8a8a" p-id="1577"></path></svg>;
        if (!portrait) {
            switch (e.conversation.type) {
                case ConversationType.Single:
                    portrait = 'assets/images/user-fallback.png';
                    break;
                case ConversationType.Group:
                    portrait = 'assets/images/default_group_avatar.png';
                    break;
                default:
                    break;
            }
        }

        if (isElectron()) {
            var userInfo = this.props.getUserInfo && e.lastMessage && this.props.getUserInfo(e.lastMessage.from, false, e.target);
            // console.warn("console-user-list", e);
            var userName = userInfo && e.conversation.conversationType === 1 ? userInfo.displayName + ':' : '';
            return (
                <div
                    className={clazz(classes.chat, {
                        [classes.sticky]: isTop,
                        [classes.active]: this.active,
                    })}
                    // TODO key should be conversation
                    onContextMenu={ev => this.showContextMenu(e)}
                    onClick={ev => {
                        chatTo(e.conversation);
                        this.props.markedRead(e);
                    }}>
                    <div className={clazz(classes.inner,classes.fristchat)}>
                        <div data-aftercontent={txtUnread} className={clazz(classes.dot, {
                            [classes.green]: muted && hasUnread,
                            [classes.red]: !muted && hasUnread
                        })}>
                            <img
                                className="disabledDrag"
                                // TODO portrait
                                src={portrait}
                                onError={this.handleError}
                            />
                        </div>

                        <div className={classes.info}>
                            <p
                                className={classes.username}
                                dangerouslySetInnerHTML={{ __html: e.title() }} />

                            <span
                                className={classes.message}
                                dangerouslySetInnerHTML={{ __html: e.draft ? '[草稿]' + e.draft : (e.lastMessage && e.lastMessage.messageContent ? userName + emojiParse(e.lastMessage.messageContent.digest(e.lastMessage)) : '') }} />
                            {e.isSilent ? isSilent : ''}
                        </div>
                    </div>

                    <span className={classes.times}>
                        {
                            e.timestamp ? helper.timeFormat(e.timestamp) : ''
                        }
                    </span>
                </div>
            );
        } else {
            let conversationKey = e.conversation ? e.conversation.type + e.conversation.target + e.conversation.linei : '';
            let menuId = `conversation_item_${conversationKey}`
            return (
                <div>
                    <ContextMenuTrigger id={menuId}>
                        <div
                            className={clazz(classes.chat, {
                                [classes.sticky]: isTop,
                                [classes.active]: this.active,
                            })}
                            onClick={ev => {
                                chatTo(e.conversation)
                                this.props.markedRead(e);
                            }}>
                            <div className={classes.inner}>
                                <div data-aftercontent={txtUnread} className={clazz(classes.dot, {
                                    [classes.green]: muted && hasUnread,
                                    [classes.red]: !muted && hasUnread
                                })}>
                                    <img
                                        className="disabledDrag"
                                        // TODO portrait
                                        src={portrait}
                                        onError={this.handleError}
                                    />
                                </div>

                                <div className={classes.info}>
                                    <p
                                        className={classes.username}
                                        dangerouslySetInnerHTML={{ __html: e.title() }} />

                                    <span
                                        className={classes.message}
                                        dangerouslySetInnerHTML={{__html: e.draft ? '[草稿]' + e.draft : (e.lastMessage && e.lastMessage.messageContent ? e.lastMessage.messageContent.digest(e.lastMessage) : '')}}/>
                                </div>
                            </div>

                            <span className={classes.times}>
                                {
                                    e.timestamp ? helper.timeFormat(e.timestamp) : ''
                                }
                            </span>
                        </div>
                    </ContextMenuTrigger>
                    {
                        this.showContextMenu(e, menuId)
                    }
                </div>
            )
        }
    }

}
