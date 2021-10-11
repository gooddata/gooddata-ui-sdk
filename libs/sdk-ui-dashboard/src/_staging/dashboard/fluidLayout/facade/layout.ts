// (C) 2019-2021 GoodData Corporation
import { IDashboardLayout, IDashboardLayoutSize, isDashboardLayout } from "@gooddata/sdk-backend-spi";
import invariant from "ts-invariant";
import {
    IDashboardLayoutFacade,
    IDashboardLayoutSectionFacade,
    IDashboardLayoutSectionsFacade,
} from "./interfaces";
import { DashboardLayoutSectionFacade } from "./section";
import { DashboardLayoutSectionsFacade } from "./sections";

/**
 * @alpha
 */
export class DashboardLayoutFacade<TWidget> implements IDashboardLayoutFacade<TWidget> {
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
        return DashboardLayoutSectionsFacade.for(this, this.layout.sections);
    }

    public section(rowIndex: number): IDashboardLayoutSectionFacade<TWidget> | undefined {
        const row = this.layout.sections[rowIndex];
        if (!row) {
            return undefined;
        }
        return DashboardLayoutSectionFacade.for(this, row, rowIndex);
    }

    public size(): IDashboardLayoutSize | undefined {
        return this.layout.size;
    }

    public raw(): IDashboardLayout<TWidget> {
        return this.layout;
    }
}
