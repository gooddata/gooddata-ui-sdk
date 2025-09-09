// (C) 2020-2025 GoodData Corporation

import React, { act } from "react";

import { RenderResult, render } from "@testing-library/react";
import cloneDeep from "lodash/cloneDeep.js";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import { ITheme } from "@gooddata/sdk-model";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import { suppressConsole } from "@gooddata/util";

import { withTheme } from "../Context.js";
import { isDarkTheme } from "../isDarkTheme.js";
import { ThemeModifier, ThemeProvider } from "../ThemeProvider.js";

const renderComponent = async (component: React.ReactElement): Promise<RenderResult> => {
    let wrappedComponent: RenderResult | undefined;
    await suppressConsole(
        async () =>
            act(async () => {
                wrappedComponent = render(component);
            }),
        "error",
        [
            {
                type: "startsWith",
                value: "Warning: The current testing environment is not configured to support act(...)",
            },
        ],
    );
    return wrappedComponent!;
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

        const themeElement = document.getElementById("gdc-theme-properties");
        expect(themeElement && themeElement.innerHTML.length > 0).toEqual(true);
    });

    it("should load the theme and set the properties (backend and workspace is provided through props)", async () => {
        await renderComponent(
            <ThemeProvider backend={backend} workspace={workspace}>
                <div>Test</div>
            </ThemeProvider>,
        );

        const themeElement = document.getElementById("gdc-theme-properties");
        expect(themeElement && themeElement.innerHTML.length > 0).toEqual(true);
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

        const themeElement = document.getElementById("gdc-theme-properties");
        expect(
            themeElement && themeElement.innerHTML.indexOf("--gd-button-borderRadius: 15px;") > -1,
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

        const themeElement = document.getElementById("gdc-theme-properties");
        expect(
            themeElement && themeElement.innerHTML.indexOf("--gd-button-borderRadius: 15px;") > -1,
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

    it("should pass theme object and themeIsLoading flag to context", async () => {
        const TestComponent = vi.fn(() => null);
        const TestComponentWithTheme = withTheme(TestComponent);
        await renderComponent(
            <ThemeProvider backend={backend} workspace={workspace}>
                <TestComponentWithTheme />
            </ThemeProvider>,
        );

        expect(TestComponent).toHaveBeenLastCalledWith(
            { themeIsLoading: false, theme, themeStatus: "success" },
            {},
        );
    });

    it("should pass themeIsLoading flag set to false if backend is missing", async () => {
        const TestComponent = vi.fn(() => null);
        const TestComponentWithTheme = withTheme(TestComponent);
        await renderComponent(
            <ThemeProvider workspace={workspace}>
                <TestComponentWithTheme />
            </ThemeProvider>,
        );

        expect(TestComponent).toHaveBeenCalledWith(
            { themeIsLoading: false, theme: {}, themeStatus: "pending" },
            {},
        );
    });

    it("should pass themeIsLoading flag set to false if workspace is missing", async () => {
        const TestComponent = vi.fn(() => null);
        const TestComponentWithTheme = withTheme(TestComponent);
        await renderComponent(
            <ThemeProvider backend={backend}>
                <TestComponentWithTheme />
            </ThemeProvider>,
        );

        expect(TestComponent).toHaveBeenCalledWith(
            { themeIsLoading: false, theme: {}, themeStatus: "pending" },
            {},
        );
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

        const themeElementModal = document.getElementById("gdc-theme-properties");
        expect(
            themeElementModal && themeElementModal.innerHTML.indexOf("--gd-modal-dropShadow: none;") > -1,
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
                    base: "#f18600",
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

        const TestComponent = vi.fn(() => null);
        const TestComponentWithTheme = withTheme(TestComponent);
        await renderComponent(
            <ThemeProvider theme={theme}>
                <TestComponentWithTheme />
            </ThemeProvider>,
        );

        Object.values(expectedTheme.palette?.complementary ?? {}).forEach((color, index) => {
            const themeElementPalette = document.getElementById("gdc-theme-properties");
            expect(
                themeElementPalette &&
                    themeElementPalette.innerHTML.indexOf(`--gd-palette-complementary-${index}: ${color};`) >
                        -1,
            ).toEqual(true);
        });
        expect(TestComponent).toHaveBeenLastCalledWith(
            {
                themeIsLoading: false,
                theme: expectedTheme,
                themeStatus: "success",
            },
            {},
        );
    });

    it("should not remove global theme styles on unmount when removeGlobalStylesOnUnmout is set to false", async () => {
        const { unmount } = await renderComponent(
            <ThemeProvider
                workspace={workspace}
                backend={backend}
                theme={theme}
                removeGlobalStylesOnUnmout={false}
            >
                <div>Test</div>
            </ThemeProvider>,
        );

        unmount();
        const themeElementUnmount = document.getElementById("gdc-theme-properties");
        expect(themeElementUnmount && themeElementUnmount.innerHTML.length > 0).toEqual(true);
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

        const themeElementLight = document.getElementById("gdc-theme-properties");
        expect(themeElementLight && themeElementLight.innerHTML.indexOf("color-scheme: light;") > -1).toEqual(
            true,
        );
    });

    it("should be set to 'light' when the theme has a light-based complementary palette", async () => {
        const theme: ITheme = { palette: { complementary: { c0: "#fff", c9: "#000" } } };

        await renderComponent(
            <ThemeProvider theme={theme}>
                <div>Test</div>
            </ThemeProvider>,
        );

        const themeElementLight = document.getElementById("gdc-theme-properties");
        expect(themeElementLight && themeElementLight.innerHTML.indexOf("color-scheme: light;") > -1).toEqual(
            true,
        );
    });

    it("should be set to 'dark' when the theme has a dark-based complementary palette", async () => {
        const theme: ITheme = { palette: { complementary: { c0: "#000", c9: "#fff" } } };

        await renderComponent(
            <ThemeProvider theme={theme}>
                <div>Test</div>
            </ThemeProvider>,
        );

        const themeElementDark = document.getElementById("gdc-theme-properties");
        expect(themeElementDark && themeElementDark.innerHTML.indexOf("color-scheme: dark;") > -1).toEqual(
            true,
        );
    });
});
