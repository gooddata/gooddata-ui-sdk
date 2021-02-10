// (C) 2019-2021 GoodData Corporation
import { FluidLayoutBuilder } from "../layout";
import { FluidLayoutRowBuilder } from "../row";
import { IFluidLayout, IFluidLayoutRow, IFluidLayoutSectionHeader } from "../../fluidLayout";
import {
    createEmptyFluidLayoutBuilder,
    createEmptyFluidLayoutRowBuilder,
    createValueOrUpdateCallbackTestCases,
    defaultColumnXlSize,
} from "./utils";

describe("FluidLayoutRowBuilder", () => {
    describe("constructors", () => {
        describe(".for()", () => {
            it("should use the correct row", () => {
                const row: IFluidLayoutRow<any> = { header: { title: "Correct row" }, columns: [] };
                const layout: IFluidLayout<any> = {
                    type: "fluidLayout",
                    rows: [row],
                };
                const layoutBuilder = FluidLayoutBuilder.for(layout);
                const rowBuilder = FluidLayoutRowBuilder.for(layoutBuilder, 0);
                expect(rowBuilder.build()).toBe(row);
            });

            it("should throw error, when the row is damaged", () => {
                const boom = () => {
                    const rowh: any = { haeder: "immutable.js!", columnz: [] };
                    const layoud: IFluidLayout<any> = {
                        type: "fluidLayout",
                        rows: [rowh],
                    };
                    const layoutBuilder = FluidLayoutBuilder.for(layoud);
                    FluidLayoutRowBuilder.for(layoutBuilder, 0);
                };

                expect(boom).toThrowErrorMatchingSnapshot();
            });
        });

        describe(".forNewRow()", () => {
            it("should create new empty row", () => {
                const layoutBuilder = createEmptyFluidLayoutBuilder();
                const row = FluidLayoutRowBuilder.forNewRow(layoutBuilder).build();
                expect(row).toMatchSnapshot();
            });
        });
    });

    describe(".header()", () => {
        const value: IFluidLayoutSectionHeader = { title: "Row title", description: "Row description" };
        const testCases = createValueOrUpdateCallbackTestCases(value);
        it.each(testCases)("should update header %s", (_, valueOrUpdateCallback) => {
            const rowBuilder = createEmptyFluidLayoutRowBuilder();
            const row = rowBuilder.header(valueOrUpdateCallback).build();

            expect(row).toMatchSnapshot();
        });
    });

    describe(".addColumn()", () => {
        it("should add a column to the end of the row by default", () => {
            const rowBuilder = createEmptyFluidLayoutRowBuilder().addColumn(defaultColumnXlSize);

            const rowBefore = rowBuilder.build();
            const rowAfter = rowBuilder
                .addColumn(defaultColumnXlSize, (c) => c.content("Added column"))
                .build();

            expect(rowBefore).toMatchSnapshot("before");
            expect(rowAfter).toMatchSnapshot("after");
        });

        it("should add a column to the provided index", () => {
            const rowBuilder = createEmptyFluidLayoutRowBuilder()
                .addColumn(defaultColumnXlSize)
                .addColumn(defaultColumnXlSize);

            const rowBefore = rowBuilder.build();
            const rowAfter = rowBuilder
                .addColumn(defaultColumnXlSize, (c) => c.content("Added column"), 1)
                .build();

            expect(rowBefore).toMatchSnapshot("before");
            expect(rowAfter).toMatchSnapshot("after");
        });
    });

    describe(".removeColumn()", () => {
        it("should remove the column from the row", () => {
            const rowIndex = 0;
            const columnIndex = 0;

            const layoutBuilder = createEmptyFluidLayoutBuilder().addRow(
                (row) =>
                    row.addColumn(defaultColumnXlSize, (c) => c.content("Column to remove"), columnIndex),
                rowIndex,
            );
            const rowBuilder = FluidLayoutRowBuilder.for(layoutBuilder, rowIndex);

            const rowBefore = rowBuilder.build();
            const rowAfter = rowBuilder.removeColumn(columnIndex).build();

            expect(rowBefore).toMatchSnapshot("before");
            expect(rowAfter).toMatchSnapshot("after");
        });

        it("should throw error, when the column at provided index does not exist", () => {
            const boom = () => {
                createEmptyFluidLayoutRowBuilder().removeColumn(0);
            };

            // Test it outside the catch block to make sure that even if no exception is thrown,
            // the test will make the assertion and fails correctly.
            expect(boom).toThrowErrorMatchingSnapshot();
        });
    });

    describe(".modifyColumn()", () => {
        it("should modify the column", () => {
            const columnIndex = 0;
            const rowBuilder = createEmptyFluidLayoutRowBuilder().addColumn(
                defaultColumnXlSize,
                (c) => c.content("Original column"),
                columnIndex,
            );

            const rowBefore = rowBuilder.build();
            const rowAfter = rowBuilder.modifyColumn(0, (c) => c.content("Modified column")).build();

            expect(rowBefore).toMatchSnapshot("before");
            expect(rowAfter).toMatchSnapshot("after");
        });

        it("should throw error, when the column at provided index does not exist", () => {
            const boom = () => {
                createEmptyFluidLayoutRowBuilder().modifyColumn(0, (c) => c.content("Should throw"));
            };

            expect(boom).toThrowErrorMatchingSnapshot();
        });
    });

    describe(".moveColumn()", () => {
        it("should move the column", () => {
            const rowBuilder = createEmptyFluidLayoutRowBuilder()
                .addColumn(defaultColumnXlSize, (c) => c.content("Column 0"))
                .addColumn(defaultColumnXlSize, (c) => c.content("Column 1"))
                .addColumn(defaultColumnXlSize, (c) => c.content("Column 2"));

            const rowBefore = rowBuilder.build();
            const rowAfter = rowBuilder.moveColumn(0, 1).build();

            expect(rowBefore).toMatchSnapshot("before");
            expect(rowAfter).toMatchSnapshot("after");
        });

        it("should throw error, when the column at provided index does not exist", () => {
            const boom = () => {
                createEmptyFluidLayoutRowBuilder().moveColumn(0, 1);
            };

            expect(boom).toThrowErrorMatchingSnapshot();
        });
    });

    describe(".removeColumns()", () => {
        it("should remove all columns by default", () => {
            const rowBuilder = createEmptyFluidLayoutRowBuilder()
                .addColumn(defaultColumnXlSize)
                .addColumn(defaultColumnXlSize);

            const rowBefore = rowBuilder.build();
            const rowAfter = rowBuilder.removeColumns().build();

            expect(rowBefore).toMatchSnapshot("before");
            expect(rowAfter).toMatchSnapshot("after");
        });

        it("should remove selected columns only", () => {
            const rowBuilder = createEmptyFluidLayoutRowBuilder()
                .addColumn(defaultColumnXlSize, (c) => c.content("Column to keep 1"))
                .addColumn(defaultColumnXlSize)
                .addColumn(defaultColumnXlSize, (c) => c.content("Column to keep 2"))
                .addColumn(defaultColumnXlSize);

            const rowBefore = rowBuilder.build();
            const rowAfter = rowBuilder
                .removeColumns((columns) => columns.filter((c) => !c.hasContent()))
                .build();

            expect(rowBefore).toMatchSnapshot("before");
            expect(rowAfter).toMatchSnapshot("after");
        });

        it("should remove selected column only", () => {
            const contentOfTheColumnToRemove = "Column to remove";
            const rowBuilder = createEmptyFluidLayoutRowBuilder()
                .addColumn(defaultColumnXlSize)
                .addColumn(defaultColumnXlSize, (r) => r.content(contentOfTheColumnToRemove))
                .addColumn(defaultColumnXlSize);

            const rowBefore = rowBuilder.build();
            const rowAfter = rowBuilder
                .removeColumns((columns) => columns.find((c) => c.contentEquals(contentOfTheColumnToRemove)))
                .build();

            expect(rowBefore).toMatchSnapshot("before");
            expect(rowAfter).toMatchSnapshot("after");
        });

        it("should not remove any column, when selection result is undefined", () => {
            const rowBuilder = createEmptyFluidLayoutRowBuilder().addColumn(defaultColumnXlSize);

            const rowBefore = rowBuilder.build();
            const rowAfter = rowBuilder
                .removeColumns((columns) => columns.find((c) => c.contentIs("Non-existing content")))
                .build();

            expect(rowBefore).toMatchSnapshot("before");
            expect(rowAfter).toMatchSnapshot("after");
        });
    });

    describe(".modifyColumns()", () => {
        it("should modify all columns by default", () => {
            const rowBuilder = createEmptyFluidLayoutRowBuilder()
                .addColumn(defaultColumnXlSize)
                .addColumn(defaultColumnXlSize);

            const rowBefore = rowBuilder.build();
            const rowAfter = rowBuilder
                .modifyColumns((c, f) => c.content(`Modified column ${f.index()}`))
                .build();

            expect(rowBefore).toMatchSnapshot("before");
            expect(rowAfter).toMatchSnapshot("after");
        });

        it("should modify selected columns only", () => {
            const rowBuilder = createEmptyFluidLayoutRowBuilder()
                .addColumn(defaultColumnXlSize, (c) => c.content("Original column"))
                .addColumn(defaultColumnXlSize)
                .addColumn(defaultColumnXlSize, (c) => c.content("Original column"))
                .addColumn(defaultColumnXlSize);

            const rowBefore = rowBuilder.build();
            const rowAfter = rowBuilder
                .modifyColumns(
                    (c, f) => c.content({ title: `Modified row ${f.index()}` }),
                    (columns) => columns.filter((c) => c.hasContent()),
                )
                .build();

            expect(rowBefore).toMatchSnapshot("before");
            expect(rowAfter).toMatchSnapshot("after");
        });

        it("should modify selected column only", () => {
            const contentOfTheColumnToModify = "Original column";
            const rowBuilder = createEmptyFluidLayoutRowBuilder()
                .addColumn(defaultColumnXlSize)
                .addColumn(defaultColumnXlSize, (c) => c.content(contentOfTheColumnToModify))
                .addColumn(defaultColumnXlSize);

            const rowBefore = rowBuilder.build();
            const rowAfter = rowBuilder
                .modifyColumns(
                    (c) => c.content("Modified column"),
                    (columns) => columns.find((c) => c.contentEquals(contentOfTheColumnToModify)),
                )
                .build();

            expect(rowBefore).toMatchSnapshot("before");
            expect(rowAfter).toMatchSnapshot("after");
        });

        it("should not modify any column, when selection result is undefined", () => {
            const rowBuilder = createEmptyFluidLayoutRowBuilder().addColumn(defaultColumnXlSize);

            const rowBefore = rowBuilder.build();
            const rowAfter = rowBuilder
                .modifyColumns(
                    (c) => c.content("That would never happen"),
                    (columns) => columns.find((c) => c.contentIs("Non-existing column content")),
                )
                .build();

            expect(rowBefore).toMatchSnapshot("before");
            expect(rowAfter).toMatchSnapshot("after");
        });
    });
});
