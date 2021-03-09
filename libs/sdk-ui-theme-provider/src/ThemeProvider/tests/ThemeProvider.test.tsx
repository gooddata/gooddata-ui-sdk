// (C) 2020 GoodData Corporation
import React from "react";
import { act } from "react-dom/test-utils";
import { mount, ReactWrapper } from "enzyme";
import { recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { ITheme } from "@gooddata/sdk-backend-spi";
import { WorkspaceProvider, BackendProvider } from "@gooddata/sdk-ui";
import cloneDeep from "lodash/cloneDeep";

import { isDarkTheme, prepareBaseColors, ThemeModifier, ThemeProvider } from "../ThemeProvider";
import { IThemeContextProviderProps, withTheme } from "../Context";

const renderComponent = async (component: React.ReactElement) => {
    let wrappedComponent: ReactWrapper;
    await act(async () => {
        wrappedComponent = mount(component);
    });
    wrappedComponent.update();
    return wrappedComponent;
};

describe("ThemeProvider", () => {
    const workspace = "testWorkspace";
    const theme: ITheme = {
        button: {
            dropShadow: false,
        },
    };
    const backend = recordedBackend(ReferenceRecordings.Recordings, { theme });

    it("should load the theme and set the properties (backend and workspace is provided through context)", async () => {
        await renderComponent(
            <BackendProvider backend={backend}>
                <WorkspaceProvider workspace={workspace}>
                    <ThemeProvider>
                        <div>Test</div>
                    </ThemeProvider>
                </WorkspaceProvider>
            </BackendProvider>,
        );

        expect(document.getElementById("gdc-theme-properties").innerHTML).toEqual(`
            :root {
                --gd-button-dropShadow: none;
            }
        `);
    });

    it("should load the theme and set the properties (backend and workspace is provided through props)", async () => {
        await renderComponent(
            <ThemeProvider backend={backend} workspace={workspace}>
                <div>Test</div>
            </ThemeProvider>,
        );

        expect(document.getElementById("gdc-theme-properties").innerHTML).toEqual(`
            :root {
                --gd-button-dropShadow: none;
            }
        `);
    });

    it("should not load the theme and use custom theme from prop instead", async () => {
        const customTheme: ITheme = {
            button: {
                borderRadius: "15",
            },
        };
        await renderComponent(
            <ThemeProvider theme={customTheme} backend={backend} workspace={workspace}>
                <div>Test</div>
            </ThemeProvider>,
        );

        expect(document.getElementById("gdc-theme-properties").innerHTML).toEqual(`
            :root {
                --gd-button-borderRadius: 15px;
            }
        `);
    });

    it("should use theme modifier if provided after load", async () => {
        const themeModifier: ThemeModifier = (theme: ITheme): ITheme => {
            if (theme?.button?.dropShadow === false) {
                const modifiedTheme = cloneDeep(theme);
                modifiedTheme.button = {
                    borderRadius: "15px",
                };
                return modifiedTheme;
            }
            return theme;
        };
        await renderComponent(
            <ThemeProvider modifier={themeModifier} backend={backend} workspace={workspace}>
                <div>Test</div>
            </ThemeProvider>,
        );

        expect(document.getElementById("gdc-theme-properties").innerHTML).toEqual(`
            :root {
                --gd-button-borderRadius: 15px;
            }
        `);
    });

    it("should not load the theme and not set the properties if backend is missing", async () => {
        await renderComponent(
            <ThemeProvider workspace={workspace}>
                <div>Test</div>
            </ThemeProvider>,
        );

        expect(document.getElementById("gdc-theme-properties")).toEqual(null);
    });

    it("should not load the theme and not set the properties if workspace is missing", async () => {
        await renderComponent(
            <ThemeProvider backend={backend}>
                <div>Test</div>
            </ThemeProvider>,
        );

        expect(document.getElementById("gdc-theme-properties")).toEqual(null);
    });

    it("should remove properties if workspace is changed to undefined", async () => {
        const component = await renderComponent(
            <ThemeProvider backend={backend} workspace={workspace}>
                <div>Test</div>
            </ThemeProvider>,
        );

        expect(document.getElementById("gdc-theme-properties").innerHTML).toEqual(`
            :root {
                --gd-button-dropShadow: none;
            }
        `);

        component.update();
        component.setProps({ workspace: undefined });

        expect(document.getElementById("gdc-theme-properties")).toEqual(null);
    });

    it("should pass theme object and themeIsLoading flag to context", async () => {
        const TestComponent: React.FC<IThemeContextProviderProps> = () => <div>Test component</div>;
        const TestComponentWithTheme = withTheme(TestComponent);
        const component = await renderComponent(
            <ThemeProvider backend={backend} workspace={workspace}>
                <TestComponentWithTheme />
            </ThemeProvider>,
        );

        expect(component.find(TestComponent).props()).toEqual({ themeIsLoading: false, theme });
    });

    it("should pass themeIsLoading flag set to false if backend is missing", async () => {
        const TestComponent: React.FC<IThemeContextProviderProps> = () => <div>Test component</div>;
        const TestComponentWithTheme = withTheme(TestComponent);
        const component = await renderComponent(
            <ThemeProvider workspace={workspace}>
                <TestComponentWithTheme />
            </ThemeProvider>,
        );

        expect(component.find(TestComponent).props().themeIsLoading).toEqual(false);
    });

    it("should pass themeIsLoading flag set to false if workspace is missing", async () => {
        const TestComponent: React.FC<IThemeContextProviderProps> = () => <div>Test component</div>;
        const TestComponentWithTheme = withTheme(TestComponent);
        const component = await renderComponent(
            <ThemeProvider backend={backend}>
                <TestComponentWithTheme />
            </ThemeProvider>,
        );

        expect(component.find(TestComponent).props().themeIsLoading).toEqual(false);
    });

    it("should use the theme from props if provided and not load anything", async () => {
        const themeFromProps: ITheme = {
            modal: {
                dropShadow: false,
            },
        };

        await renderComponent(
            <ThemeProvider theme={themeFromProps}>
                <div>Test</div>
            </ThemeProvider>,
        );

        expect(document.getElementById("gdc-theme-properties").innerHTML).toEqual(`
            :root {
                --gd-modal-dropShadow: none;
            }
        `);
    });
});

describe("isDarkTheme", () => {
    it("should return false when the theme has no complementary palette", () => {
        const theme: ITheme = {};

        expect(isDarkTheme(theme)).toEqual(false);
    });

    it("should return false when the theme has a light-based complementary palette", () => {
        const theme: ITheme = { palette: { complementary: { c0: "#fff", c9: "#000" } } };

        expect(isDarkTheme(theme)).toEqual(false);
    });

    it("should return true when the theme has a dark-based complementary palette", () => {
        const theme: ITheme = { palette: { complementary: { c0: "#000", c9: "#fff" } } };

        expect(isDarkTheme(theme)).toEqual(true);
    });
});

describe("prepareBaseColors", () => {
    it("should fill the base colors if complementary palette is provided, but base colors are missing", () => {
        const theme: ITheme = {
            palette: {
                error: { base: "#f00", contrast: "#0ff" },
                complementary: { c0: "#fff", c9: "#000" },
            },
        };

        const expectedTheme: ITheme = {
            palette: {
                primary: { base: "#14b2e2" },
                warning: { base: "#fada23" },
                success: { base: "#00c18d" },
                error: { base: "#f00", contrast: "#0ff" },
                complementary: { c0: "#fff", c9: "#000" },
            },
        };

        expect(prepareBaseColors(theme)).toEqual(expectedTheme);
    });
});
