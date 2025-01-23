// (C) 2021-2025 GoodData Corporation
import {
    IDashboardLayout,
    IDashboardLayoutSection,
    IDashboardLayoutItem,
    objRefToString,
} from "@gooddata/sdk-model";
import isEmpty from "lodash/isEmpty.js";
import cloneDeep from "lodash/cloneDeep.js";
import { IFluidLayoutCustomizer } from "../customizer.js";
import { ExtendedDashboardWidget, ICustomWidget } from "../../model/index.js";
import { DashboardLayoutBuilder } from "../../_staging/dashboard/flexibleLayout/index.js";
import { IDashboardCustomizationLogger } from "./customizationLogging.js";
import { CustomizerMutationsContext } from "./types.js";
import { ILayoutItemPath, ILayoutSectionPath } from "../../types.js";

type AddItemOp = {
    itemPath: ILayoutItemPath;
    item: IDashboardLayoutItem<ICustomWidget>;
};

type AddSectionOp = {
    sectionPath: ILayoutSectionPath;
    section: IDashboardLayoutSection<ICustomWidget>;
};

export class FluidLayoutCustomizer implements IFluidLayoutCustomizer {
    private readonly addItemOps: AddItemOp[] = [];
    private readonly addSectionOps: AddSectionOp[] = [];

    constructor(
        private readonly logger: IDashboardCustomizationLogger,
        private readonly mutationContext: CustomizerMutationsContext,
    ) {}

    public addItem(
        sectionIdx: number,
        itemIdx: number,
        item: IDashboardLayoutItem<ICustomWidget>,
    ): IFluidLayoutCustomizer {
        return this.addItemToPath([{ sectionIndex: sectionIdx, itemIndex: itemIdx }], item);
    }

    public addItemToPath(
        itemPath: ILayoutItemPath,
        item: IDashboardLayoutItem<ICustomWidget>,
    ): IFluidLayoutCustomizer {
        if (!item.widget) {
            this.logger.warn(
                `Item to add to path ${itemPath} does not contain any widget. The item will not be added at all.`,
                item,
            );

            return this;
        }

        this.addItemOps.push({
            itemPath,
            item: cloneDeep(item),
        });

        return this;
    }

    public addSection(
        sectionIdx: number,
        section: IDashboardLayoutSection<ICustomWidget>,
    ): IFluidLayoutCustomizer {
        return this.addSectionToPath({ sectionIndex: sectionIdx }, section);
    }

    public addSectionToPath(
        sectionPath: ILayoutSectionPath,
        section: IDashboardLayoutSection<ICustomWidget>,
    ): IFluidLayoutCustomizer {
        if (isEmpty(section.items)) {
            this.logger.warn(
                `Section to add at path ${sectionPath} contains no items. The section will not be added at all.`,
                section,
            );

            return this;
        }

        const itemsWithoutWidget = section.items.filter((item) => item.widget === undefined);

        if (!isEmpty(itemsWithoutWidget)) {
            this.logger.warn(
                `Section to add at path ${sectionPath} contains items that do not specify any widgets. The section will not be added at all.`,
                section,
            );

            return this;
        }

        this.addSectionOps.push({
            sectionPath,
            section: cloneDeep(section),
        });
        return this;
    }

    public applyTransformations = (
        layout: IDashboardLayout<ExtendedDashboardWidget>,
    ): IDashboardLayout<ExtendedDashboardWidget> => {
        const builder = DashboardLayoutBuilder.for(layout);
        const layoutFacade = builder.facade();
        const { layouts } = this.mutationContext;

        this.addItemOps.forEach((op) => {
            const { itemPath, item } = op;

            const parentPath = itemPath.slice(0, -1);
            const lastPathItem = itemPath[itemPath.length - 1];
            const sectionIndex =
                lastPathItem.sectionIndex === -1
                    ? layoutFacade.sections().count()
                    : lastPathItem.sectionIndex;

            const sectionPath: ILayoutSectionPath = {
                parent: parentPath,
                sectionIndex,
            };

            builder.modifySection(sectionPath, (sectionBuilder) => {
                sectionBuilder.addItem(
                    item,
                    lastPathItem.itemIndex === -1
                        ? sectionBuilder.facade().items().count()
                        : lastPathItem.itemIndex,
                );
                if (item.widget) {
                    layouts[objRefToString(item.widget)] = "inserted";
                }
                return sectionBuilder;
            });
        });

        this.addSectionOps.forEach((op) => {
            const { sectionPath, section } = op;
            const resolvedSectionPath: ILayoutSectionPath = {
                ...sectionPath,
                sectionIndex:
                    sectionPath.sectionIndex === -1
                        ? layoutFacade.sections().count()
                        : sectionPath.sectionIndex,
            };

            builder.addSection(section, resolvedSectionPath);
            section.items.forEach((item) => {
                if (item.widget) {
                    layouts[objRefToString(item.widget)] = "inserted";
                }
            });
        });

        return builder.build();
    };
}
