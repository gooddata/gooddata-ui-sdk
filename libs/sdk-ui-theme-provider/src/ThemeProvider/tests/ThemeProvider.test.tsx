// (C) 2020-2022 GoodData Corporation
import React from "react";
import { act } from "react-dom/test-utils";
import { mount, ReactWrapper } from "enzyme";
import { recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { ITheme } from "@gooddata/sdk-model";
import { WorkspaceProvider, BackendProvider } from "@gooddata/sdk-ui";
import cloneDeep from "lodash/cloneDeep";

import { isDarkTheme, ThemeModifier, ThemeProvider } from "../ThemeProvider";
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
    beforeEach(() => {
        // Remove global theme styles manually before each test,
        // so we don't need to call component.unmount() in every test
        // to remove them.
        document.getElementById("gdc-theme-properties")?.remove();
    });

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

        expect(document.getElementById("gdc-theme-properties").innerHTML.length > 0).toEqual(true);
    });

    it("should load the theme and set the properties (backend and workspace is provided through props)", async () => {
        await renderComponent(
            <ThemeProvider backend={backend} workspace={workspace}>
                <div>Test</div>
            </ThemeProvider>,
        );

        expect(document.getElementById("gdc-theme-properties").innerHTML.length > 0).toEqual(true);
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

        expect(
            document
                .getElementById("gdc-theme-properties")
                .innerHTML.indexOf("--gd-button-borderRadius: 15px;") > -1,
        ).toEqual(true);
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

        expect(
            document
                .getElementById("gdc-theme-properties")
                .innerHTML.indexOf("--gd-button-borderRadius: 15px;") > -1,
        ).toEqual(true);
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

        expect(document.getElementById("gdc-theme-properties").innerHTML.length > 0).toEqual(true);

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

        expect(
            document
                .getElementById("gdc-theme-properties")
                .innerHTML.indexOf("--gd-modal-dropShadow: none;") > -1,
        ).toEqual(true);
    });

    it("should use theme from props and contain complete complementary palette", async () => {
        const theme: ITheme = { palette: { complementary: { c0: "#000", c9: "#fff" } } };

        const expectedTheme: ITheme = {
            palette: {
                error: {
                    base: "#e54d42",
                },
                primary: {
                    base: "#14b2e2",
                },
                success: {
                    base: "#00c18d",
                },
                warning: {
                    base: "#fada23",
                },
                complementary: {
                    c0: "#000",
                    c1: "#1c1c1c",
                    c2: "#383838",
                    c3: "#555",
                    c4: "#717171",
                    c5: "#8d8d8d",
                    c6: "#aaa",
                    c7: "#c6c6c6",
                    c8: "#e2e2e2",
                    c9: "#fff",
                },
            },
        };

        const TestComponent: React.FC<IThemeContextProviderProps> = () => <div>Test component</div>;
        const TestComponentWithTheme = withTheme(TestComponent);
        const component = await renderComponent(
            <ThemeProvider theme={theme}>
                <TestComponentWithTheme />
            </ThemeProvider>,
        );

        Object.values(expectedTheme.palette.complementary).forEach((color, index) => {
            expect(
                document
                    .getElementById("gdc-theme-properties")
                    .innerHTML.indexOf(`--gd-palette-complementary-${index}: ${color};`) > -1,
            ).toEqual(true);
        });
        expect(component.find(TestComponent).props()).toEqual({
            themeIsLoading: false,
            theme: expectedTheme,
        });
    });

    it("should not remove global theme styles on unmount when removeGlobalStylesOnUnmout is set to false", async () => {
        const component = await renderComponent(
            <ThemeProvider
                workspace={workspace}
                backend={backend}
                theme={theme}
                removeGlobalStylesOnUnmout={false}
            >
                <div>Test</div>
            </ThemeProvider>,
        );

        component.unmount();
        expect(document.getElementById("gdc-theme-properties").innerHTML.length > 0).toEqual(true);
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

describe("color-scheme css property", () => {
    it("should be set to 'light' when the theme has no complementary palette", async () => {
        await renderComponent(
            <ThemeProvider theme={{}}>
                <div>Test</div>
            </ThemeProvider>,
        );

        expect(
            document.getElementById("gdc-theme-properties").innerHTML.indexOf("color-scheme: light;") > -1,
        ).toEqual(true);
    });

    it("should be set to 'light' when the theme has a light-based complementary palette", async () => {
        const theme: ITheme = { palette: { complementary: { c0: "#fff", c9: "#000" } } };

        await renderComponent(
            <ThemeProvider theme={theme}>
                <div>Test</div>
            </ThemeProvider>,
        );

        expect(
            document.getElementById("gdc-theme-properties").innerHTML.indexOf("color-scheme: light;") > -1,
        ).toEqual(true);
    });

    it("should be set to 'dark' when the theme has a dark-based complementary palette", async () => {
        const theme: ITheme = { palette: { complementary: { c0: "#000", c9: "#fff" } } };

        await renderComponent(
            <ThemeProvider theme={theme}>
                <div>Test</div>
            </ThemeProvider>,
        );

        expect(
            document.getElementById("gdc-theme-properties").innerHTML.indexOf("color-scheme: dark;") > -1,
        ).toEqual(true);
    });
});
