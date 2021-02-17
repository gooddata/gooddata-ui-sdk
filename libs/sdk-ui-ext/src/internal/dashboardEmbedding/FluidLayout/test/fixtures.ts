// (C) 2019-2021 GoodData Corporation
import {
    IFluidLayoutRow,
    IFluidLayoutColumn,
    IFluidLayout,
    IFluidLayoutColumnFacade,
    IFluidLayoutRowFacade,
} from "@gooddata/sdk-backend-spi";
import {
    IFluidLayoutColumnRenderer,
    IFluidLayoutContentRenderer,
    IFluidLayoutRowRenderer,
} from "../interfaces";
import { fluidLayoutMock, fluidLayoutRowMock } from "../mocks";

export type TextLayoutContent = string;
export type TextLayoutColumn = IFluidLayoutColumn<TextLayoutContent>;
export type TextLayoutRow = IFluidLayoutRow<TextLayoutContent>;
export type TextLayout = IFluidLayout<TextLayoutContent>;

export type TextLayoutColumnRenderer = IFluidLayoutColumnRenderer<
    TextLayoutContent,
    TextLayoutColumn,
    IFluidLayoutColumnFacade<TextLayoutContent, TextLayoutColumn>
>;
export type TextLayoutContentRenderer = IFluidLayoutContentRenderer<
    TextLayoutContent,
    TextLayoutColumn,
    IFluidLayoutColumnFacade<TextLayoutContent, TextLayoutColumn>
>;
export type TextLayoutRowRenderer = IFluidLayoutRowRenderer<
    TextLayoutContent,
    TextLayoutRow,
    IFluidLayoutRowFacade<TextLayoutContent, TextLayoutRow>
>;

export const createArrayWithSize = (size: number): any[] => Array.from(new Array(size));

export const fluidLayoutWithOneColumn = fluidLayoutMock([fluidLayoutRowMock([["Test"]])]);

export const createFluidLayoutMock = (columnsCountInRow: number[]): TextLayout =>
    fluidLayoutMock(
        columnsCountInRow.map((columnsCount) =>
            fluidLayoutRowMock(createArrayWithSize(columnsCount).map(() => ["Test"])),
        ),
    );
