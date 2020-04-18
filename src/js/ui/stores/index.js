
import sessions from './sessions';
import chat from './chat';
import addfriend from './addfriend';
import addmember from './addmember';
import members from './members';
import newchat from './newchat';
import forward from './forward';
import userinfo from './userinfo';
import contactInfo from './contactInfo'
import contacts from './contacts';
import settings from './settings';
import snackbar from './snackbar';
import wfc from '../../wfc/client/wfc'
import batchsend from './batchsend'
import confirmImagePaste from './confirmImagePaste';

const stores = {
    sessions,
    chat,
    addfriend,
    addmember,
    newchat,
    userinfo,
    contactInfo,
    contacts,
    settings,
    members,
    forward,
    snackbar,
    confirmImagePaste,
    wfc,
    batchsend,
};

export default stores;
