// (C) 2020 GoodData Corporation
import blessed from "blessed";
import { AppPanel, AppPanelOptions } from "./appPanel.js";
import {
    BuildFinished,
    buildOutputRequested,
    BuildRequested,
    BuildScheduled,
    BuildStarted,
    DcEvent,
    EventBus,
    GlobalEventBus,
    IEventListener,
    PackagesChanged,
    packagesSelected,
    PublishFinished,
    SourceInitialized,
    TargetSelected,
} from "../events.js";
import { DependencyGraph, SourceDescriptor, TargetDescriptor } from "../../base/types.js";
import max from "lodash/max.js";
import {
    determinePackageBuildOrder,
    findDependingPackages,
    naiveFilterDependencyGraph,
} from "../../base/dependencyGraph.js";
import findIndex from "lodash/findIndex.js";
import flatten from "lodash/flatten.js";
import intersection from "lodash/intersection.js";
import { ColorCodes } from "./colors.js";

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
    private selectedItemIdx: number | undefined;

    private browsingBuildOutput: boolean = false;

    constructor(options: AppPanelOptions, private readonly eventBus: EventBus = GlobalEventBus) {
        super(options);

        this.eventBus.register(this);
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

            if (this.selectedItemIdx !== undefined) {
                this.eventBus.post(packagesSelected(this.listItems[this.selectedItemIdx].packageName));
            }
        });

        this.list.key(["home"], () => {
            this.list.select(0);
        });

        this.list.key(["end"], () => {
            this.list.select(this.listItems.length - 1);
        });

        this.list.on("action", (_element, index) => {
            const packageItem = this.listItems[index];

            if (packageItem !== undefined) {
                this.browsingBuildOutput = true;
                this.list.setItems(
                    this.listItems.map((item) => createPackageItem(item, this.browsingBuildOutput)) as any,
                );
                this.screen.render();
                this.eventBus.post(buildOutputRequested(packageItem.packageName));
            }
        });
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
                break;
            }
            case "publishFinished": {
                this.onPublishFinished(event);
                break;
            }
            case "buildOutputExited": {
                this.focus();
                break;
            }
        }
    };

    public focus = (): void => {
        this.list.focus();
        this.browsingBuildOutput = false;
        this.list.setItems(
            this.listItems.map((item) => createPackageItem(item, this.browsingBuildOutput)) as any,
        );

        this.screen.render();
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

    private onPublishFinished = (event: PublishFinished): void => {
        const { packageName, exitCode } = event.body;

        const result = this.updateItem(packageName, (item) => {
            if (exitCode) {
                item.publishStateIndicator = IndicatorError;
            } else {
                item.publishStateIndicator = IndicatorSuccess;
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

        this.list.setItems(
            this.listItems.map((item) => createPackageItem(item, this.browsingBuildOutput)) as any,
        );
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
            findIndex(filteredBuildOrder, (pkgs) => pkgs.includes(selectedItem.packageName)) ?? -1;

        this.listItems.forEach((item, idx) => {
            item.selected = false;
            item.highlightLevel = -1;

            if (selectedIdx === idx) {
                item.selected = true;
            } else if (dependents.includes(item.packageName)) {
                const itemDistance =
                    findIndex(filteredBuildOrder, (pkgs) => pkgs.includes(item.packageName)) ?? -1;

                item.highlightLevel = itemDistance - selectedItemPosition - 1;
            }

            this.list.setItem(this.list.getItem(idx), createPackageItem(item, this.browsingBuildOutput));
        });

        /*
         * Same as refreshItem.. render entire screen otherwise stuff like 'home' and 'end' keys won't work
         */
        this.screen.render();
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
        this.list.setItem(this.list.getItem(idx), createPackageItem(item, this.browsingBuildOutput));

        /*
         * One would think that just list should be rendered on change when its item changes - but it does not seem
         * work reliably. Sometimes on a valid change, nothing changes on the screen. Could be timing related or
         * perhaps bad/misunderstood use of blessed?
         */
        this.screen.render();
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

function getPackageItemTags(item: PackageListItem, browsingBuildOutput: boolean): [string, string] {
    if (browsingBuildOutput) {
        return ["", ""];
    }

    if (item.selected) {
        return [CursorHighlight, ClearTags];
    } else if (item.highlightLevel > -1) {
        const highlightColorId = Math.min(item.highlightLevel, DependentHightlight.length - 1);

        return [DependentHightlight[highlightColorId], ClearTags];
    }

    return ["", ""];
}

function createPackageItem(item: PackageListItem, browsingBuildOutput: boolean): string {
    const [selectedBeginTag, selectedEndTag] = getPackageItemTags(item, browsingBuildOutput);
    const padding = item.padding > 0 ? new Array(item.padding).fill(".").join("") : "";

    return `${selectedBeginTag}${item.packageName}${padding}${selectedEndTag} ${item.buildStateIndicator}${item.publishStateIndicator}`;
}
