// (C) 2019-2023 GoodData Corporation
import { IDashboardLayout, IDashboardLayoutSize, isDashboardLayout } from "@gooddata/sdk-model";
import { invariant } from "ts-invariant";
import {
    IDashboardLayoutFacade,
    IDashboardLayoutSectionFacade,
    IDashboardLayoutSectionsFacade,
} from "./interfaces.js";
import { DashboardLayoutSectionsFacade } from "./sections.js";

/**
 * @alpha
 */
export class DashboardLayoutFacade<TWidget> implements IDashboardLayoutFacade<TWidget> {
    private sectionsCache: IDashboardLayoutSectionsFacade<TWidget> | undefined;
    protected constructor(protected layout: IDashboardLayout<TWidget>) {}

    /**
     * Creates an instance of DashboardLayoutFacade
     * @param layout - layout to wrap
     */
    public static for<TWidget>(layout: IDashboardLayout<TWidget>): IDashboardLayoutFacade<TWidget> {
        invariant(isDashboardLayout<TWidget>(layout), "Provided data must be IDashboardLayout.");
        return new DashboardLayoutFacade(layout);
    }

    public sections(): IDashboardLayoutSectionsFacade<TWidget> {
        if (this.sectionsCache === undefined) {
            this.sectionsCache = DashboardLayoutSectionsFacade.for(this, this.layout.sections);
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
}
