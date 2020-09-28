// (C) 2020 GoodData Corporation
import blessed, { Widgets } from "blessed";
import { getTerminalSize } from "./utils";
import { ColorCodes } from "./colors";
import IKeyEventArg = Widgets.Events.IKeyEventArg;

export type AppMenuItem = {
    keyName: string;
    name: string;
    registerKeys: string[];
    registerCb: (ch: any, key: IKeyEventArg) => void;
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
            this.screen.key(item.registerKeys, item.registerCb);
        });
    }

    private createMenuContent(items: AppMenuItem[]): string {
        return items
            .map((i) => {
                const padding = new Array(MenuItemLength - i.name.length).fill(" ").join("");

                return `{${ColorCodes.brightwhite}-fg}{${ColorCodes.black}-bg}${i.keyName}{/}{black-fg}{cyan-bg}${i.name}${padding}{/}`;
            })
            .join("");
    }
}
