// (C) 2019-2021 GoodData Corporation
import { FluidLayoutColumnBuilder } from "../column";
import { ValueOrUpdateCallback } from "../interfaces";
import {
    IFluidLayout,
    IFluidLayoutColumn,
    IFluidLayoutRow,
    IFluidLayoutSize,
    IFluidLayoutSizeByScreen,
} from "../../fluidLayout";
import {
    createValueOrUpdateCallbackTestCases,
    createEmptyFluidLayoutRowBuilder,
    createEmptyFluidLayoutColumnBuilder,
} from "./utils";
import { FluidLayoutBuilder } from "../layout";
import { FluidLayoutRowBuilder } from "../row";

const defaultColumnXlSize: IFluidLayoutSize = { widthAsGridColumnsCount: 12, heightAsRatio: 50 };

describe("FluidLayoutColumnBuilder", () => {
    describe("constructors", () => {
        describe(".for()", () => {
            it("should use the provided column", () => {
                const column: IFluidLayoutColumn<any> = {
                    content: "Correct column",
                    size: {
                        xl: defaultColumnXlSize,
                    },
                };
                const row: IFluidLayoutRow<any> = { columns: [column] };
                const layout: IFluidLayout<any> = {
                    type: "fluidLayout",
                    rows: [row],
                };
                const layoutBuilder = FluidLayoutBuilder.for(layout);
                const rowBuilder = FluidLayoutRowBuilder.for(layoutBuilder, 0);
                const columnBuilder = FluidLayoutColumnBuilder.for(rowBuilder, 0);

                expect(columnBuilder.build()).toBe(column);
            });

            it("should throw error, when the column is damaged", () => {
                const boom = () => {
                    const colunm: any = {
                        sizzle: {
                            xxxxxl: "Yo column is so fat that when it renders, it breaks your screen 🖥️🔨",
                        },
                    };
                    const rowh: IFluidLayoutRow<any> = { columns: [colunm] };
                    const layoud: IFluidLayout<any> = {
                        type: "fluidLayout",
                        rows: [rowh],
                    };
                    const layoutBuilder = FluidLayoutBuilder.for(layoud);
                    const rowBuilder = FluidLayoutRowBuilder.for(layoutBuilder, 0);
                    FluidLayoutColumnBuilder.for(rowBuilder, 0);
                };

                expect(boom).toThrowErrorMatchingSnapshot();
            });
        });

        describe(".forNewColumn()", () => {
            it("should create new empty column", () => {
                const rowBuilder = createEmptyFluidLayoutRowBuilder();
                const column = FluidLayoutColumnBuilder.forNewColumn(rowBuilder, defaultColumnXlSize).build();
                expect(column).toMatchSnapshot();
            });
        });
    });

    describe(".content()", () => {
        const value = "Content";
        const testCases = createValueOrUpdateCallbackTestCases(value);
        it.each(testCases)("should update content %s", (_, valueOrUpdateCallback) => {
            const fluidLayoutColumn = createEmptyFluidLayoutColumnBuilder()
                .content(valueOrUpdateCallback)
                .build();

            expect(fluidLayoutColumn).toMatchSnapshot();
        });
    });

    describe(".size()", () => {
        const value: IFluidLayoutSizeByScreen = { xl: { widthAsGridColumnsCount: 6, heightAsRatio: 150 } };
        const testCases: Array<[string, ValueOrUpdateCallback<IFluidLayoutSizeByScreen>]> = [
            ["by value", value],
            ["by callback", () => value],
        ];
        it.each(testCases)("should update size %s", (_, valueOrUpdateCallback) => {
            const fluidLayoutColumn = createEmptyFluidLayoutColumnBuilder()
                .size(valueOrUpdateCallback)
                .build();

            expect(fluidLayoutColumn).toMatchSnapshot();
        });
    });
});
