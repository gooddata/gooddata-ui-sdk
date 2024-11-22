// (C) 2019-2024 GoodData Corporation
import { IDashboardLayout, IDashboardLayoutSize, isDashboardLayout } from "@gooddata/sdk-model";
import { invariant } from "ts-invariant";
import {
    IDashboardLayoutFacade,
    IDashboardLayoutSectionFacade,
    IDashboardLayoutSectionsFacade,
} from "./interfaces.js";
import { DashboardLayoutSectionsFacade } from "./sections.js";
import { ILayoutItemPath } from "../../../../types.js";

/**
 * @alpha
 */
export class DashboardLayoutFacade<TWidget> implements IDashboardLayoutFacade<TWidget> {
    private sectionsCache: IDashboardLayoutSectionsFacade<TWidget> | undefined;
    protected constructor(
        protected layout: IDashboardLayout<TWidget>,
        protected layoutPath: ILayoutItemPath | undefined,
    ) {}

    /**
     * Creates an instance of DashboardLayoutFacade
     * @param layout - layout to wrap
     * @param layoutPath - path to the layout, undefined for root layout, path to parent layout item this layout resides in.
     */
    public static for<TWidget>(
        layout: IDashboardLayout<TWidget>,
        layoutPath: ILayoutItemPath | undefined,
    ): IDashboardLayoutFacade<TWidget> {
        invariant(isDashboardLayout<TWidget>(layout), "Provided data must be IDashboardLayout.");
        return new DashboardLayoutFacade(layout, layoutPath);
    }

    public sections(): IDashboardLayoutSectionsFacade<TWidget> {
        if (this.sectionsCache === undefined) {
            this.sectionsCache = DashboardLayoutSectionsFacade.for(
                this,
                this.layout.sections,
                this.layoutPath,
            );
        }
        return this.sectionsCache;
    }

    public section(rowIndex: number): IDashboardLayoutSectionFacade<TWidget> | undefined {
        return this.sections().section(rowIndex);
    }

    public size(): IDashboardLayoutSize | undefined {
        return this.layout.size;
    }

    public raw(): IDashboardLayout<TWidget> {
        return this.layout;
    }

    public parent(): ILayoutItemPath | undefined {
        return this.layoutPath;
    }
}
