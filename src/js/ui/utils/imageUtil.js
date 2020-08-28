import resizeImage from "resize-image";
import wfc from '../../wfc/client/wfc';
import GroupInfo from "../../wfc/model/groupInfo";
import GroupMember from "../../wfc/model/groupMember";
import {lt} from "../../wfc/util/longUtil";
import ConversationType from "../../wfc/model/conversationType";

function mergeImages(sources = [], options = {}) {
    // Defaults
    let defaultOptions = {
        format: 'image/png',
        quality: 0.92,
        width: undefined,
        height: undefined,
        Canvas: undefined
    };
    return new Promise(resolve => {
        options = Object.assign({}, defaultOptions, options);

        sources = sources.filter(source => source !== null && source !== undefined);

        // Setup browser/Node.js specific variables
        const canvas = options.Canvas ? new options.Canvas() : window.document.createElement('canvas');
        const Image = options.Canvas ? options.Canvas.Image : window.Image;
        if (options.Canvas) {
            options.quality *= 100;
        }

        let targetSize = 64;
        let divider = 1;
        var size = 0;

        switch (sources.length) {
            case 2:
                size = (targetSize - 3 * divider) / 2;
                break;
            case 3:
                size = (targetSize - 3 * divider) / 2;
                break;
            case 4:
                size = (targetSize - 3 * divider) / 2;
                break;
            case 5:
                size = (targetSize - 4 * divider) / 3;
                break;
            case 6:
                size = (targetSize - 4 * divider) / 3;
                break;
            case 7:
                size = (targetSize - 4 * divider) / 3;
                break;
            case 8:
                size = (targetSize - 4 * divider) / 3;
                break;
            case 9:
                size = (targetSize - 4 * divider) / 3;
                break;
        }

        sources = sources.slice(0, sources.length >= 9 ? 9 : sources.length);

        // Load sources
        const images = sources.map(source => new Promise((resolve, reject) => {
            // Convert sources to objects
            if (source.constructor.name !== 'Object') {
                source = {src: source};
            }

            // Resolve source and img when loaded
            const img = new Image();
            img.setAttribute('crossOrigin', 'anonymous');
            //img.onerror = () => reject(new Error('Couldn\'t load image'));
            img.onerror = () => resolve(null);
            img.onload = () => resolve(Object.assign({}, source, {data: resizeImage.resize(img, size, size, resizeImage.PNG)}));
            img.src = source.src;
        }));

        const loadResizedImages = (resizedImagesBase64) => resizedImagesBase64.map(image => new Promise((resolve, reject) => {
            // Resolve source and img when loaded
            const img = new Image();
            img.setAttribute('crossOrigin', 'anonymous');
            //img.onerror = () => reject(new Error('Couldn\'t load image2'));
            img.onerror = () => resolve(null);
            img.onload = () => resolve(Object.assign({}, {img}));
            img.src = image.data;
        }));

        // Get canvas context
        const ctx = canvas.getContext('2d');

        // When sources have loaded
        resolve(Promise.all(images)
            .then((images) => {
                images = images.filter(i => i !== null);
                return Promise.all(loadResizedImages(images));
            })
            .then(images => {

                images = images.filter(i => i !== null);

                // Set canvas dimensions
                // const getSize = dim => options[dim] || Math.max(...images.map(image => image.img[dim]));
                // canvas.width = getSize('width');
                // canvas.height = getSize('height');
                canvas.width = targetSize;
                canvas.height = targetSize;
                switch (images.length) {
                    case 2:
                        images[0].x = divider;
                        images[0].y = targetSize / 4;
                        images[1].x = images[0].x + size + divider;
                        images[1].y = images[0].y;
                        break;
                    case 3:
                        images[0].x = targetSize / 4;
                        images[0].y = divider;

                        images[1].x = divider;
                        images[1].y = images[0].y + size + divider;
                        images[2].x = images[1].x + size + divider;
                        images[2].y = images[1].y;
                        break;
                    case 4:
                        images[0].x = divider;
                        images[0].y = divider;
                        images[1].x = images[0].x + size + divider;
                        images[1].y = divider;

                        images[2].x = divider;
                        images[2].y = images[0].y + size + divider;
                        images[3].x = images[2].x + size + divider;
                        images[3].y = images[2].y;
                        break;
                    case 5:
                        images[0].x = (targetSize - 2 * size - divider) / 2;
                        images[0].y = (targetSize - 2 * size - divider) / 2;
                        images[1].x = images[0].x + size + divider;
                        images[1].y = images[0].y;

                        images[2].x = divider;
                        images[2].y = images[1].y + size + divider;
                        images[3].x = images[2].x + size + divider;
                        images[3].y = images[2].y;
                        images[4].x = images[3].x + size + divider;
                        images[4].y = images[2].y;
                        break;
                    case 6:
                        images[0].x = divider;
                        images[0].y = (targetSize - 2 * size - divider) / 2;
                        images[1].x = images[0].x + size + divider;
                        images[1].y = images[0].y;
                        images[2].x = images[1].x + size + divider;
                        images[2].y = images[0].y;

                        images[3].x = divider;
                        images[3].y = images[0].y + size + divider;
                        images[4].x = images[3].x + size + divider;
                        images[4].y = images[3].y;
                        images[5].x = images[4].x + size + divider;
                        images[5].y = images[3].y;
                        break;
                    case 7:
                        images[0].x = divider + size + divider;
                        images[0].y = divider;

                        images[1].x = divider;
                        images[1].y = images[0].y + size + divider;
                        images[2].x = images[1].x + size + divider;
                        images[2].y = images[1].y;
                        images[3].x = images[2].x + size + divider;
                        images[3].y = images[1].y;

                        images[4].x = divider;
                        images[4].y = images[1].y + size + divider;
                        images[5].x = images[4].x + size + divider;
                        images[5].y = images[4].y;
                        images[6].x = images[5].x + size + divider;
                        images[6].y = images[4].y;
                        break;
                    case 8:
                        images[0].x = (targetSize - 2 * size - divider) / 2;
                        images[0].y = divider;
                        images[1].x = images[0].x + size + divider;
                        images[1].y = images[0].y;

                        images[2].x = divider;
                        images[2].y = images[0].y + size + divider;
                        images[3].x = images[2].x + size + divider;
                        images[3].y = images[2].y
                        images[4].x = images[3].x + size + divider;
                        images[4].y = images[2].y;

                        images[5].x = divider;
                        images[5].y = images[2].y + size + divider;
                        images[6].x = images[5].x + size + divider;
                        images[6].y = images[5].y;
                        images[7].x = images[6].x + size + divider;
                        images[7].y = images[5].y;
                        break;
                    case 9:
                        images[0].x = divider;
                        images[0].y = divider;
                        images[1].x = images[0].x + size + divider;
                        images[1].y = images[0].y;
                        images[2].x = images[1].x + size + divider;
                        images[2].y = images[0].y;

                        images[3].x = divider;
                        images[3].y = images[0].y + size + divider;
                        images[4].x = images[3].x + size + divider;
                        images[4].y = images[3].y;
                        images[5].x = images[4].x + size + divider;
                        images[5].y = images[3].y;

                        images[6].x = divider;
                        images[6].y = images[3].y + size + divider;
                        images[7].x = images[6].x + size + divider;
                        images[7].y = images[6].y;
                        images[8].x = images[7].x + size + divider;
                        images[8].y = images[6].y;
                        break;
                }

                ctx.fillStyle = '#CCCCCC';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                // Draw images to canvas
                images.forEach(image => {
                    ctx.globalAlpha = image.opacity ? image.opacity : 1;
                    return ctx.drawImage(image.img, image.x || 0, image.y || 0);
                });

                if (options.Canvas && options.format === 'image/jpeg') {
                    // Resolve data URI for node-canvas jpeg async
                    return new Promise(resolve => {
                        canvas.toDataURL(options.format, {
                            quality: options.quality,
                            progressive: false
                        }, (err, jpeg) => {
                            if (err) {
                                throw err;
                            }
                            resolve(jpeg);
                        });
                    });
                }

                // Resolve all other data URIs sync
                return canvas.toDataURL(options.format, options.quality);
            }));
    })
}


let groupPortraitMap = new Map();

async function getConversationPortrait(conversation) {
    let portrait = '';
    switch (conversation.type) {
        case ConversationType.Single:
            let u = wfc.getUserInfo(conversation.target, false);
            portrait = u.portrait;
            break;
        case ConversationType.Group:
            portrait = await getGroupPortrait(conversation.target);
            break;
        case ConversationType.Channel:
            break;
        case ConversationType.ChatRoom:
            break;
        default:
            break;
    }

    if (!portrait) {
        switch (conversation.type) {
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

    return portrait;
}

async function getGroupPortrait(groupId) {
    let groupInfo = wfc.getGroupInfo(groupId, false);
    if (groupInfo.portrait) {
        return groupInfo.portrait;
    }

    let portrait = groupPortraitMap.get(groupId);
    if (!portrait || lt(portrait.timestamp, groupInfo.updateDt)) {
        let groupMembers = wfc.getGroupMembers(groupId, false);
        let groupMemberPortraits = [];
        for (let i = 0; i < Math.min(9, groupMembers.length); i++) {
            groupMemberPortraits.push(groupMembers[i].getPortrait())
        }
        portrait = await mergeImages(groupMemberPortraits)
        groupPortraitMap.set(groupId, {timestamp: groupInfo.updateDt, uri: portrait})
        return portrait;
    } else {
        return portrait.uri;
    }
}

export {mergeImages, getConversationPortrait};
