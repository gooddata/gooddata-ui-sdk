// (C) 2021 GoodData Corporation
import { IDashboardLayout, IDashboardLayoutItem, IDashboardLayoutSection } from "@gooddata/sdk-backend-spi";
import { IFluidLayoutCustomizer } from "../customizer";
import { ExtendedDashboardWidget, ICustomWidget } from "../../model";
import { DashboardLayoutBuilder } from "../../_staging/dashboard/fluidLayout";

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

    constructor() {}

    public addItem = (
        sectionIdx: number,
        itemIdx: number,
        item: IDashboardLayoutItem<ICustomWidget>,
    ): IFluidLayoutCustomizer => {
        this.addItemOps.push({
            sectionIdx,
            itemIdx,
            item,
        });

        return this;
    };

    public addSection = (
        sectionIdx: number,
        section: IDashboardLayoutSection<ICustomWidget>,
    ): IFluidLayoutCustomizer => {
        this.addSectionOps.push({
            sectionIdx,
            section,
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
