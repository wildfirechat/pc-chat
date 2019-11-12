
import React, { Component } from 'react';
import { remote, ipcRenderer } from '../../../platform';

import classes from './style.css';

export default class Header extends Component {
    getTitle() {
        switch (this.props.location.pathname) {
            case '/contacts':
                return '联系人';

            case '/settings':
                return '设置';

            default:
                return '野火IM';
        }
    }

    // 关闭窗口
    close() {
        ipcRenderer.send('close-window');
    }
    // 最小化窗口
    min() {
        ipcRenderer.send('min-window');
    }
    // 切换窗口状态：如果当前状态是最大化则取消最大化，否则最大化
    toggle() {
        ipcRenderer.send('toggle-max');
    }

    render() {
        var isWin = window.process && window.process.platform === 'win32';
        return (
            <header className={classes.container}>
                <h1>{this.getTitle()}</h1>
                {
                    (isWin) && (
                        <div>

                            <p onClick={e => this.min()}>-</p>

                            <p onClick={e => this.toggle()}>口</p>

                            <p onClick={e => this.close()}>X</p>

                        </div>
                    )
                }
            </header>
        );
    }
}
