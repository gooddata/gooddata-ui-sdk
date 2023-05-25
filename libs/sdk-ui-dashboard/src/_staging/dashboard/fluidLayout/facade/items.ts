// (C) 2019-2022 GoodData Corporation
import { IDashboardLayoutItem, ScreenSize } from "@gooddata/sdk-model";
import flatMap from "lodash/flatMap.js";
import { DashboardLayoutItemFacade } from "./item.js";
import {
    IDashboardLayoutItemFacade,
    IDashboardLayoutItemsFacade,
    IDashboardLayoutSectionFacade,
} from "./interfaces.js";
import { invariant } from "ts-invariant";
import { DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT } from "../config.js";

/**
 * @alpha
 */
export class DashboardLayoutItemsFacade<TWidget> implements IDashboardLayoutItemsFacade<TWidget> {
    protected constructor(protected readonly itemFacades: IDashboardLayoutItemFacade<TWidget>[]) {}

    public static for<TWidget>(
        sectionFacade: IDashboardLayoutSectionFacade<TWidget>,
        items: IDashboardLayoutItem<TWidget>[],
    ): IDashboardLayoutItemsFacade<TWidget> {
        const itemFacades = items.map((column, index) =>
            DashboardLayoutItemFacade.for(sectionFacade, column, index),
        );
        return new DashboardLayoutItemsFacade(itemFacades);
    }

    public raw(): IDashboardLayoutItem<TWidget>[] {
        return this.itemFacades.map((item) => item.raw());
    }

    public item(index: number): IDashboardLayoutItemFacade<TWidget> | undefined {
        return this.itemFacades[index];
    }

    public all(): IDashboardLayoutItemFacade<TWidget>[] {
        return this.itemFacades;
    }

    public asGridRows(screen: ScreenSize): IDashboardLayoutItemFacade<TWidget>[][] {
        const renderedRows: IDashboardLayoutItemFacade<TWidget>[][] = [];

        let currentRowWidth = 0;
        let currentRow: IDashboardLayoutItemFacade<TWidget>[] = [];

        this.itemFacades.forEach((itemFacade) => {
            const itemSize = itemFacade.sizeForScreen(screen);

            invariant(itemSize, `Item size for ${screen} screen is not defined.`);

            if (currentRowWidth + itemSize.gridWidth > DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT) {
                renderedRows.push(currentRow);
                currentRow = [];
                currentRowWidth = 0;
            }

            currentRow.push(itemFacade);
            currentRowWidth = currentRowWidth + itemSize.gridWidth;
        });

        if (currentRow.length > 0) {
            renderedRows.push(currentRow);
        }

        return renderedRows;
    }

    public flatMap<TResult>(callback: (column: IDashboardLayoutItemFacade<TWidget>) => TResult[]): TResult[] {
        return flatMap(this.itemFacades, callback);
    }

    public count(): number {
        return this.itemFacades.length;
    }

    public map<TReturn>(callback: (section: IDashboardLayoutItemFacade<TWidget>) => TReturn): TReturn[] {
        return this.itemFacades.map(callback);
    }

    public reduce<TReturn>(
        callback: (acc: TReturn, section: IDashboardLayoutItemFacade<TWidget>) => TReturn,
        initialValue: TReturn,
    ): TReturn {
        return this.itemFacades.reduce(callback, initialValue);
    }

    public every<TReturn extends IDashboardLayoutItemFacade<TWidget>>(
        pred: (section: IDashboardLayoutItemFacade<TWidget>) => section is TReturn,
    ): boolean {
        return this.itemFacades.every(pred);
    }

    public some<TReturn extends IDashboardLayoutItemFacade<TWidget>>(
        pred: (section: IDashboardLayoutItemFacade<TWidget>) => section is TReturn,
    ): boolean {
        return this.itemFacades.some(pred);
    }

    public find<TReturn extends IDashboardLayoutItemFacade<TWidget>>(
        pred: (section: IDashboardLayoutItemFacade<TWidget>) => section is TReturn,
    ): TReturn | undefined {
        return this.itemFacades.find(pred);
    }

    public filter<TReturn extends IDashboardLayoutItemFacade<TWidget>>(
        pred: (section: IDashboardLayoutItemFacade<TWidget>) => section is TReturn,
    ): TReturn[] {
        return this.itemFacades.filter(pred);
    }
}
