// (C) 2020 GoodData Corporation
import blessed from "blessed";
import { AppLog } from "./appLog";
import { PackageList } from "./packageList";
import { appLogMessage, getTerminalSize } from "./utils";
import { AppMenu, AppMenuItem } from "./appMenu";

export class TerminalUi {
    private readonly screen: blessed.Widgets.Screen;
    private readonly packageList: PackageList;
    private readonly log: AppLog;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    private readonly menu: AppMenu;

    constructor() {
        this.screen = this.createScreen();
        this.packageList = this.createPackageList();
        this.log = this.createApplicationLog();
        this.menu = this.createApplicationMenu();

        this.screen.render();
    }

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
                    appLogMessage("build selected package");
                },
            },
            {
                name: "BuildDeps",
                keyName: "F8",
                registerKeys: ["f8"],
                registerCb: () => {
                    appLogMessage("build selected package with dependencies");
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

    public getPackageList = (): PackageList => {
        return this.packageList;
    };

    public addMessage = (message: string): void => {
        this.log.addMessage(message);
    };
}
