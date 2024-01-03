// (C) 2020 GoodData Corporation
import blessed from "blessed";
import { AppPanel, AppPanelOptions } from "./appPanel.js";
import {
    BuildFinished,
    buildOutputExited,
    BuildOutputRequested,
    DcEvent,
    EventBus,
    GlobalEventBus,
    IEventListener,
} from "../events.js";
import { readFileSync } from "fs";

export class BuildOutput extends AppPanel implements IEventListener {
    private readonly log: blessed.Widgets.Log;
    private showingFor: string | undefined;

    private stdoutsPerPackage: Record<string, string[]> = {};

    constructor(options: AppPanelOptions, private readonly eventBus: EventBus = GlobalEventBus) {
        super(options);

        this.eventBus.register(this);

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

        this.log.key(["enter", "esc"], () => {
            this.screen.render();
            this.eventBus.post(buildOutputExited());
        });
    }

    public onEvent = (event: DcEvent): void => {
        switch (event.type) {
            case "buildOutputRequested": {
                this.onBuildOutputRequested(event);
                break;
            }
            case "buildFinished": {
                this.onBuildFinished(event);
                break;
            }
        }
    };

    public focus = (): void => {
        this.log.focus();
    };

    private onBuildOutputRequested = (event: BuildOutputRequested): void => {
        const { packageName } = event.body;

        this.changeTitle(`Build Output: ${packageName}`);
        this.showingFor = packageName;

        const lines = this.stdoutsPerPackage[packageName];

        if (lines) {
            this.showLog(lines);
        } else {
            this.showLog(["Nothing to see here yet. No package build run by the devConsole."]);
        }

        this.screen.render();
        this.focus();
    };

    private onBuildFinished = (event: BuildFinished): void => {
        const { packageName, stdoutPath } = event.body;
        const content = readFileSync(stdoutPath, { encoding: "utf-8" });
        const lines = content.split("\n");

        this.stdoutsPerPackage[packageName] = lines;

        if (packageName === this.showingFor) {
            this.showLog(lines);
        }
    };

    private showLog = (lines: string[]): void => {
        // clear whatever is in the log so far (could not find native function)
        this.log.setContent("");
        lines.forEach((line) => this.log.add(line));
    };
}
