// (C) 2020 GoodData Corporation
import blessed from "blessed";
import { AppLog } from "./appLog";
import { PackageList } from "./packageList";
import { getTerminalSize } from "./utils";
import { AppMenu, AppMenuItem } from "./appMenu";
import { DcEvent, EventBus, GlobalEventBus, IEventListener, PackageChange, packagesChanged } from "../events";
import { BuildOutput } from "./buildOutput";

export class TerminalUi implements IEventListener {
    private readonly screen: blessed.Widgets.Screen;
    private readonly packageList: PackageList;
    private readonly log: AppLog;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    private readonly buildOutput: BuildOutput;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    private readonly menu: AppMenu;

    private selectedPackages: string[] = [];

    private constructor(private readonly eventBus: EventBus) {
        this.eventBus.register(this);
        this.screen = this.createScreen();
        this.packageList = this.createPackageList();
        this.buildOutput = this.createBuildOutput();
        this.log = this.createApplicationLog();
        this.menu = this.createApplicationMenu();

        this.screen.render();
    }

    public static init(eventBus: EventBus = GlobalEventBus): TerminalUi {
        return new TerminalUi(eventBus);
    }

    public onEvent = (event: DcEvent): void => {
        switch (event.type) {
            case "packagesSelected": {
                this.selectedPackages = event.body.packages;

                break;
            }
        }
    };

    private createScreen(): blessed.Widgets.Screen {
        const screen = blessed.screen({
            smartCSR: true,
            title: "GD.UI Applink DevConsole",
        });

        return screen;
    }

    private createPackageList(): PackageList {
        const [rows] = getTerminalSize(this.screen);

        return new PackageList({
            title: "Packages",
            top: 0,
            left: 0,
            height: rows - 6,
            width: 40,
            screen: this.screen,
        });
    }

    private createApplicationLog(): AppLog {
        const [rows, cols] = getTerminalSize(this.screen);

        return new AppLog({
            title: "Log",
            top: rows - 6,
            left: 0,
            width: cols,
            height: 5,
            screen: this.screen,
        });
    }

    private createBuildOutput(): BuildOutput {
        const [rows, cols] = getTerminalSize(this.screen);

        return new BuildOutput({
            title: "Build Output (hit enter on package to show)",
            top: 0,
            left: 41,
            width: cols - 41,
            height: rows - 6,
            screen: this.screen,
        });
    }

    private createApplicationMenu(): AppMenu {
        const items: AppMenuItem[] = [
            {
                name: "Log Toggle",
                keyName: "F2",
                registerKeys: ["f2"],
                registerCb: () => {
                    this.log.toggleExpand();

                    if (this.log.expanded) {
                        this.log.focus();
                    } else {
                        this.packageList.focus();
                    }
                },
            },
            {
                name: "BuildOne",
                keyName: "F7",
                registerKeys: ["f7"],
                registerCb: () => {
                    if (!this.selectedPackages.length) {
                        return;
                    }

                    const changes: PackageChange[] = this.selectedPackages.map((sel) => ({
                        packageName: sel,
                        files: [],
                        independent: true,
                    }));
                    this.eventBus.post(packagesChanged(changes));
                },
            },
            {
                name: "BuildDeps",
                keyName: "F8",
                registerKeys: ["f8"],
                registerCb: () => {
                    if (!this.selectedPackages.length) {
                        return;
                    }

                    const changes: PackageChange[] = this.selectedPackages.map((sel) => ({
                        packageName: sel,
                        files: [],
                    }));
                    this.eventBus.post(packagesChanged(changes));
                },
            },
            {
                name: "Quit",
                keyName: "F10",
                registerKeys: ["f10"],
                registerCb: () => {
                    process.exit(0);
                },
            },
        ];

        return new AppMenu(this.screen, items);
    }
}
