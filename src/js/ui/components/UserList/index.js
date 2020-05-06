
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import clazz from 'classname';

import classes from './style.css';
import UserInfo from '../../../wfc/model/userInfo';
import wfc from '../../../wfc/client/wfc'

export default class UserList extends Component {
    static propTypes = {
        max: PropTypes.number.isRequired,
        searching: PropTypes.string.isRequired,
        search: PropTypes.func.isRequired,
        getList: PropTypes.func.isRequired,
        onChange: PropTypes.func.isRequired,
    };

    static defaultProps = {
        max: 20,
    };

    state = {
        selected: [],
        active: '',
    };

    highlight(offset) {
        var scroller = this.refs.list;
        var users = Array.from(scroller.querySelectorAll('li[data-userid]'));
        var index = users.findIndex(e => e.classList.contains(classes.active));

        if (index > -1) {
            users[index].classList.remove(classes.active);
        }

        index += offset;

        if (index < 0) {
            // Fallback to the last element
            index = users.length - 1;
        } else if (index > users.length - 1) {
            // Fallback to the 1th element
            index = 0;
        }

        var active = users[index];

        if (active) {
            // Keep active item always in the viewport
            active.classList.add(classes.active);
            scroller.scrollTop = active.offsetTop + active.offsetHeight - scroller.offsetHeight;
        }
    }

    navigation(e) {
        var keyCode = e.keyCode;
        var offset = {
            // Up
            '38': -1,
            '40': 1,
        }[keyCode];

        if (offset) {
            this.highlight(offset);
        }

        if (keyCode !== 13) {
            return;
        }

        var active = this.refs.list.querySelector(`.${classes.active}`);

        if (active) {
            let userid = active.dataset.userid;

            if (!this.state.selected.includes(userid)) {
                // Add
                this.addSelected(userid, userid);
            } else {
                // Remove
                this.removeSelected(userid, userid);
            }
            setTimeout(() => this.props.onChange(this.state.selected));
        }
    }

    timer;

    search(text) {
        clearTimeout(this.timer);

        this.timer = setTimeout(() => {
            this.props.search(text);
        }, 300);
    }

    addSelected(userid, active = this.state.active) {
        var selected = [
            userid,
            ...this.state.selected,
        ];
        var max = this.props.max;

        if (max > 0) {
            selected = selected.slice(0, this.props.max);
        }

        this.setState({
            active,
            selected,
        });
        setTimeout(() => this.props.onChange(this.state.selected));
    }

    removeSelected(userid, active = this.state.active) {
        var selected = this.state.selected;
        var index = selected.indexOf(userid);

        this.setState({
            active,
            selected: [
                ...selected.slice(0, index),
                ...selected.slice(index + 1, selected.length)
            ]
        });
        setTimeout(() => this.props.onChange(this.state.selected));
    }

    toggleSelected(userid) {
        if (!this.state.selected.includes(userid)) {
            // Add
            this.addSelected(userid);
        } else {
            // Remove
            this.removeSelected(userid);
        }

        setTimeout(() => this.refs.input.focus());
    }

    renderList() {
        var { searching, getList } = this.props;
        var list = getList();

        if (searching && list.length === 0) {
            return (
                <li className={classes.notfound}>
                    <img src="assets/images/crash.png" />
                    <h4>Can't find any people matching '{searching}'</h4>
                </li>
            );
        }
        list = list.filter(e => e instanceof UserInfo);

        return list.map((e, index) => {
            return (
                <li
                    className={clazz({
                        [classes.selected]: this.state.selected.includes(e.UserName),
                        [classes.active]: this.state.active === e.UserName,
                        [classes.active]:this.state.selected.includes(e.uid)
                    })}
                    data-userid={e.uid}
                    key={index}
                    onClick={ev => this.toggleSelected(e.uid)}>
                    <img
                        className={classes.avatar}
                        src={e.portrait} />
                    <span
                        className={classes.username}
                        dangerouslySetInnerHTML={{ __html: wfc.getUserDisplayName(e.uid) }} />
                    <i>
                        {
                            !this.state.selected.includes(e.uid) ?(<svg t="1583151808548"   viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2291" width="18" height="18"><path d="M510.959 70.334c-243.334 0-440.596 197.245-440.596 440.597 0 243.319 197.264 440.596 440.596 440.596 243.317 0 440.597-197.275 440.597-440.596-0.001-243.353-197.28-440.597-440.597-440.597v0zM510.959 883.829c-205.936 0-372.902-166.943-372.902-372.897 0-205.961 166.965-372.902 372.902-372.902 205.959 0 372.901 166.943 372.901 372.902 0 205.953-166.943 372.897-372.901 372.897v0zM510.959 883.829z" p-id="2292" fill="#e4e4e4"></path></svg>):
                            (<svg t="1583151898167"   viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3140" width="18" height="18"><path d="M0 512C0 229.234759 229.234759 0 512 0s512 229.234759 512 512-229.234759 512-512 512S0 794.765241 0 512z m419.310345 194.630621a35.310345 35.310345 0 0 0 49.399172 1.271172l335.518897-311.931586a35.310345 35.310345 0 0 0-48.075035-51.729655l-309.124413 289.544827-145.125518-149.645241a35.310345 35.310345 0 1 0-50.688 49.169655l168.112552 173.320828z" p-id="3141" fill="#1aad19"></path></svg>)
                        }
                    </i>
                </li>
            );
        });
    }

    render() {
        return (
            <div className={classes.container}>
                <div className={classes.searchBarbg}>
                    <i className="icon-ion-ios-search-strong seach-test" />
                    <input
                        autoFocus={true}
                        onKeyUp={e => this.navigation(e)}
                        onInput={e => this.search(e.target.value)}
                        placeholder="搜索"
                        ref="input"
                        type="text" />
                </div>



                <ul
                    className={classes.list}
                    ref="list">
                    {this.renderList()}
                </ul>
            </div>
        );
    }
}
