// (C) 2019-2021 GoodData Corporation
import {
    IFluidLayoutBuilderImpl,
    IFluidLayoutColumnBuilderImpl,
    IFluidLayoutRowBuilderImpl,
    ValueOrUpdateCallback,
} from "../interfaces";
import { IFluidLayoutSize } from "../../fluidLayout";
import { FluidLayoutBuilder } from "../layout";
import { FluidLayoutRowBuilder } from "../row";
import { FluidLayoutColumnBuilder } from "../column";

export const defaultColumnXlSize: IFluidLayoutSize = { widthAsGridColumnsCount: 12, heightAsRatio: 50 };

export const createValueOrUpdateCallbackTestCases = <TValue>(
    value: TValue,
): Array<[string, ValueOrUpdateCallback<TValue | undefined>]> => [
    ["by value", value],
    ["by callback", () => value],
    ["by undefined", undefined],
    ["by callback returning undefined", () => undefined],
];

export const createEmptyFluidLayoutBuilder = (): IFluidLayoutBuilderImpl<any> =>
    FluidLayoutBuilder.forNewLayout();

export const createEmptyFluidLayoutRowBuilder = (): IFluidLayoutRowBuilderImpl<any> =>
    FluidLayoutRowBuilder.for(createEmptyFluidLayoutBuilder().addRow(), 0);

export const createEmptyFluidLayoutColumnBuilder = (): IFluidLayoutColumnBuilderImpl<any> =>
    FluidLayoutColumnBuilder.for(createEmptyFluidLayoutRowBuilder().addColumn(defaultColumnXlSize), 0);
