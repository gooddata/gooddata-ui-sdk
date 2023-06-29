// (C) 2019-2022 GoodData Corporation
import {
    IDashboardLayout,
    IDashboardLayoutSection,
    IDashboardLayoutSize,
    isDashboardLayout,
} from "@gooddata/sdk-model";
import { invariant } from "ts-invariant";
import difference from "lodash/difference.js";
import isArray from "lodash/isArray.js";
import identity from "lodash/identity.js";
import {
    DashboardLayoutModifications,
    DashboardLayoutSectionModifications,
    DashboardLayoutSectionsSelector,
    IDashboardLayoutBuilder,
} from "./interfaces.js";
import { IDashboardLayoutFacade } from "../facade/interfaces.js";
import { DashboardLayoutFacade } from "../facade/layout.js";
import { DashboardLayoutSectionBuilder } from "./section.js";
import { resolveValueOrUpdateCallback, ValueOrUpdateCallback } from "@gooddata/sdk-backend-base";

/**
 * @alpha
 */
export class DashboardLayoutBuilder<TWidget> implements IDashboardLayoutBuilder<TWidget> {
    protected constructor(
        protected layoutFacade: IDashboardLayoutFacade<TWidget>,
        protected layoutFacadeConstructor: (
            layout: IDashboardLayout<TWidget>,
        ) => IDashboardLayoutFacade<TWidget>,
    ) {}

    /**
     * Creates an instance of DashboardLayoutBuilder for particular layout.
     *
     * @param layout - layout to modify
     */
    public static for<TWidget>(layout: IDashboardLayout<TWidget>): IDashboardLayoutBuilder<TWidget> {
        invariant(isDashboardLayout<TWidget>(layout), "Provided data must be IDashboardLayout.");
        const dashboardLayoutBuilder: IDashboardLayoutBuilder<TWidget> = new DashboardLayoutBuilder(
            DashboardLayoutFacade.for(layout),
            DashboardLayoutFacade.for,
        );

        return dashboardLayoutBuilder;
    }

    /**
     * Creates an instance of DashboardLayoutBuilder with empty layout.
     */
    public static forNewLayout<TWidget>(): IDashboardLayoutBuilder<TWidget> {
        const emptyLayout: IDashboardLayout<TWidget> = {
            type: "IDashboardLayout",
            sections: [],
        };
        return DashboardLayoutBuilder.for(emptyLayout);
    }

    public size(valueOrUpdateCallback: ValueOrUpdateCallback<IDashboardLayoutSize | undefined>): this {
        return this.setLayout((layout) => ({
            ...layout,
            size: resolveValueOrUpdateCallback(valueOrUpdateCallback, this.facade().size()),
        }));
    }

    public createSection(
        create: DashboardLayoutSectionModifications<TWidget> = identity,
        index: number = this.facade().sections().count(),
    ): this {
        const emptySection: IDashboardLayoutSection<TWidget> = {
            type: "IDashboardLayoutSection",
            items: [],
        };
        this.setLayout((layout) => {
            const updatedRows = [...layout.sections];
            updatedRows.splice(index, 0, emptySection);
            return {
                ...layout,
                sections: updatedRows,
            };
        });
        DashboardLayoutSectionBuilder.for(this, index).modify(create);
        return this;
    }

    public addSection(
        section: IDashboardLayoutSection<TWidget>,
        index: number = this.facade().sections().count(),
    ): this {
        this.setLayout((layout) => {
            const updatedRows = [...layout.sections];
            updatedRows.splice(index, 0, section);
            return {
                ...layout,
                sections: updatedRows,
            };
        });

        return this;
    }

    public modifySection(index: number, modify: DashboardLayoutSectionModifications<TWidget>): this {
        const sectionFacade = this.facade().sections().section(index);
        invariant(sectionFacade, `Cannot modify the section - section at index ${index} does not exist.`);

        DashboardLayoutSectionBuilder.for(this, index).modify(modify);
        return this;
    }

    public removeSection(index: number): this {
        const sectionFacade = this.facade().sections().section(index);
        invariant(sectionFacade, `Cannot remove the section - section at index ${index} does not exist.`);

        return this.setLayout((layout) => {
            const updatedRows = [...layout.sections];
            updatedRows.splice(index, 1);
            return {
                ...layout,
                sections: updatedRows,
            };
        });
    }

    public moveSection(fromIndex: number, toIndex: number): this {
        const section = this.facade().sections().section(fromIndex)?.raw();
        invariant(section, `Cannot move the section - section at index ${fromIndex} does not exist.`);

        const maxToIndex = Math.min(toIndex, this.facade().sections().count() - 1);

        this.removeSection(fromIndex);
        this.createSection((r) => {
            return r.setSection(section);
        }, maxToIndex);
        return this;
    }

    public removeSections(
        selector: DashboardLayoutSectionsSelector<TWidget> = (sections) => sections.all(),
    ): this {
        const sectionsToRemove = selector(this.facade().sections());
        if (isArray(sectionsToRemove)) {
            this.setLayout((layout) => {
                const updatedRows = difference(
                    layout.sections,
                    sectionsToRemove.map((r) => r.raw()),
                );
                return {
                    ...layout,
                    sections: updatedRows,
                };
            });
        } else if (sectionsToRemove) {
            this.removeSection(sectionsToRemove.index());
        }
        return this;
    }

    public removeEmptySections(): this {
        return this.removeSections((sections) => sections.filter((section) => section.isEmpty()));
    }

    public modifySections(
        modify: DashboardLayoutSectionModifications<TWidget>,
        selector: DashboardLayoutSectionsSelector<TWidget> = (sections) => sections.all(),
    ): this {
        const sectionsToModify = selector(this.facade().sections());
        if (isArray(sectionsToModify)) {
            sectionsToModify.forEach((section) => {
                this.modifySection(section.index(), modify);
            });
        } else if (sectionsToModify) {
            this.modifySection(sectionsToModify.index(), modify);
        }
        return this;
    }

    public setLayout(valueOrUpdateCallback: ValueOrUpdateCallback<IDashboardLayout<TWidget>>): this {
        const updatedLayout = resolveValueOrUpdateCallback(valueOrUpdateCallback, this.build());
        this.layoutFacade = this.layoutFacadeConstructor(updatedLayout);
        return this;
    }

    public facade(): IDashboardLayoutFacade<TWidget> {
        return this.layoutFacade;
    }

    public modify(modifications: DashboardLayoutModifications<TWidget>): this {
        modifications(this, this.facade());
        return this;
    }

    public build(): IDashboardLayout<TWidget> {
        return this.layoutFacade.raw();
    }
}
