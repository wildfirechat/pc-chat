// ui 框架相关的代码，目前主要用来处理菜单

// import { ContextMenu, MenuItem } from "react-contextmenu";
import {isElectron, remote} from "./platform";

// 后两个参数是针对web的
export function popMenu(templates, data, menuId) {
    if (isElectron()) {
        let menu;
        menu = new remote.Menu.buildFromTemplate(templates);
        menu.popup(remote.getCurrentWindow());
    } else {
        return showBrowserMenu(templates, data, menuId);
    }
}

export function showBrowserMenu(menuTemplates = [], data, menuId) {
    let items = menuTemplates.map((template) => {
        return (
            <MenuItem key={template.label} data={{ data: data }} onClick={template.click}>
                {template.label}
            </MenuItem>
        );
    });
    return (
        <ContextMenu id={menuId} >
            {
                items
            }
        </ContextMenu>
    );
}

// for web
export const ContextMenuTrigger = null
export const hideMenu = null
