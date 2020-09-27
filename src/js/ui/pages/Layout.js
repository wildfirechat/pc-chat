
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { ipcRenderer, remote, isElectron } from '../../platform';

import classes from './Layout.css';
import Header from './Header';
import Footer from './Footer';
import UserInfo from './UserInfo';
import AddFriend from './AddFriend';
import NewChat from './NewChat';
import Members from './Members';
import AddMember from './AddMember';
import OverallUserCard from './OverallUserCard';
import Forward from './Forward';
import ConfirmImagePaste from './ConfirmImagePaste';
import Loader from 'components/Loader';
import Snackbar from 'components/Snackbar';
import Login from './Login';
import wfc from '../../wfc/client/wfc'
import { observable, action } from 'mobx';
import EventType from '../../wfc/client/wfcEvent';
import ConnectionStatus from '../../wfc/client/connectionStatus';
import clazz from 'classname';
import ConversationType from "../../wfc/model/conversationType";
import MessageConfig from "../../wfc/client/messageConfig";
import PersistFlag from "../../wfc/messages/persistFlag";
import Push from "push.js";
import stores from "../stores";

@inject(stores => ({
    isLogin: () => !!stores.sessions.auth,
    loading: stores.sessions.loading,
    message: stores.snackbar.text,
    show: stores.snackbar.show,
    process: stores.chat.process,
    reconnect: stores.sessions.checkTimeout,
    close: () => stores.snackbar.toggle(false),
    canidrag: () => !!stores.chat.conversation,
}))
@observer
export default class Layout extends Component {
    @observable connectionStatus = 0;


    state = {
        offline: false,
    };

    componentDidMount() {
        if (isElectron()) {
            var templates = [
                {
                    label: 'Undo',
                    role: 'undo',
                }, {
                    label: 'Redo',
                    role: 'redo',
                }, {
                    type: 'separator',
                }, {
                    label: 'Cut',
                    role: 'cut',
                }, {
                    label: 'Copy',
                    role: 'copy',
                }, {
                    label: 'Paste',
                    role: 'paste',
                }, {
                    type: 'separator',
                }, {
                    label: 'Select all',
                    role: 'selectall',
                },
            ];
            var menu = new remote.Menu.buildFromTemplate(templates);

            document.body.addEventListener('contextmenu', e => {
                e.preventDefault();

                let node = e.target;

                while (node) {
                    if (node.nodeName.match(/^(input|textarea)$/i)
                        || node.isContentEditable) {
                        menu.popup(remote.getCurrentWindow());
                        break;
                    }
                    node = node.parentNode;
                }
            });
        }

        var canidrag = this.props.canidrag;
        // window.addEventListener('offline', () => {
        //     this.setState({
        //         offline: true,
        //     });
        // });

        // window.addEventListener('online', () => {
        //     // Reconnect to wechat
        //     this.props.reconnect();
        //     this.setState({
        //         offline: false,
        //     });
        // });


        if (window.process && window.process.platform != 'darwin') {
            document.body.classList.add('isWin');
        }

        window.ondragover = e => {
            if (this.props.canidrag()) {
                this.refs.holder.classList.add(classes.show);
                this.refs.viewport.classList.add(classes.blur);
            }

            // If not st as 'copy', electron will open the drop file
            e.dataTransfer.dropEffect = 'copy';
            return false;
        };

        window.ondragleave = () => {
            if (!this.props.canidrag()) return false;

            this.refs.holder.classList.remove(classes.show);
            this.refs.viewport.classList.remove(classes.blur);
        };

        window.ondragend = e => {
            return false;
        };

        window.ondrop = e => {
            console.log('on drop');
            var files = e.dataTransfer.files;
            e.preventDefault();
            e.stopPropagation();

            if (files.length && this.props.canidrag()) {
                Array.from(files).map(e => this.props.process(e));
            }

            this.refs.holder.classList.remove(classes.show);
            this.refs.viewport.classList.remove(classes.blur);
            return false;
        };
    }

    onConnectionStatusChange = (status) => {
        console.log('layout connection status', status)
        this.updateConnectionStatus(status)
        if(status === ConnectionStatus.ConnectionStatusConnected){
            this.updateUnreadStatus();
        }
    }

    @action
    updateConnectionStatus(status){
        this.connectionStatus = status;
    }

    updateUnreadStatus =()=>{
        let cl = wfc.getConversationList([ConversationType.Single, ConversationType.Group, ConversationType.Channel], [0]);
        if(!cl){
            return ;
        }
        let counter = 0;
        cl.forEach((e) => {
            counter += e.isSilent ? 0 : e.unreadCount.unread;
        });
        stores.sessions.setUnreadMessageCount(counter)
        if (ipcRenderer) {
            if(this.isWin()){
                ipcRenderer.sendSync('update-badge', counter > 0 ? counter : null);
            }
            ipcRenderer.send(
                'message-unread',
                {
                    counter,
                }
            );
        } else {
            document.title = counter === 0 ? "野火IM" : (`野火IM(有${counter}条未读消息)`);
        }
    }

    onReceiveMessage= (msg)=>{
        let conversationInfo = wfc.getConversationInfo(msg.conversation);
        if(conversationInfo.isSilent){
            return;
        }
        let toConversation = (conversation) =>{
            stores.chat.chatToN(conversation);
            if (this.props.history.location.pathname !== '/') {
                this.props.history.push('/');
            }
            document.querySelector('#messageInput').focus();
        }

        if (document.hidden) {
            let content = msg.messageContent;
            let conversationInfo = wfc.getConversationInfo(msg.conversation);

            if (MessageConfig.getMessageContentPersitFlag(content.type) === PersistFlag.Persist_And_Count) {
                Push.create(conversationInfo.title(), {
                    body: content.digest(),
                    icon: conversationInfo.portrait(),
                    timeout: 4000,
                    onClick: function () {
                        window.focus();
                        this.close();
                        toConversation(msg.conversation);
                    }
                });
            }
        }
        this.updateUnreadStatus();
    }
    componentWillMount() {
        console.log('layout--------------wfc', wfc);
        wfc.eventEmitter.on(EventType.ConnectionStatusChanged, this.onConnectionStatusChange);
        wfc.eventEmitter.on(EventType.ReceiveMessage, this.onReceiveMessage);
        wfc.eventEmitter.on(EventType.RecallMessage, this.updateUnreadStatus);
        wfc.eventEmitter.on(EventType.ConversationInfoUpdate, this.updateUnreadStatus);
        // 多端会话同步，其他端已读之后，更新pc未读状态
        wfc.eventEmitter.on(EventType.SettingUpdate, this.updateUnreadStatus);
    }

    componentWillUnmount() {
        console.log('layout', 'will unmount')
        wfc.eventEmitter.removeListener(EventType.ConnectionStatusChanged, this.onConnectionStatusChange);
        wfc.eventEmitter.removeListener(EventType.ReceiveMessage, this.onReceiveMessage);
        wfc.eventEmitter.removeListener(EventType.RecallMessage, this.updateUnreadStatus);
        wfc.eventEmitter.removeListener(EventType.ConversationInfoUpdate, this.updateUnreadStatus);
        wfc.eventEmitter.removeListener(EventType.SettingUpdate, this.updateUnreadStatus);
    }
    isWin(){
        // var agent = navigator.userAgent.toLowerCase();
        // var isMac = /macintosh|mac os x/i.test(navigator.userAgent);
        // if(isMac){
        //   return true;
        // }
        return   (navigator.platform === "Win32") || (navigator.platform === "Windows");
      }
    render() {
        var { loading, show, close, message, location } = this.props;

        if (this.connectionStatus === ConnectionStatus.ConnectionStatusRejected
            || this.connectionStatus === ConnectionStatus.ConnectionStatusLogout
            || this.connectionStatus === ConnectionStatus.ConnectionStatusSecretKeyMismatch
            || this.connectionStatus === ConnectionStatus.ConnectionStatusTokenIncorrect
            || this.connectionStatus === ConnectionStatus.ConnectionStatusUnconnected
            || wfc.getUserId() === '') {
            return <Login />;
        }

        if (ipcRenderer) {
            ipcRenderer.send('logined');
        }
        loading = !wfc.isLogin() && (this.connectionStatus === 0 || this.connectionStatus === 2/** receving */);

        return (
            <div>
                <Snackbar
                    close={close}
                    show={show}
                    text={message} />

                <Loader show={loading} />
                <div
                    className={clazz(classes.container,{
                        [classes.winContainer]:this.isWin()
                    })}
                    ref="viewport">
                    {this.props.children}
                </div>
                <Footer
                    className={classes.footer}
                    location={location}
                    isWin={this.isWin}
                    ref="footer" />
                <UserInfo />
                <AddFriend />
                <NewChat />
                <Members />
                <OverallUserCard />
                <AddMember />
                <ConfirmImagePaste />
                <Forward />

                {/* <Offline show={this.state.offline} />; */}

                <div
                    className={classes.dragDropHolder}
                    ref="holder">
                    <div className={classes.inner}>
                        <div>
                            <img src="assets/images/filetypes/image.png" />
                            <img src="assets/images/filetypes/word.png" />
                            <img src="assets/images/filetypes/pdf.png" />
                            <img src="assets/images/filetypes/archive.png" />
                            <img src="assets/images/filetypes/video.png" />
                            <img src="assets/images/filetypes/audio.png" />
                        </div>

                        <i className="icon-ion-ios-cloud-upload-outline" />

                        <h2>Drop your file here</h2>
                    </div>
                </div>
            </div>
        );
    }
}
