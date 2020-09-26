// (C) 2020 GoodData Corporation
import blessed from "blessed";
import { AppPanel, AppPanelOptions } from "./appPanel";
import { DcEvent, GlobalEventBus, IEventListener } from "../events";

export class AppLog extends AppPanel implements IEventListener {
    private readonly log: blessed.Widgets.Log;

    constructor(options: AppPanelOptions) {
        super(options);

        this.log = blessed.log({
            top: 0,
            left: 0,
            width: options.width - 2,
            height: options.height - 2,
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
}
