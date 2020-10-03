// (C) 2020 GoodData Corporation
import blessed from "blessed";
import { AppPanel, AppPanelOptions } from "./appPanel";
import {
    BuildFinished,
    BuildRequested,
    BuildScheduled,
    BuildStarted,
    DcEvent,
    GlobalEventBus,
    IEventListener,
    PackagesChanged,
    SourceInitialized,
    TargetSelected,
} from "../events";
import { DependencyGraph, SourceDescriptor } from "../../base/types";
import max from "lodash/max";
import {
    determinePackageBuildOrder,
    findDependingPackages,
    naiveFilterDependencyGraph,
} from "../../base/dependencyGraph";
import flatten from "lodash/flatten";
import { intersection } from "lodash";
import { appLogInfo } from "./utils";
import { ColorCodes } from "./colors";
import { TargetDescriptor } from "../../base/types";

type PackageListItem = {
    selected: boolean;
    highlightLevel: number;
    packageName: string;
    padding: number;
    buildStateIndicator: string;
    publishStateIndicator: string;
};

const IndicatorSuccess = "{green-bg} {/}";
const IndicatorError = "{red-bg} {/}";
const IndicatorChange = `{${ColorCodes.brightyellow}-bg}{black-fg} {/}`;
const IndicatorDependencyChange = "{yellow-bg}{black-fg} {/}";
const IndicatorInit = "{blue-bg} {/}";

const CursorHighlight = "{cyan-bg}";
const DependentHightlight = [
    `{${ColorCodes.lightcyan}-fg}{bold}`,
    `{${ColorCodes.lightcyan}-fg}`,
    `{${ColorCodes.cyan}-fg}`,
];

const ClearTags = "{/}";

export class PackageList extends AppPanel implements IEventListener {
    private readonly list: blessed.Widgets.ListElement;

    private sourceDescriptor: SourceDescriptor | undefined;
    private targetDescriptor: TargetDescriptor | undefined;

    private dependencyGraph: DependencyGraph | undefined;
    private buildOrder: string[][] | undefined;

    private listItems: PackageListItem[] = [];
    private itemIndex: Record<string, number> = {};
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    private selectedItemIdx: number | undefined;

    constructor(options: AppPanelOptions) {
        super(options);

        this.list = blessed.list({
            top: 0,
            left: 0,
            keys: true,
            width: options.width - 2,
            tags: true,
            interactive: true,
        });

        this.list.focus();
        this.box.append(this.list);

        this.list.on("select item", (_element, index) => {
            this.selectItem(index);
        });

        this.list.on("action", (_element, index) => {
            appLogInfo("enter on " + index);
        });

        GlobalEventBus.register(this);
    }

    public onEvent = (event: DcEvent): void => {
        switch (event.type) {
            case "sourceInitialized": {
                this.onSourceInitialized(event);
                break;
            }
            case "targetSelected": {
                this.onTargetSelected(event);
                break;
            }
            case "packagesChanged": {
                this.onPackageChanged(event);
                break;
            }
            case "buildScheduled": {
                this.onBuildScheduled(event);
                break;
            }
            case "buildRequested": {
                this.onBuildRequested(event);
                break;
            }
            case "buildStarted": {
                this.onBuildStarted(event);
                break;
            }
            case "buildFinished": {
                this.onBuildFinished(event);
            }
        }
    };

    public focus = (): void => {
        this.list.focus();
    };

    //
    // Event handlers
    //

    private onSourceInitialized = (event: SourceInitialized): void => {
        this.sourceDescriptor = event.body.sourceDescriptor;
        this.dependencyGraph = this.sourceDescriptor.dependencyGraph;
    };

    private onTargetSelected = (event: TargetSelected): void => {
        this.targetDescriptor = event.body.targetDescriptor;

        const packageScope = this.targetDescriptor.dependencies.map((pkg) => pkg.pkg.packageName);
        this.dependencyGraph = naiveFilterDependencyGraph(this.dependencyGraph!, packageScope);
        this.buildOrder = determinePackageBuildOrder(this.dependencyGraph, ["prod"]);

        this.initializePackageLIst(packageScope);
    };

    /*
     * Update all package items with 'change' build indicator.
     */
    private onPackageChanged = (event: PackagesChanged): void => {
        for (const change of event.body.changes) {
            const result = this.updateItem(change.packageName, (item) => {
                item.buildStateIndicator = IndicatorChange;
            });

            if (result) {
                this.refreshItem(...result);
            }
        }
    };

    /*
     * Update all depending package items with 'dependency change' build indicator.
     */
    private onBuildScheduled = (event: BuildScheduled): void => {
        const dependingPackages = flatten(event.body.depending);

        for (const packageName of dependingPackages) {
            const result = this.updateItem(packageName, (item) => {
                if (item.buildStateIndicator !== IndicatorChange) {
                    item.buildStateIndicator = IndicatorDependencyChange;
                }
            });

            if (result) {
                this.refreshItem(...result);
            }
        }
    };

    private onBuildRequested = (event: BuildRequested): void => {
        const { packageName } = event.body;

        const result = this.updateItem(packageName, (item) => {
            item.buildStateIndicator = item.buildStateIndicator.replace(" ", "Q");
        });

        if (result) {
            this.refreshItem(...result);
        }
    };

    private onBuildStarted = (event: BuildStarted): void => {
        const { packageName } = event.body;

        const result = this.updateItem(packageName, (item) => {
            item.buildStateIndicator = item.buildStateIndicator.replace("Q", "*");
        });

        if (result) {
            this.refreshItem(...result);
        }
    };

    private onBuildFinished = (event: BuildFinished): void => {
        const { packageName, exitCode } = event.body;

        const result = this.updateItem(packageName, (item) => {
            if (exitCode) {
                item.buildStateIndicator = IndicatorError;
            } else {
                item.buildStateIndicator = IndicatorSuccess;
                item.publishStateIndicator = IndicatorChange;
            }
        });

        if (result) {
            this.refreshItem(...result);
        }
    };

    //
    //
    //

    private initializePackageLIst = (packageScope: string[]): void => {
        this.itemIndex = {};
        this.listItems = createPackageItems(packageScope);
        this.listItems.forEach((item, idx) => (this.itemIndex[item.packageName] = idx));

        this.list.setItems(this.listItems.map(createPackageItem) as any);
        this.screen.render();
    };

    private selectItem = (selectedIdx: number): void => {
        const selectedItem = this.listItems[selectedIdx];

        if (!selectedItem) {
            return;
        }

        this.selectedItemIdx = selectedIdx;

        const dependents = flatten(
            findDependingPackages(
                this.sourceDescriptor!.dependencyGraph,
                [selectedItem.packageName],
                ["prod"],
            ),
        );
        const filteredBuildOrder =
            this.buildOrder?.filter((g) => intersection(g, dependents).length > 0) ?? [];
        const selectedItemPosition =
            filteredBuildOrder.findIndex((pkgs) => pkgs.includes(selectedItem.packageName)) ?? -1;

        this.listItems.forEach((item, idx) => {
            item.selected = false;
            item.highlightLevel = -1;

            if (selectedIdx === idx) {
                item.selected = true;
            } else if (dependents.includes(item.packageName)) {
                const itemDistance =
                    filteredBuildOrder.findIndex((pkgs) => pkgs.includes(item.packageName)) ?? -1;

                item.highlightLevel = itemDistance - selectedItemPosition - 1;
            }

            this.list.setItem(this.list.getItem(idx), createPackageItem(item));
        });

        this.list.render();
    };

    private updateItem = (
        idxOrName: string | number | undefined,
        updateFn: (item: PackageListItem) => void,
    ): [number, PackageListItem] | undefined => {
        const idx = typeof idxOrName === "string" ? this.itemIndex[idxOrName] : idxOrName;

        if (idx === undefined) {
            return;
        }

        const item = this.listItems[idx];

        if (item === undefined) {
            return;
        }

        updateFn(item);

        return [idx, item];
    };

    private refreshItem = (idx: number, item: PackageListItem) => {
        this.list.setItem(this.list.getItem(idx), createPackageItem(item));
        this.list.render();
    };
}

function createPackageItems(packages: string[]): PackageListItem[] {
    if (packages.length === 0) {
        return [];
    }

    packages.sort();
    const maxLen = max(packages.map((p) => p.length))!;

    return packages.map((p) => ({
        selected: false,
        highlightLevel: -1,
        packageName: p,
        padding: maxLen - p.length,
        buildStateIndicator: IndicatorInit,
        publishStateIndicator: IndicatorInit,
    }));
}

function getPackageItemTags(item: PackageListItem): [string, string] {
    if (item.selected) {
        return [CursorHighlight, ClearTags];
    } else if (item.highlightLevel > -1) {
        const highlightColorId = Math.min(item.highlightLevel, DependentHightlight.length - 1);

        return [DependentHightlight[highlightColorId], ClearTags];
    }

    return ["", ""];
}

function createPackageItem(item: PackageListItem): string {
    const [selectedBeginTag, selectedEndTag] = getPackageItemTags(item);
    const padding = item.padding > 0 ? new Array(item.padding).fill(".").join("") : "";

    return `${selectedBeginTag}${item.packageName}${padding}${selectedEndTag} ${item.buildStateIndicator}${item.publishStateIndicator}`;
}
