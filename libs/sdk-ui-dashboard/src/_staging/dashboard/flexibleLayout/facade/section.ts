// (C) 2019-2025 GoodData Corporation
import isEqual from "lodash/isEqual.js";
import isNil from "lodash/isNil.js";

import { IDashboardLayoutSection, IDashboardLayoutSectionHeader } from "@gooddata/sdk-model";

import {
    IDashboardLayoutFacade,
    IDashboardLayoutItemFacade,
    IDashboardLayoutItemsFacade,
    IDashboardLayoutSectionFacade,
} from "./interfaces.js";
import { DashboardLayoutItemFacade } from "./item.js";
import { DashboardLayoutItemsFacade } from "./items.js";
import { ILayoutSectionPath } from "../../../../types.js";
import {
    areSectionLayoutPathsEqual,
    asLayoutItemPath,
    updateSectionIndex,
} from "../../../layout/coordinates.js";

/**
 * @alpha
 */
export class DashboardLayoutSectionFacade<TContent> implements IDashboardLayoutSectionFacade<TContent> {
    protected constructor(
        protected readonly layoutFacade: IDashboardLayoutFacade<TContent>,
        protected readonly section: IDashboardLayoutSection<TContent>,
        protected readonly sectionIndex: ILayoutSectionPath,
    ) {}

    public static for<TContent>(
        layoutFacade: IDashboardLayoutFacade<TContent>,
        section: IDashboardLayoutSection<TContent>,
        index: ILayoutSectionPath,
    ): IDashboardLayoutSectionFacade<TContent> {
        return new DashboardLayoutSectionFacade(layoutFacade, section, index);
    }

    public raw(): IDashboardLayoutSection<TContent> {
        return this.section;
    }

    public header(): IDashboardLayoutSectionHeader | undefined {
        return this.section.header;
    }

    public title(): string | undefined {
        return this.header()?.title;
    }

    public description(): string | undefined {
        return this.header()?.description;
    }

    public index(): ILayoutSectionPath {
        return this.sectionIndex;
    }

    public isFirst(): boolean {
        return this.indexIs(updateSectionIndex(this.sectionIndex, 0));
    }

    public isLast(): boolean {
        return this.indexIs(updateSectionIndex(this.sectionIndex, this.layoutFacade.sections().count() - 1));
    }

    public testRaw(pred: (section: IDashboardLayoutSection<TContent>) => boolean): boolean {
        return pred(this.raw());
    }

    public test(pred: (section: IDashboardLayoutSectionFacade<TContent>) => boolean): boolean {
        return pred(this);
    }

    public indexIs(index: ILayoutSectionPath): boolean {
        return areSectionLayoutPathsEqual(this.index(), index);
    }

    public headerEquals(header: IDashboardLayoutSectionHeader): boolean {
        return isEqual(this.header(), header);
    }

    public hasHeader(): boolean {
        return !isNil(this.header());
    }

    public hasTitle(): boolean {
        return !isNil(this.title());
    }

    public hasDescription(): boolean {
        return !isNil(this.description());
    }

    public titleEquals(title: string): boolean {
        return isEqual(this.title(), title);
    }

    public descriptionEquals(description: string): boolean {
        return isEqual(this.description(), description);
    }

    public isEmpty(): boolean {
        return this.items().count() === 0;
    }

    public items(): IDashboardLayoutItemsFacade<TContent> {
        return DashboardLayoutItemsFacade.for(this, this.section.items);
    }

    public item(index: number): IDashboardLayoutItemFacade<TContent> | undefined {
        const column = this.section.items[index];
        if (!column) {
            return undefined;
        }
        const layoutPath = asLayoutItemPath(this.sectionIndex, index);
        return DashboardLayoutItemFacade.for(this, column, layoutPath);
    }

    public layout(): IDashboardLayoutFacade<TContent> {
        return this.layoutFacade;
    }
}
