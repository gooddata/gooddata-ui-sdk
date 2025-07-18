// (C) 2007-2025 GoodData Corporation
import { ReactElement } from "react";
import { render } from "@testing-library/react";
import identity from "lodash/identity.js";

import { getCellClassNames, getMeasureCellFormattedValue, getMeasureCellStyle } from "../cellUtils.js";
import { createCellRenderer } from "../cellRenderer.js";
import { describe, it, expect } from "vitest";
import { createTestTableFacade } from "../../tests/tableFacade.fixture.js";
import { SingleMeasureWithRowAndColumnAttributes } from "../../structure/tests/table.fixture.js";
import { ThemeProvider } from "@gooddata/sdk-ui-theme-provider";
import { ITheme } from "@gooddata/sdk-model";
import { ICellRendererParams } from "ag-grid-community";

async function createTestRenderer() {
    const [TestFacade] = await createTestTableFacade(SingleMeasureWithRowAndColumnAttributes);
    return createCellRenderer(TestFacade.tableDescriptor);
}

const mountWithTheme = (
    theme: ITheme,
    params: ICellRendererParams,
    CellRenderer: (params: ICellRendererParams) => ReactElement,
) =>
    render(
        <ThemeProvider theme={theme}>
            <CellRenderer {...params} />
        </ThemeProvider>,
    );

describe("cellRenderer", () => {
    it("should show LoadingComponent for empty cell", async () => {
        const CellRenderer = await createTestRenderer();
        const props: ICellRendererParams = {
            node: {},
            value: 123,
            formatValue: identity,
            colDef: {
                colId: "r_0",
                type: "ROW_ATTRIBUTE_COLUMN",
            },
        } as any;
        render(<CellRenderer {...props} />);
        expect(document.querySelector(".s-loading")).toBeInTheDocument();
    });

    it("should escape value", async () => {
        const fakeParams: any = {
            formatValue: identity,
            value: "<button>xss</button>",
            node: {
                id: "01",
                rowPinned: false,
            },
            colDef: {
                colId: "r_0",
                type: "ROW_ATTRIBUTE_COLUMN",
            },
        };
        const CellRenderer = await createTestRenderer();

        const { container } = render(<CellRenderer {...fakeParams} />);

        expect(container).toMatchSnapshot();
    });

    describe("'LoadingComponent' color property", () => {
        const props: ICellRendererParams = {
            node: {},
            value: 123,
            formatValue: identity,
            colDef: {
                colId: "r_0",
                type: "ROW_ATTRIBUTE_COLUMN",
            },
        } as any;

        it("should set the color specifically defined in theme", async () => {
            const CellRenderer = await createTestRenderer();
            const theme: ITheme = {
                table: {
                    loadingIconColor: "#f00",
                },
            };

            const { container } = mountWithTheme(theme, props, CellRenderer);
            expect(container.querySelector("g")).toHaveStyle("fill: #f00");
        });

        it("should set the color from the complementary palette defined in theme", async () => {
            const CellRenderer = await createTestRenderer();
            const theme: ITheme = {
                palette: {
                    complementary: {
                        c0: "#000",
                        c6: "#0f0",
                        c9: "#fff",
                    },
                },
            };

            const { container } = mountWithTheme(theme, props, CellRenderer);
            expect(container.querySelector("g")).toHaveStyle("fill: #0f0");
        });
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
                color: "var(--gd-table-nullValueColor, var(--gd-palette-complementary-6, #94a1ad))",
                fontWeight: "bold",
                textAlign: "right",
            });
        });

        it("should get just alignment style when cellContent=''", () => {
            expect(getMeasureCellStyle("", "[red]$#,##0.00", undefined, true)).toEqual({
                textAlign: "right",
            });
        });

        it("should get style for number with color in format when applyColor=true", () => {
            expect(getMeasureCellStyle("123456789", "[red]$#,##0.00", undefined, true).color).toEqual(
                "#ff0000",
            );
        });

        it("should get style for number with backgroundColor in format when applyColor=true", () => {
            expect(
                getMeasureCellStyle("123456789", "[backgroundColor=ffff00]$#,##0.00", undefined, true)
                    .backgroundColor,
            ).toEqual("#ffff00");
        });

        it("should get style for number with color and backgroundColor in format when applyColor=true", () => {
            expect(
                getMeasureCellStyle("123456789", "[backgroundColor=ffff00][red]$#,##0.00", undefined, true),
            ).toMatchObject({
                backgroundColor: "#ffff00",
                color: "#ff0000",
            });
        });

        it("should NOT get style for number with color in format when applyColor=false", () => {
            expect(
                getMeasureCellStyle("123456789", "[red]$#,##0.00", undefined, false).color,
            ).toBeUndefined();
        });

        it("should NOT get style for number with backgroundColor in format when applyColor=false", () => {
            expect(
                getMeasureCellStyle("123456789", "[backgroundColor=ffff00]$#,##0.00", undefined, false)
                    .backgroundColor,
            ).toBeUndefined();
        });

        it("should NOT get style for number without color or backgroundColor in format when applyColor=true", () => {
            const style = getMeasureCellStyle("123456789", "$#,##0.00", undefined, true);
            expect(style.color).toBeUndefined();
            expect(style.backgroundColor).toBeUndefined();
        });
    });
});
