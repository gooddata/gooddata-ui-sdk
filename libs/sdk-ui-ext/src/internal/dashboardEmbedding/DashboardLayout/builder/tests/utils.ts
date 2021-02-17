// (C) 2019-2021 GoodData Corporation
import {
    IDashboardViewLayoutBuilder,
    IDashboardViewLayoutColumnBuilder,
    IDashboardViewLayoutRowBuilder,
} from "../interfaces";
import { DashboardViewLayoutBuilder } from "../layout";
import { DashboardViewLayoutRowBuilder } from "../row";
import { DashboardViewLayoutColumnBuilder } from "../column";
import { IFluidLayoutSize } from "@gooddata/sdk-backend-spi";

export const defaultColumnXlSize: IFluidLayoutSize = { widthAsGridColumnsCount: 12, heightAsRatio: 50 };

export const createEmptyFluidLayoutBuilder = (): IDashboardViewLayoutBuilder<any> =>
    DashboardViewLayoutBuilder.forNewLayout();

export const createEmptyFluidLayoutRowBuilder = (): IDashboardViewLayoutRowBuilder<any> =>
    DashboardViewLayoutRowBuilder.for(createEmptyFluidLayoutBuilder().addRow(), 0);

export const createEmptyFluidLayoutColumnBuilder = (): IDashboardViewLayoutColumnBuilder<any> =>
    DashboardViewLayoutColumnBuilder.for(
        createEmptyFluidLayoutRowBuilder().addColumn(defaultColumnXlSize),
        0,
    );
