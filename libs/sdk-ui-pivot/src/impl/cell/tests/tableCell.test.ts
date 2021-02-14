// (C) 2007-2021 GoodData Corporation
import { getCellClassNames, getMeasureCellFormattedValue, getMeasureCellStyle } from "../cellUtils";
import { identity } from "lodash";
import { createCellRenderer } from "../cellRenderer";

describe("cellRenderer", () => {
    it("should escape value", () => {
        const fakeParams: any = {
            formatValue: identity,
            value: "<button>xss</button>",
            node: {
                rowPinned: false,
            },
        };

        const value = createCellRenderer()(fakeParams);

        expect(value).toEqual('<span class="s-value">&lt;button&gt;xss&lt;/button&gt;</span>');
    });
});

describe("Table utils - Cell", () => {
    describe("getCellClassNames", () => {
        it("should get class names for non drillable cell", () => {
            expect(getCellClassNames(3, 9, false)).toEqual("gd-cell s-cell-3-9 s-table-cell");
        });

        it("should get class names for drillable cell", () => {
            expect(getCellClassNames(3, 9, true)).toEqual(
                "gd-cell-drillable gd-cell s-cell-3-9 s-table-cell",
            );
        });
    });

    describe("getMeasureCellFormattedValue", () => {
        it("should get '-' when cellContent=null", () => {
            expect(getMeasureCellFormattedValue(null, "[red]$#,##0.00", undefined)).toEqual("–");
        });

        it("should NOT get 'NaN' when cellContent=''", () => {
            expect(getMeasureCellFormattedValue("", "[red]$#,##0.00", undefined)).toEqual("NaN");
        });

        it("should get formatted value for number", () => {
            expect(
                getMeasureCellFormattedValue("123456789", "[red]$#,##0.00", { thousand: ".", decimal: "," }),
            ).toEqual("$123.456.789,00");
        });
    });

    describe("getMeasureCellStyle", () => {
        it("should get empty value style when cellContent=null", () => {
            expect(getMeasureCellStyle(null, "[red]$#,##0.00", undefined, true)).toEqual({
                color: "#94a1ad",
                fontWeight: "bold",
            });
        });

        it("should NOT get style when cellContent=''", () => {
            expect(getMeasureCellStyle("", "[red]$#,##0.00", undefined, true)).toEqual({});
        });

        it("should get style for number with color in format when applyColor=true", () => {
            expect(getMeasureCellStyle("123456789", "[red]$#,##0.00", undefined, true)).toEqual({
                color: "#FF0000",
            });
        });

        it("should get style for number with backgroundColor in format when applyColor=true", () => {
            expect(
                getMeasureCellStyle("123456789", "[backgroundColor=ffff00]$#,##0.00", undefined, true),
            ).toEqual({
                backgroundColor: "#ffff00",
            });
        });

        it("should get style for number with color and backgroundColor in format when applyColor=true", () => {
            expect(
                getMeasureCellStyle("123456789", "[backgroundColor=ffff00][red]$#,##0.00", undefined, true),
            ).toEqual({
                backgroundColor: "#ffff00",
                color: "#FF0000",
            });
        });

        it("should NOT get style for number with color in format when applyColor=false", () => {
            expect(getMeasureCellStyle("123456789", "[red]$#,##0.00", undefined, false)).toEqual({});
        });

        it("should NOT get style for number with backgroundColor in format when applyColor=false", () => {
            expect(
                getMeasureCellStyle("123456789", "[backgroundColor=ffff00]$#,##0.00", undefined, false),
            ).toEqual({});
        });

        it("should NOT get style for number without color or backgroundColor in format when applyColor=true", () => {
            expect(getMeasureCellStyle("123456789", "$#,##0.00", undefined, true)).toEqual({});
        });
    });
});
