// (C) 2020 GoodData Corporation
import blessed from "blessed";
import { ColorCodes } from "./colors.js";

export type AppPanelOptions = {
    title: string;
    top: number;
    left: number;
    width: number;
    height: number;
    screen: blessed.Widgets.Screen;
};

export abstract class AppPanel {
    protected readonly box: blessed.Widgets.BoxElement;
    protected readonly screen: blessed.Widgets.Screen;
    private readonly header: blessed.Widgets.TextElement;

    constructor(private readonly options: AppPanelOptions) {
        this.screen = options.screen;

        this.box = blessed.box({
            top: this.options.top,
            left: this.options.left,
            height: this.options.height,
            width: this.options.width,
            border: {
                type: "line",
                fg: ColorCodes.blue,
            },
        });

        this.header = blessed.text({
            content: ` ${options.title}`,
            top: -1,
            left: 1,
            width: 2 + options.title.length,
            height: 1,
            bold: "true",
        });

        this.box.append(this.header);
        this.options.screen.append(this.box);
    }

    protected changeTitle = (title: string): void => {
        this.header.setContent(" " + title);
        this.header.width = title.length + 2;
        this.renderPanel();
    };

    protected renderPanel = (): void => {
        this.screen.render();
    };
}
