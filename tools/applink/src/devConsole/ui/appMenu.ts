// (C) 2020 GoodData Corporation
import blessed, { Widgets } from "blessed";
import { getTerminalSize } from "./utils.js";
import { ColorCodes } from "./colors.js";
import IKeyEventArg = Widgets.Events.IKeyEventArg;

export type AppMenuItem = {
    /**
     * Key name to show in menubar
     */
    keyName: string;

    /**
     * Action name or a callback to get the action name
     */
    name: string | ((item: AppMenuItem) => string);
    registerKeys: string[];
    registerCb: (item: AppMenuItem, ch: any, key: IKeyEventArg) => void;
    itemState?: any;
};

const MenuItemLength = 10;

export class AppMenu {
    private readonly text: blessed.Widgets.TextElement;

    constructor(private readonly screen: blessed.Widgets.Screen, private readonly items: AppMenuItem[]) {
        const [rows, cols] = getTerminalSize(this.screen);

        this.text = blessed.text({
            top: rows - 1,
            left: 0,
            height: 1,
            width: cols,
            tags: true,
            content: this.createMenuContent(this.items),
            style: {
                fg: ColorCodes.black,
                bg: ColorCodes.cyan,
            },
        });

        this.screen.append(this.text);

        this.items.forEach((item) => {
            this.screen.key(item.registerKeys, (ch: any, key: IKeyEventArg): void => {
                item.registerCb(item, ch, key);
                this.refreshMenu();
            });
        });
    }

    private refreshMenu = () => {
        this.text.setContent(this.createMenuContent(this.items));
        this.screen.render();
    };

    private createMenuContent(items: AppMenuItem[]): string {
        return items
            .map((i) => {
                const name = typeof i.name === "string" ? i.name : i.name(i);
                const padding = new Array(MenuItemLength - name.length).fill(" ").join("");

                return `{${ColorCodes.brightwhite}-fg}{${ColorCodes.black}-bg}${i.keyName}{/}{black-fg}{cyan-bg}${name}${padding}{/}`;
            })
            .join("");
    }
}
