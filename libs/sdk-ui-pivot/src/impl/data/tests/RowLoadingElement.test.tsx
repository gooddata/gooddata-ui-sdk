// (C) 2019-2021 GoodData Corporation
import { shallow, mount } from "enzyme";
import React from "react";
import { LoadingComponent } from "@gooddata/sdk-ui";
import { RowLoadingElement } from "../RowLoadingElement";
import { ICellRendererParams } from "@ag-grid-community/all-modules";
import noop from "lodash/noop";
import { ThemeProvider } from "@gooddata/sdk-ui-theme-provider";
import { ITheme } from "@gooddata/sdk-backend-spi";

describe("RowLoadingElement", () => {
    it("should show LoadingComponent for empty cell", async () => {
        const props: ICellRendererParams = {
            node: {},
            value: 123,
            valueFormatted: noop,
        } as any;
        const wrapper = shallow(<RowLoadingElement {...props} />);
        expect(wrapper.find(LoadingComponent)).toHaveLength(1);
    });

    it("should show formatted value for existing data", async () => {
        const props: ICellRendererParams = {
            node: { id: 1 },
            value: Math.PI,
            formatValue: (value: number) => value.toFixed(2),
        } as any;
        const wrapper = shallow(<RowLoadingElement {...props} />);
        expect(wrapper.html()).toEqual('<span class="s-value s-loading-done">3.14</span>');
    });

    describe("'LoadingComponent' color property", () => {
        const props: ICellRendererParams = {
            node: {},
            value: 123,
            valueFormatted: noop,
        } as any;

        const mountWithTheme = (theme: ITheme) =>
            mount(
                <ThemeProvider theme={theme}>
                    <RowLoadingElement {...props} />
                </ThemeProvider>,
            );

        it("should set the color specificaly defined in theme", () => {
            const theme: ITheme = {
                table: {
                    loadingIconColor: "#f00",
                },
            };

            const wrapper = mountWithTheme(theme);
            expect(wrapper.find(LoadingComponent).props().color).toEqual("#f00");
        });

        it("should set the color from the complementary palette defined in theme", () => {
            const theme: ITheme = {
                palette: {
                    complementary: {
                        c0: "#000",
                        c6: "#0f0",
                        c9: "#fff",
                    },
                },
            };

            const wrapper = mountWithTheme(theme);
            expect(wrapper.find(LoadingComponent).props().color).toEqual("#0f0");
        });
    });
});
