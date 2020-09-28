// (C) 2020 GoodData Corporation
import blessed from "blessed";
import { AppPanel, AppPanelOptions } from "./appPanel";
import { DcEvent, GlobalEventBus, IEventListener } from "../events";
import { getTerminalSize } from "./utils";

export class AppLog extends AppPanel implements IEventListener {
    private readonly log: blessed.Widgets.Log;
    public expanded: boolean = false;

    constructor(options: AppPanelOptions) {
        super(options);

        this.log = blessed.log({
            top: 0,
            left: 0,
            width: options.width - 2,
            height: options.height - 2,
            keys: true,
            tags: true,
            scrollbar: {
                ch: "x",
            },
        });

        this.box.append(this.log);
        GlobalEventBus.register(this);
    }

    public onEvent = (event: DcEvent): void => {
        switch (event.type) {
            case "somethingHappened":
                this.addMessage(event.body.message);
        }
    };

    public addMessage = (message: string): void => {
        this.log.add(`${new Date().toISOString()} - ${message}`);

        this.renderPanel();
    };

    public toggleExpand = (): void => {
        if (this.expanded) {
            const [rows] = getTerminalSize(this.screen);

            this.box.top = rows - 6;
            this.box.height = 5;
            this.log.height = 3;
            this.expanded = false;

            const lines = this.log.getLines().length;
            this.log.setScroll(lines);
        } else {
            const [rows] = getTerminalSize(this.screen);

            this.box.top = 1;
            this.box.height = rows - 2;
            this.log.height = rows - 4;
            this.expanded = true;

            const lines = this.log.getLines().length;
            this.log.setScroll(lines);
        }

        this.screen.render();
    };

    public focus = (): void => {
        this.log.focus();
    };
}
