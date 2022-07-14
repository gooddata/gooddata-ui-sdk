// (C) 2022 GoodData Corporation
import { ObjRef } from "../objRef";

/**
 * Legacy Dashboard (a.k.a. PP Dashboard) tab.
 *
 * @alpha
 */
export interface ILegacyDashboardTab {
    /**
     * Title of the tab
     */
    readonly title: string;
    /**
     * Unique identifier of the tab
     */
    readonly identifier: string;
}

/**
 * Legacy Dashboard (a.k.a. PP Dashboard).
 *
 * @remarks
 * Use this only if you are certain you need this, for vast majority of use cases the {@link IDashboard} is a much better fit.
 *
 * @alpha
 */
export interface ILegacyDashboard {
    /**
     * Object ref
     */
    readonly ref: ObjRef;

    /**
     * Object uri
     */
    readonly uri: string;

    /**
     * Object identifier
     */
    readonly identifier: string;

    /**
     * Title of the legacy dashboard
     */
    readonly title: string;

    /**
     * Tabs included in the legacy dashboard
     */
    readonly tabs: ILegacyDashboardTab[];
}
