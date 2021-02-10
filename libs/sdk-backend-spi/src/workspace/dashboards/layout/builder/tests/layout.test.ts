// (C) 2019-2021 GoodData Corporation
import { FluidLayoutBuilder } from "../layout";
import { IFluidLayout, IFluidLayoutSize } from "../../fluidLayout";
import { createEmptyFluidLayoutBuilder, createValueOrUpdateCallbackTestCases } from "./utils";

describe("FluidLayoutBuilder", () => {
    describe("constructors", () => {
        describe(".for()", () => {
            it("should use the provided layout", () => {
                const layout: IFluidLayout<any> = {
                    type: "fluidLayout",
                    rows: [{ columns: [] }],
                };

                expect(FluidLayoutBuilder.for(layout).build()).toBe(layout);
            });

            it("should throw error, when the layout is damaged", () => {
                const boom = () => {
                    const layoud: any = {
                        type: "yolo",
                        rowz: [{ columnz: [] }],
                    };

                    FluidLayoutBuilder.for(layoud);
                };

                expect(boom).toThrowErrorMatchingSnapshot();
            });
        });

        describe(".forNewLayout()", () => {
            it("should create new empty layout", () => {
                const layout = FluidLayoutBuilder.forNewLayout().build();
                expect(layout).toMatchSnapshot();
            });
        });
    });

    describe(".size()", () => {
        const value: IFluidLayoutSize = { widthAsGridColumnsCount: 12, heightAsRatio: 50 };
        const testCases = createValueOrUpdateCallbackTestCases(value);
        it.each(testCases)("should update size %s", (_, valueOrUpdateCallback) => {
            const layout = createEmptyFluidLayoutBuilder().size(valueOrUpdateCallback).build();
            expect(layout).toMatchSnapshot();
        });
    });

    describe(".addRow()", () => {
        it("should add a row to the end of the layout by default", () => {
            const layoutBuilder = createEmptyFluidLayoutBuilder().addRow();

            const layoutBefore = layoutBuilder.build();
            const layoutAfter = layoutBuilder.addRow((r) => r.header({ title: "Added row" })).build();

            expect(layoutBefore).toMatchSnapshot("before");
            expect(layoutAfter).toMatchSnapshot("after");
        });

        it("should add a row to the provided index", () => {
            const layoutBuilder = createEmptyFluidLayoutBuilder().addRow().addRow();

            const layoutBefore = layoutBuilder.build();
            const layoutAfter = layoutBuilder.addRow((r) => r.header({ title: "Added row" }), 1).build();

            expect(layoutBefore).toMatchSnapshot("before");
            expect(layoutAfter).toMatchSnapshot("after");
        });
    });

    describe(".removeRow()", () => {
        it("should remove the row from the layout", () => {
            const rowIndex = 0;
            const layoutBuilder = createEmptyFluidLayoutBuilder().addRow(
                (r) => r.header({ title: "Row to remove" }),
                rowIndex,
            );

            const layoutBefore = layoutBuilder.build();
            const layoutAfter = layoutBuilder.removeRow(rowIndex).build();

            expect(layoutBefore).toMatchSnapshot("before");
            expect(layoutAfter).toMatchSnapshot("after");
        });

        it("should throw error, when the row at provided index does not exist", () => {
            const boom = () => {
                createEmptyFluidLayoutBuilder().removeRow(0);
            };

            expect(boom).toThrowErrorMatchingSnapshot();
        });
    });

    describe(".modifyRow()", () => {
        it("should modify the row", () => {
            const layoutBuilder = createEmptyFluidLayoutBuilder().addRow((r) =>
                r.header({ title: "Original row" }),
            );

            const layoutBefore = layoutBuilder.build();
            const layoutAfter = layoutBuilder
                .modifyRow(0, (r) => r.header({ title: "Modified row" }))
                .build();

            expect(layoutBefore).toMatchSnapshot("before");
            expect(layoutAfter).toMatchSnapshot("after");
        });

        it("should throw error, when the row at provided index does not exist", () => {
            const boom = () => {
                createEmptyFluidLayoutBuilder().modifyRow(0, (r) => r.header({ title: "Should throw" }));
            };

            expect(boom).toThrowErrorMatchingSnapshot();
        });
    });

    describe(".moveRow()", () => {
        it("should move the row", () => {
            const layoutBuilder = createEmptyFluidLayoutBuilder()
                .addRow((r) => r.header({ title: "Row 0" }))
                .addRow((r) => r.header({ title: "Row 1" }))
                .addRow((r) => r.header({ title: "Row 2" }));

            const layoutBefore = layoutBuilder.build();
            const layoutAfter = layoutBuilder.moveRow(0, 1).build();

            expect(layoutBefore).toMatchSnapshot("before");
            expect(layoutAfter).toMatchSnapshot("after");
        });

        it("should throw error, when the row at provided index does not exist", () => {
            const boom = () => {
                createEmptyFluidLayoutBuilder().moveRow(0, 1);
            };
            expect(boom).toThrowErrorMatchingSnapshot();
        });
    });

    describe(".removeRows()", () => {
        it("should remove all rows by default", () => {
            const layoutBuilder = createEmptyFluidLayoutBuilder().addRow().addRow();

            const layoutBefore = layoutBuilder.build();
            const layoutAfter = layoutBuilder.removeRows().build();

            expect(layoutBefore).toMatchSnapshot("before");
            expect(layoutAfter).toMatchSnapshot("after");
        });

        it("should remove selected rows only", () => {
            const layoutBuilder = createEmptyFluidLayoutBuilder()
                .addRow((r) => r.header({ title: "Row to keep 1" }))
                .addRow()
                .addRow((r) => r.header({ title: "Row to keep 2" }))
                .addRow();

            const layoutBefore = layoutBuilder.build();
            const layoutAfter = layoutBuilder
                .removeRows((rows) => rows.filter((r) => !r.hasHeader()))
                .build();

            expect(layoutBefore).toMatchSnapshot("before");
            expect(layoutAfter).toMatchSnapshot("after");
        });

        it("should remove selected row only", () => {
            const titleOfTheRowToRemove = "Row to remove";
            const layoutBuilder = createEmptyFluidLayoutBuilder()
                .addRow()
                .addRow((r) => r.header({ title: titleOfTheRowToRemove }))
                .addRow();

            const layoutBefore = layoutBuilder.build();
            const layoutAfter = layoutBuilder
                .removeRows((rows) => rows.find((r) => r.titleEquals(titleOfTheRowToRemove)))
                .build();

            expect(layoutBefore).toMatchSnapshot("before");
            expect(layoutAfter).toMatchSnapshot("after");
        });

        it("should not remove any row, when selection result is undefined", () => {
            const layoutBuilder = createEmptyFluidLayoutBuilder().addRow();

            const layoutBefore = layoutBuilder.build();
            const layoutAfter = layoutBuilder
                .removeRows((rows) => rows.find((r) => r.titleEquals("Non-existing row title")))
                .build();

            expect(layoutBefore).toMatchSnapshot("before");
            expect(layoutAfter).toMatchSnapshot("after");
        });
    });

    describe(".modifyRows()", () => {
        it("should modify all rows by default", () => {
            const layoutBuilder = createEmptyFluidLayoutBuilder().addRow().addRow();

            const layoutBefore = layoutBuilder.build();
            const layoutAfter = layoutBuilder
                .modifyRows((r, f) => r.header({ title: `Modified row ${f.index()}` }))
                .build();

            expect(layoutBefore).toMatchSnapshot("before");
            expect(layoutAfter).toMatchSnapshot("after");
        });

        it("should modify selected rows only", () => {
            const layoutBuilder = createEmptyFluidLayoutBuilder()
                .addRow((r) => r.header({ title: "Original row" }))
                .addRow()
                .addRow((r) => r.header({ title: "Original row" }))
                .addRow();

            const layoutBefore = layoutBuilder.build();
            const layoutAfter = layoutBuilder
                .modifyRows(
                    (r, f) => r.header({ title: `Modified row ${f.index()}` }),
                    (rows) => rows.filter((r) => r.hasHeader()),
                )
                .build();

            expect(layoutBefore).toMatchSnapshot("before");
            expect(layoutAfter).toMatchSnapshot("after");
        });

        it("should modify selected row only", () => {
            const titleOfTheRowToModify = "Original row";
            const layoutBuilder = createEmptyFluidLayoutBuilder()
                .addRow()
                .addRow((r) => r.header({ title: titleOfTheRowToModify }))
                .addRow();

            const layoutBefore = layoutBuilder.build();
            const layoutAfter = layoutBuilder
                .modifyRows(
                    (r) => r.header({ title: "Modified row" }),
                    (rows) => rows.find((r) => r.titleEquals(titleOfTheRowToModify)),
                )
                .build();

            expect(layoutBefore).toMatchSnapshot("before");
            expect(layoutAfter).toMatchSnapshot("after");
        });

        it("should not modify any row, when selection result is undefined", () => {
            const layoutBuilder = createEmptyFluidLayoutBuilder().addRow();

            const layoutBefore = layoutBuilder.build();
            const layoutAfter = layoutBuilder
                .modifyRows(
                    (r) => r.header({ title: "That would never happen" }),
                    (rows) => rows.find((r) => r.titleEquals("Non-existing row title")),
                )
                .build();

            expect(layoutBefore).toMatchSnapshot("before");
            expect(layoutAfter).toMatchSnapshot("after");
        });
    });
});
