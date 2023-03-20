// (C) 2019-2023 GoodData Corporation
import { render, screen } from "@testing-library/react";
import React from "react";
import { createLoadingRenderer } from "../loadingRenderer";
import { ICellRendererParams } from "@ag-grid-community/all-modules";
import noop from "lodash/noop";
import { SingleMeasureWithRowAndColumnAttributes } from "../../structure/tests/table.fixture";
import { createTestTableFacade } from "../../tests/tableFacade.fixture";
import { ThemeProvider } from "@gooddata/sdk-ui-theme-provider";
import { ITheme } from "@gooddata/sdk-model";

async function createTestRenderer() {
    const [TestFacade, TestProps] = await createTestTableFacade(SingleMeasureWithRowAndColumnAttributes);

    return createLoadingRenderer(TestFacade, TestProps);
}

describe("RowLoadingElement", () => {
    it("should show LoadingComponent for empty cell", async () => {
        const LoadingRenderer = await createTestRenderer();
        const props: ICellRendererParams = {
            node: {},
            value: 123,
            valueFormatted: noop,
        } as any;
        render(<LoadingRenderer {...props} />);
        expect(document.querySelector(".s-loading")).toBeInTheDocument();
    });

    it("should show formatted value for existing data", async () => {
        const LoadingRenderer = await createTestRenderer();
        const props: ICellRendererParams = {
            node: { id: 1 },
            value: Math.PI,
            formatValue: (value: number) => value.toFixed(2),
        } as any;
        render(<LoadingRenderer {...props} />);
        expect(screen.getByText("3.14")).toBeInTheDocument();
    });

    describe("'LoadingComponent' color property", () => {
        const props: ICellRendererParams = {
            node: {},
            value: 123,
            valueFormatted: noop,
        } as any;

        const mountWithTheme = (
            theme: ITheme,
            LoadingRenderer: (params: ICellRendererParams) => JSX.Element,
        ) =>
            render(
                <ThemeProvider theme={theme}>
                    <LoadingRenderer {...props} />
                </ThemeProvider>,
            );

        it("should set the color specifically defined in theme", async () => {
            const LoadingRenderer = await createTestRenderer();
            const theme: ITheme = {
                table: {
                    loadingIconColor: "#f00",
                },
            };

            const { container } = mountWithTheme(theme, LoadingRenderer);
            expect(container.querySelector("g")).toHaveStyle("fill: #f00");
        });

        it("should set the color from the complementary palette defined in theme", async () => {
            const LoadingRenderer = await createTestRenderer();
            const theme: ITheme = {
                palette: {
                    complementary: {
                        c0: "#000",
                        c6: "#0f0",
                        c9: "#fff",
                    },
                },
            };

            const { container } = mountWithTheme(theme, LoadingRenderer);
            expect(container.querySelector("g")).toHaveStyle("fill: #0f0");
        });
    });
});
