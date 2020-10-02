// (C) 2020 GoodData Corporation
import blessed from "blessed";
import { AppPanel, AppPanelOptions } from "./appPanel";
import {
    DcEvent,
    GlobalEventBus,
    IEventListener,
    PackagesChanged,
    SourceInitialized,
    TargetSelected,
} from "../events";
import { DependencyGraph, SourceDescriptor } from "../../base/types";
import max from "lodash/max";
import { determinePackageBuildOrder, findDependingPackages } from "../../base/dependencyGraph";
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
    buildIndicator: string;
    publishIndicator: string;
};

const IndicatorSuccess = "{green-bg} {/}";
const IndicatorError = "{red-bg} {/}";
const IndicatorWarn = "{yellow-bg} {/}";
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
        }
    };

    public focus = (): void => {
        this.list.focus();
    };

    private initializePackageLIst = (): void => {
        const graph = this.sourceDescriptor!.dependencyGraph;
        const packageScope = this.targetDescriptor!.dependencies.map((pkg) => pkg.pkg.packageName);

        this.buildOrder = getBuildOrder(graph, packageScope);
        this.itemIndex = {};
        this.listItems = createPackageItems(packageScope);
        this.listItems.forEach((item, idx) => (this.itemIndex[item.packageName] = idx));

        this.list.setItems(this.listItems.map(createPackageItem) as any);
        this.screen.render();
    };

    private onSourceInitialized = (event: SourceInitialized): void => {
        this.sourceDescriptor = event.body.sourceDescriptor;
    };

    private onTargetSelected = (event: TargetSelected): void => {
        this.targetDescriptor = event.body.targetDescriptor;

        this.initializePackageLIst();
    };

    private onPackageChanged = (event: PackagesChanged): void => {
        for (const change of event.body.changes) {
            const result = this.updateItem(change.packageName, (item) => {
                item.buildIndicator = IndicatorWarn;
            });

            if (result) {
                this.refreshItem(...result);
            }
        }
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
        buildIndicator: IndicatorInit,
        publishIndicator: IndicatorInit,
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

    return `${selectedBeginTag}${item.packageName}${padding}${selectedEndTag} ${item.buildIndicator}${item.publishIndicator}`;
}

function getBuildOrder(graph: DependencyGraph, packages: string[]) {
    return determinePackageBuildOrder(graph, ["prod"]).filter((g) => intersection(g, packages).length > 0);
}
