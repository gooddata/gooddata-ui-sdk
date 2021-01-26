// (C) 2007-2021 GoodData Corporation
import { IFluidLayoutSizeByScreen, IFluidLayout, IFluidLayoutColumn } from "@gooddata/sdk-backend-spi";

export type FluidLayoutRowMock<TContent> = {
    title?: string;
    description?: string;
    columns: Array<[TContent, IFluidLayoutSizeByScreen?]>;
};

export const fluidLayoutRowMock = <TContent>(
    columns: Array<[TContent, IFluidLayoutSizeByScreen?]>,
    title?: string,
    description?: string,
): FluidLayoutRowMock<TContent> => {
    return {
        columns,
        title,
        description,
    };
};

export const fluidLayoutMock = <TContent>(
    rowMocks: FluidLayoutRowMock<TContent>[],
): IFluidLayout<TContent> => {
    const emptyLayout: IFluidLayout<TContent> = {
        type: "fluidLayout",
        rows: [],
    };

    return rowMocks.reduce((acc: IFluidLayout<TContent>, rowMock, rowIndex) => {
        if (!acc.rows[rowIndex]) {
            acc.rows[rowIndex] = {
                columns: [],
                ...(rowMock.title || rowMock.description
                    ? {
                          header: {
                              title: rowMock.title,
                              description: rowMock.description,
                          },
                      }
                    : {}),
            };
        }

        return rowMock.columns.reduce(
            (
                acc2: IFluidLayout<TContent>,
                [content, size = { xl: { widthAsGridColumnsCount: 12 } }],
                columnIndex,
            ) => {
                const column: IFluidLayoutColumn<TContent> = {
                    size,
                    content,
                };
                acc2.rows[rowIndex].columns[columnIndex] = column;
                return acc2;
            },
            acc,
        );
    }, emptyLayout);
};
