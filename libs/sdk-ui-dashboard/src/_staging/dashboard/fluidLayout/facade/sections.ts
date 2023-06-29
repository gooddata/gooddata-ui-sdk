// (C) 2019-2022 GoodData Corporation
import flatMap from "lodash/flatMap.js";
import { IDashboardLayoutSection } from "@gooddata/sdk-model";
import {
    IDashboardLayoutSectionsFacade,
    IDashboardLayoutSectionFacade,
    IDashboardLayoutFacade,
} from "./interfaces.js";
import { DashboardLayoutSectionFacade } from "./section.js";

/**
 * @alpha
 */
export class DashboardLayoutSectionsFacade<TWidget> implements IDashboardLayoutSectionsFacade<TWidget> {
    protected constructor(
        protected readonly layoutFacade: IDashboardLayoutFacade<TWidget>,
        protected readonly sectionFacades: IDashboardLayoutSectionFacade<TWidget>[],
    ) {}

    public static for<TWidget>(
        layoutFacade: IDashboardLayoutFacade<TWidget>,
        sections: IDashboardLayoutSection<TWidget>[],
    ): IDashboardLayoutSectionsFacade<TWidget> {
        const sectionFacades = sections.map((section, index) =>
            DashboardLayoutSectionFacade.for(layoutFacade, section, index),
        );
        return new DashboardLayoutSectionsFacade(layoutFacade, sectionFacades);
    }

    public raw(): IDashboardLayoutSection<TWidget>[] {
        return this.sectionFacades.map((s) => s.raw());
    }

    public all(): IDashboardLayoutSectionFacade<TWidget>[] {
        return this.sectionFacades;
    }

    public section(index: number): IDashboardLayoutSectionFacade<TWidget> | undefined {
        return this.sectionFacades[index];
    }

    public flatMap<TReturn>(
        callback: (section: IDashboardLayoutSectionFacade<TWidget>) => TReturn[],
    ): TReturn[] {
        return flatMap(this.sectionFacades, callback);
    }

    public count(): number {
        return this.sectionFacades.length;
    }

    public map<TReturn>(callback: (section: IDashboardLayoutSectionFacade<TWidget>) => TReturn): TReturn[] {
        return this.sectionFacades.map(callback);
    }

    public reduce<TReturn>(
        callback: (acc: TReturn, section: IDashboardLayoutSectionFacade<TWidget>) => TReturn,
        initialValue: TReturn,
    ): TReturn {
        return this.sectionFacades.reduce(callback, initialValue);
    }

    public every<TReturn extends IDashboardLayoutSectionFacade<TWidget>>(
        pred: (section: IDashboardLayoutSectionFacade<TWidget>) => section is TReturn,
    ): boolean {
        return this.sectionFacades.every(pred);
    }

    public some<TReturn extends IDashboardLayoutSectionFacade<TWidget>>(
        pred: (section: IDashboardLayoutSectionFacade<TWidget>) => section is TReturn,
    ): boolean {
        return this.sectionFacades.some(pred);
    }

    public find<TReturn extends IDashboardLayoutSectionFacade<TWidget>>(
        pred: (section: IDashboardLayoutSectionFacade<TWidget>) => section is TReturn,
    ): TReturn | undefined {
        return this.sectionFacades.find(pred);
    }

    public filter<TReturn extends IDashboardLayoutSectionFacade<TWidget>>(
        pred: (section: IDashboardLayoutSectionFacade<TWidget>) => section is TReturn,
    ): TReturn[] {
        return this.sectionFacades.filter(pred);
    }
}
