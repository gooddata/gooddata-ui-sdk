// (C) 2021 GoodData Corporation
import { IDashboardLayout, IDashboardLayoutItem, IDashboardLayoutSection } from "@gooddata/sdk-backend-spi";
import { IFluidLayoutCustomizer } from "../customizer";
import { ExtendedDashboardWidget, ICustomWidget } from "../../model";
import { DashboardLayoutBuilder } from "../../_staging/dashboard/fluidLayout";
import isEmpty from "lodash/isEmpty";
import { DashboardCustomizationLogger } from "./customizationLogging";
import cloneDeep from "lodash/cloneDeep";

type AddItemOp = {
    sectionIdx: number;
    itemIdx: number;
    item: IDashboardLayoutItem<ICustomWidget>;
};

type AddSectionOp = {
    sectionIdx: number;
    section: IDashboardLayoutSection<ICustomWidget>;
};

export class FluidLayoutCustomizer implements IFluidLayoutCustomizer {
    private readonly addItemOps: AddItemOp[] = [];
    private readonly addSectionOps: AddSectionOp[] = [];

    constructor(private readonly logger: DashboardCustomizationLogger) {}

    public addItem = (
        sectionIdx: number,
        itemIdx: number,
        item: IDashboardLayoutItem<ICustomWidget>,
    ): IFluidLayoutCustomizer => {
        if (!item.widget) {
            this.logger.warn(
                `Item to add to section ${sectionIdx} at index ${itemIdx} does not contain any widget. The item will not be added at all.`,
                item,
            );

            return this;
        }

        this.addItemOps.push({
            sectionIdx,
            itemIdx,
            item: cloneDeep(item),
        });

        return this;
    };

    public addSection = (
        sectionIdx: number,
        section: IDashboardLayoutSection<ICustomWidget>,
    ): IFluidLayoutCustomizer => {
        if (isEmpty(section.items)) {
            this.logger.warn(
                `Section to add at index ${sectionIdx} contains no items. The section will not be added at all.`,
                section,
            );

            return this;
        }

        const itemsWithoutWidget = section.items.filter((item) => item.widget === undefined);

        if (!isEmpty(itemsWithoutWidget)) {
            this.logger.warn(
                `Section to add at index ${sectionIdx} contains items that do not specify any widgets. The section will not be added at all.`,
                section,
            );

            return this;
        }

        this.addSectionOps.push({
            sectionIdx,
            section: cloneDeep(section),
        });
        return this;
    };

    public applyTransformations = (
        layout: IDashboardLayout<ExtendedDashboardWidget>,
    ): IDashboardLayout<ExtendedDashboardWidget> => {
        const builder = DashboardLayoutBuilder.for(layout);
        const facade = builder.facade();

        this.addItemOps.forEach((op) => {
            const { sectionIdx, itemIdx, item } = op;
            const actualSectionIdx = sectionIdx === -1 ? facade.sections().count() : sectionIdx;

            builder.modifySection(actualSectionIdx, (sectionBuilder) => {
                sectionBuilder.addItem(item, itemIdx === -1 ? undefined : itemIdx);

                return sectionBuilder;
            });
        });

        this.addSectionOps.forEach((op) => {
            const { sectionIdx, section } = op;

            builder.addSection(section, sectionIdx === -1 ? undefined : sectionIdx);
        });

        return builder.build();
    };
}
