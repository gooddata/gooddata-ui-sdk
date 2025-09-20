// (C) 2019-2025 GoodData Corporation
import { difference, identity, isArray } from "lodash-es";
import { invariant } from "ts-invariant";

import { ValueOrUpdateCallback, resolveValueOrUpdateCallback } from "@gooddata/sdk-backend-base";
import {
    IDashboardLayout,
    IDashboardLayoutSection,
    IDashboardLayoutSize,
    isDashboardLayout,
} from "@gooddata/sdk-model";

import {
    DashboardLayoutModifications,
    DashboardLayoutSectionModifications,
    DashboardLayoutSectionsSelector,
    IDashboardLayoutBuilder,
    IDashboardLayoutSectionBuilder,
} from "./interfaces.js";
import { DashboardLayoutItemBuilder } from "./item.js";
import { DashboardLayoutSectionBuilder } from "./section.js";
import { ILayoutItemPath, ILayoutSectionPath } from "../../../../types.js";
import { getSectionIndex } from "../../../layout/coordinates.js";
import { IDashboardLayoutFacade } from "../facade/interfaces.js";
import { DashboardLayoutFacade } from "../facade/layout.js";

/**
 * @alpha
 */
export class DashboardLayoutBuilder<TWidget> implements IDashboardLayoutBuilder<TWidget> {
    protected constructor(
        protected layoutFacade: IDashboardLayoutFacade<TWidget>,
        protected layoutFacadeConstructor: (
            layout: IDashboardLayout<TWidget>,
            layoutPath: ILayoutItemPath | undefined,
        ) => IDashboardLayoutFacade<TWidget>,
    ) {}

    /**
     * Creates an instance of DashboardLayoutBuilder for particular layout.
     *
     * @param layout - layout to modify
     */
    public static for<TWidget>(
        layout: IDashboardLayout<TWidget>,
        layoutPath?: ILayoutItemPath,
    ): DashboardLayoutBuilder<TWidget> {
        invariant(isDashboardLayout<TWidget>(layout), "Provided data must be IDashboardLayout.");
        return new DashboardLayoutBuilder(
            DashboardLayoutFacade.for(layout, layoutPath),
            DashboardLayoutFacade.for,
        );
    }

    /**
     * Creates an instance of DashboardLayoutBuilder with empty layout.
     *
     * @param layoutPath - layout path in case of nested layout
     */
    public static forNewLayout<TWidget>(layoutPath?: ILayoutItemPath): IDashboardLayoutBuilder<TWidget> {
        const emptyLayout: IDashboardLayout<TWidget> = {
            type: "IDashboardLayout",
            sections: [],
        };
        return DashboardLayoutBuilder.for(emptyLayout, layoutPath);
    }

    public size(valueOrUpdateCallback: ValueOrUpdateCallback<IDashboardLayoutSize | undefined>): this {
        return this.setLayout((layout) => ({
            ...layout,
            size: resolveValueOrUpdateCallback(valueOrUpdateCallback, this.facade().size()),
        }));
    }

    public createSection(
        create: (
            builder: IDashboardLayoutSectionBuilder<TWidget>,
        ) => IDashboardLayoutSectionBuilder<TWidget> = identity,
        indexOrPath?: number | ILayoutSectionPath,
    ): this {
        if (typeof indexOrPath === "number" || typeof indexOrPath === "undefined") {
            const index: number = indexOrPath ?? this.facade().sections().count();
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
        } else {
            this.createSectionByPath(create, indexOrPath);
        }
        return this;
    }
    private createSectionByPath(
        create: (builder: IDashboardLayoutSectionBuilder<TWidget>) => IDashboardLayoutSectionBuilder<TWidget>,
        sectionPath: ILayoutSectionPath,
    ): this {
        if (sectionPath.parent && sectionPath.parent.length > 0) {
            const [nextPathEntry, ...remainingPath] = sectionPath.parent;

            const nestedLayout = this.facade().nestedLayout([nextPathEntry])?.raw();
            invariant(
                nestedLayout,
                `Cannot create section - nested layout at path ${JSON.stringify(
                    nextPathEntry,
                )} does not exist.`,
            );

            const sectionBuilder = DashboardLayoutSectionBuilder.for(this, nextPathEntry.sectionIndex);

            const modify = (nestedLayoutBuilder: IDashboardLayoutBuilder<TWidget>) => {
                return nestedLayoutBuilder.createSection(create, {
                    parent: remainingPath,
                    sectionIndex: sectionPath.sectionIndex,
                });
            };
            DashboardLayoutItemBuilder.for(sectionBuilder, nextPathEntry.itemIndex).modifyLayoutWidget(
                modify,
                DashboardLayoutBuilder.for,
            );
        } else {
            this.createSection(create, sectionPath.sectionIndex);
        }
        return this;
    }

    public addSection(
        section: IDashboardLayoutSection<TWidget>,
        indexOrPath: number | ILayoutSectionPath | undefined,
    ): this {
        if (typeof indexOrPath === "number" || typeof indexOrPath === "undefined") {
            const index = indexOrPath === undefined ? this.facade().sections().count() : indexOrPath;
            this.setLayout((layout) => {
                const updatedRows = [...layout.sections];
                updatedRows.splice(index, 0, section);
                return {
                    ...layout,
                    sections: updatedRows,
                };
            });
        } else {
            this.addSectionByPath(indexOrPath, section);
        }

        return this;
    }
    private addSectionByPath(
        sectionPath: ILayoutSectionPath,
        section: IDashboardLayoutSection<TWidget>,
    ): this {
        if (sectionPath.parent && sectionPath.parent.length > 0) {
            const [nextPathEntry, ...remainingPath] = sectionPath.parent;

            const nestedLayout = this.facade().nestedLayout([nextPathEntry])?.raw();
            invariant(
                nestedLayout,
                `Cannot add section - nested layout at path ${JSON.stringify(nextPathEntry)} does not exist.`,
            );

            const sectionBuilder = DashboardLayoutSectionBuilder.for(this, nextPathEntry.sectionIndex);

            const modify = (nestedLayoutBuilder: IDashboardLayoutBuilder<TWidget>) => {
                return nestedLayoutBuilder.addSection(section, {
                    parent: remainingPath,
                    sectionIndex: sectionPath.sectionIndex,
                });
            };
            DashboardLayoutItemBuilder.for(sectionBuilder, nextPathEntry.itemIndex).modifyLayoutWidget(
                modify,
                DashboardLayoutBuilder.for,
            );
        } else {
            this.addSection(section, sectionPath.sectionIndex);
        }
        return this;
    }

    public modifySection(
        indexOrPath: number | ILayoutSectionPath,
        modify: DashboardLayoutSectionModifications<TWidget>,
    ): this {
        if (typeof indexOrPath === "number") {
            const sectionFacade = this.facade().sections().section(indexOrPath);
            invariant(
                sectionFacade,
                `Cannot modify the section - section at index ${indexOrPath} does not exist.`,
            );

            DashboardLayoutSectionBuilder.for(this, indexOrPath).modify(modify);
        } else {
            this.modifySectionByPath(indexOrPath, modify);
        }
        return this;
    }
    private modifySectionByPath(
        sectionPath: ILayoutSectionPath,
        modify: DashboardLayoutSectionModifications<TWidget>,
    ): this {
        if (sectionPath.parent && sectionPath.parent.length > 0) {
            const [nextPathEntry, ...remainingPath] = sectionPath.parent;

            const nestedLayout = this.facade().nestedLayout([nextPathEntry])?.raw();
            invariant(
                nestedLayout,
                `Cannot modify section - nested layout at path ${JSON.stringify(
                    nextPathEntry,
                )} does not exist.`,
            );

            const sectionBuilder = DashboardLayoutSectionBuilder.for(this, nextPathEntry.sectionIndex);

            const widgetModify = (nestedLayoutBuilder: IDashboardLayoutBuilder<TWidget>) => {
                return nestedLayoutBuilder.modifySection(
                    {
                        parent: remainingPath,
                        sectionIndex: sectionPath.sectionIndex,
                    },
                    modify,
                );
            };
            DashboardLayoutItemBuilder.for(sectionBuilder, nextPathEntry.itemIndex).modifyLayoutWidget(
                widgetModify,
                DashboardLayoutBuilder.for,
            );
        } else {
            this.modifySection(sectionPath.sectionIndex, modify);
        }
        return this;
    }

    public removeSection(indexOrPath: number | ILayoutSectionPath): this {
        if (typeof indexOrPath === "number") {
            const sectionFacade = this.facade().sections().section(indexOrPath);
            invariant(
                sectionFacade,
                `Cannot remove the section - section at index ${indexOrPath} does not exist.`,
            );

            return this.setLayout((layout) => {
                const updatedRows = [...layout.sections];
                updatedRows.splice(indexOrPath, 1);
                return {
                    ...layout,
                    sections: updatedRows,
                };
            });
        }
        return this.removeSectionByPath(indexOrPath);
    }

    private removeSectionByPath(sectionPath: ILayoutSectionPath): this {
        if (sectionPath.parent && sectionPath.parent.length > 0) {
            const [nextPathEntry, ...remainingPath] = sectionPath.parent;

            const nestedLayout = this.facade().nestedLayout([nextPathEntry])?.raw();

            invariant(
                nestedLayout,
                `Cannot modify section - nested layout at path ${JSON.stringify(
                    nextPathEntry,
                )} does not exist.`,
            );

            const sectionBuilder = DashboardLayoutSectionBuilder.for(this, nextPathEntry.sectionIndex);

            const widgetModify = (nestedLayoutBuilder: IDashboardLayoutBuilder<TWidget>) => {
                return nestedLayoutBuilder.removeSection({
                    parent: remainingPath,
                    sectionIndex: sectionPath.sectionIndex,
                });
            };
            DashboardLayoutItemBuilder.for(sectionBuilder, nextPathEntry.itemIndex).modifyLayoutWidget(
                widgetModify,
                DashboardLayoutBuilder.for,
            );

            return this;
        } else {
            return this.removeSection(sectionPath.sectionIndex);
        }
    }

    public moveSection(
        fromIndexOrPath: number | ILayoutSectionPath,
        toIndexOrPath: number | ILayoutSectionPath,
    ): this {
        if (typeof fromIndexOrPath === "number" && typeof toIndexOrPath === "number") {
            const section = this.facade().section(fromIndexOrPath)?.raw();
            invariant(
                section,
                `Cannot move the section - section at index ${fromIndexOrPath} does not exist.`,
            );

            const maxToIndex = Math.min(toIndexOrPath, this.facade().sections().count() - 1);

            this.removeSection(fromIndexOrPath);
            this.createSection((r) => {
                return r.setSection(section);
            }, maxToIndex);
        } else {
            this.moveSectionByPath(fromIndexOrPath, toIndexOrPath);
        }
        return this;
    }

    private moveSectionByPath(
        fromIndexOrPath: ILayoutSectionPath | number,
        toIndexOrPath: ILayoutSectionPath | number,
    ): this {
        const section =
            typeof fromIndexOrPath === "number"
                ? this.facade().section(fromIndexOrPath)?.raw()
                : this.facade()
                      .nestedLayout(fromIndexOrPath.parent ?? [])
                      ?.section(fromIndexOrPath.sectionIndex)
                      ?.raw();

        invariant(
            section,
            `Cannot move the section - section at index ${JSON.stringify(fromIndexOrPath)} does not exist.`,
        );

        this.removeSection(fromIndexOrPath);
        this.createSection((r) => {
            return r.setSection(section);
        }, toIndexOrPath);
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
            this.removeSection(getSectionIndex(sectionsToRemove.index()));
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
                this.modifySection(getSectionIndex(section.index()), modify);
            });
        } else if (sectionsToModify) {
            this.modifySection(getSectionIndex(sectionsToModify.index()), modify);
        }
        return this;
    }

    public setLayout(valueOrUpdateCallback: ValueOrUpdateCallback<IDashboardLayout<TWidget>>): this {
        const updatedLayout = resolveValueOrUpdateCallback(valueOrUpdateCallback, this.build());
        this.layoutFacade = this.layoutFacadeConstructor(updatedLayout, this.facade().path());
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
