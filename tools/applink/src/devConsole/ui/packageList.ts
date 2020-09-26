// (C) 2020 GoodData Corporation
import blessed from "blessed";
import { AppPanel, AppPanelOptions } from "./appPanel";
import { DcEvent, GlobalEventBus, IEventListener, PackageBuilt, PackagesInitialized } from "../events";
import { DependencyGraph, SdkPackageDescriptor } from "../../base/types";
import max from "lodash/max";
import { determinePackageBuildOrder, findDependingPackages } from "../../base/sdkDependencyGraph";
import flatten from "lodash/flatten";

type PackageListItem = {
    selected: boolean;
    highlightLevel: number;
    packageName: string;
    sdkPackage: SdkPackageDescriptor;
    padding: number;
    buildIndicator: string;
    publishIndicator: string;
};

const IndicatorSuccess = "{green-bg} {/}";
const IndicatorError = "{red-bg} {/}";
const IndicatorWarn = "{yellow-bg} {/}";
const IndicatorInit = "{blue-bg} {/}";

const CursorHighlight = "{cyan-bg}";
const DependentHightlight = ["{cyan-fg}{bold}", "{cyan-fg}"];

const ClearTags = "{/}";

export class PackageList extends AppPanel implements IEventListener {
    private readonly list: blessed.Widgets.ListElement;

    private dependencyGraph: DependencyGraph | undefined;
    private buildOrder: string[][] | undefined;

    private listItems: PackageListItem[] = [];
    private itemIndex: Record<string, number> = {};
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

        this.list.on("select item", (_element, index) => {
            this.selectItem(index);
        });

        this.list.focus();
        this.box.append(this.list);

        GlobalEventBus.register(this);
    }

    public onEvent = (event: DcEvent): void => {
        switch (event.type) {
            case "packagesInitialized": {
                this.onPackagesInitialized(event);
                break;
            }
            case "packageBuilt": {
                this.onPackageBuilt(event);
                break;
            }
        }
    };

    private onPackagesInitialized = (event: PackagesInitialized): void => {
        const { graph, packages } = event.body;

        this.dependencyGraph = graph;
        this.buildOrder = determinePackageBuildOrder(graph, ["prod"]);
        this.itemIndex = {};
        this.listItems = createPackageItems(packages);
        this.listItems.forEach((item, idx) => (this.itemIndex[item.sdkPackage.packageName] = idx));

        this.list.setItems(this.listItems.map(createPackageItem) as any);
        this.screen.render();
    };

    private onPackageBuilt = (event: PackageBuilt): void => {
        const { sdkPackage, exitCode } = event.body;

        const result = this.updateItem(sdkPackage.packageName, (item) => {
            item.buildIndicator = !exitCode ? IndicatorSuccess : IndicatorError;
        });

        if (result) {
            this.refreshItem(...result);
        }
    };

    private selectItem = (selectedIdx: number): void => {
        const selectedItem = this.listItems[selectedIdx];

        if (!selectedItem) {
            return;
        }

        this.selectedItemIdx = selectedIdx;
        const selectedItemPosition =
            this.buildOrder?.findIndex((pkgs) => pkgs.includes(selectedItem.packageName)) ?? -1;
        const dependents = flatten(
            findDependingPackages(this.dependencyGraph!, [selectedItem.packageName], ["prod"]),
        );

        this.listItems.forEach((item, idx) => {
            item.selected = false;
            item.highlightLevel = -1;

            if (selectedIdx === idx) {
                item.selected = true;
            } else if (dependents.includes(item.packageName)) {
                const itemPosition =
                    this.buildOrder?.findIndex((pkgs) => pkgs.includes(item.packageName)) ?? -1;

                item.highlightLevel = itemPosition - selectedItemPosition - 1;
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

function createPackageItems(packages: SdkPackageDescriptor[]): PackageListItem[] {
    if (packages.length === 0) {
        return [];
    }

    packages.sort(packageComparator);
    const maxLen = max(packages.map((p) => p.packageName.length))!;

    return packages.map((p) => ({
        selected: false,
        highlightLevel: -1,
        packageName: p.packageName,
        sdkPackage: p,
        padding: maxLen - p.packageName.length,
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

    return `${selectedBeginTag}${item.sdkPackage.packageName}${padding}${selectedEndTag} ${item.buildIndicator}${item.publishIndicator}`;
}

function packageComparator(a: SdkPackageDescriptor, b: SdkPackageDescriptor): number {
    if (a.type === "lib" && b.type === "tool") {
        return -1;
    } else if (a.type === "tool" && b.type === "lib") {
        return 1;
    }

    return a.packageName.localeCompare(b.packageName);
}
