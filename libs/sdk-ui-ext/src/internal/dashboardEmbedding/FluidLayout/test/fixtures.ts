// (C) 2019-2020 GoodData Corporation
import { IFluidLayoutRow, IFluidLayoutColumn, IFluidLayout } from "@gooddata/sdk-backend-spi";
import {
    IFluidLayoutColumnRenderer,
    IFluidLayoutContentRenderer,
    IFluidLayoutRowRenderer,
} from "../interfaces";

export type TextLayoutContent = string;
export type TextLayoutColumn = IFluidLayoutColumn<TextLayoutContent>;
export type TextLayoutRow = IFluidLayoutRow<TextLayoutContent, TextLayoutColumn>;
export type TextLayout = IFluidLayout<TextLayoutContent, TextLayoutColumn, TextLayoutRow>;

export type TextLayoutColumnRenderer = IFluidLayoutColumnRenderer<
    TextLayoutContent,
    TextLayoutColumn,
    TextLayoutRow
>;
export type TextLayoutContentRenderer = IFluidLayoutContentRenderer<
    TextLayoutContent,
    TextLayoutColumn,
    TextLayoutRow
>;
export type TextLayoutRowRenderer = IFluidLayoutRowRenderer<
    TextLayoutContent,
    TextLayoutColumn,
    TextLayoutRow
>;

export const layoutColumn: TextLayoutColumn = {
    content: "Test",
    size: {
        xl: {
            widthAsGridColumnsCount: 12,
        },
    },
};

export const createArrayWithSize = (size: number): any[] => Array.from(new Array(size));

export const createLayoutRowWithNColumns = (columnsCount: number): TextLayoutRow => ({
    columns: createArrayWithSize(columnsCount).map(() => layoutColumn),
});

export const layoutRowWithOneColumn = createLayoutRowWithNColumns(1);

export const createLayout = (columnsCountInRow: number[]): TextLayout =>
    columnsCountInRow.reduce(
        (acc, columnsCount) => {
            return {
                ...acc,
                rows: [...acc.rows, createLayoutRowWithNColumns(columnsCount)],
            };
        },
        {
            rows: [],
        } as TextLayout,
    );
