
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import clazz from 'classname';

import classes from './style.css';
import { Picker } from 'emoji-mart'
import onClickOutside from "react-onclickoutside";

export class Emoji extends Component {
    static propTypes = {
        output: PropTypes.func.isRequired,
        show: PropTypes.bool.isRequired,
        close: PropTypes.func.isRequired,
    };

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    handleClickOutside = evt => {
        // ..handling code goes here...
        this.props.close();
    };

    onEmojiSelect = (emoji) => {
        console.log('onEmojiSelect', emoji.native);
        this.props.output(emoji.native);
        this.props.close();
    }

    render() {
        return this.props.show ? (
            <div
                ref="container"
                tabIndex="-1"
                className={clazz(classes.container, classes.show)}
                onBlur={e => this.props.close()}>

                <Picker set='twitter'
                    ref='emojiPicker'
                    onClick={this.onEmojiSelect}
                    // onSelect={this.onEmojiSelect}
                    title='WFC Emoji'
                    showPreview={false}
                    showSkinTones={false}
                    emojiTooltip={false}
                    backgroundImageFn={(set, sheetSize) => 'assets/twemoji/64.png'}
                />

            </div>
        ) : (null);
    }
}
export default onClickOutside(Emoji);
