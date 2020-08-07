import GroupNotificationContent from './groupNotification'
import MessageContentType from '../messageContentType'
import wfc from '../../client/wfc'

export default class AllowGroupMemberNotification extends GroupNotificationContent {
    groupId
    operator
    // 操作类型，1允许发言，0禁止发言
    type
    memberIds

    constructor (operator, type, memberIds) {
        super(MessageContentType.MuteGroupMember_Notification)
        this.operator = operator
        this.type = type
        this.memberIds = memberIds
    }

    formatNotification (message) {
        let notifyStr = ''
        if (this.fromSelf) {
            notifyStr += '您'
        } else {
            notifyStr += wfc.getGroupMemberDisplayName(this.groupId,
                this.operator)
        }
        notifyStr += '把'
        if (this.memberIds) {
            this.memberIds.forEach((memberId) => {
                notifyStr += ' '
                notifyStr += wfc.getGroupMemberDisplayName(this.groupId,
                    memberId)
            })
        }
        if (this.type === 0) {
            notifyStr += '取消群禁言时发言权限'
        } else {
            notifyStr += '允许群禁言时发言'
        }
        return notifyStr
    }

    encode () {
        let payload = super.encode()
        let obj = {
            g: this.groupId,
            o: this.operator,
            n: this.type + '',
            ms: this.memberIds,
        }
        payload.binaryContent = wfc.utf8_to_b64(JSON.stringify(obj))
        return payload
    }

    decode (payload) {
        super.decode(payload)

        let json = wfc.b64_to_utf8(payload.binaryContent)
        let obj = JSON.parse(json)
        this.groupId = obj.g
        this.operator = obj.o
        this.type = parseInt(obj.n)
        this.memberIds = obj.ms
    }
}
