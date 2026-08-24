// (C) 2020-2026 GoodData Corporation

import { type ReactElement, act } from "react";

import { type RenderResult, render } from "@testing-library/react";
import { cloneDeep } from "lodash-es";
import { describe, expect, it, vi } from "vitest";

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type ITheme } from "@gooddata/sdk-model";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import { suppressConsole } from "@gooddata/util";

import { useTheme, useThemeIsLoading, useThemeStatus, withTheme } from "./Context.js";
import { isDarkTheme } from "./isDarkTheme.js";
import { type ThemeModifier, ThemeProvider } from "./ThemeProvider.js";

const renderComponent = async (component: ReactElement): Promise<RenderResult> => {
    let wrappedComponent: RenderResult | undefined;
    await suppressConsole(
        () =>
            act(() => {
                wrappedComponent = render(component);
            }),
        "error",
        [
            {
                type: "startsWith",
                value: "The current testing environment is not configured to support act(...)",
            },
        ],
    );
    return wrappedComponent!;
};

/**
 * Counterpart of the withTheme(TestComponent) helper - reads the very same context values
 * through the hooks and forwards them to a spy.
 */
function HookTestComponent({
    onValues,
}: {
    onValues: (values: {
        theme: ReturnType<typeof useTheme>;
        themeIsLoading: ReturnType<typeof useThemeIsLoading>;
        themeStatus: ReturnType<typeof useThemeStatus>;
    }) => void;
}) {
    const theme = useTheme();
    const themeIsLoading = useThemeIsLoading();
    const themeStatus = useThemeStatus();
    onValues({ theme, themeIsLoading, themeStatus });
    return null;
}

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
            undefined,
        );
    });

    it("should pass theme object and themeIsLoading flag to context (via hooks)", async () => {
        const onValues = vi.fn();
        await renderComponent(
            <ThemeProvider backend={backend} workspace={workspace}>
                <HookTestComponent onValues={onValues} />
            </ThemeProvider>,
        );

        expect(onValues).toHaveBeenLastCalledWith({ themeIsLoading: false, theme, themeStatus: "success" });
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
            undefined,
        );
    });

    it("should pass themeIsLoading flag set to false if backend is missing (via hooks)", async () => {
        const onValues = vi.fn();
        await renderComponent(
            <ThemeProvider workspace={workspace}>
                <HookTestComponent onValues={onValues} />
            </ThemeProvider>,
        );

        expect(onValues).toHaveBeenCalledWith({ themeIsLoading: false, theme: {}, themeStatus: "pending" });
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
            undefined,
        );
    });

    it("should pass themeIsLoading flag set to false if workspace is missing (via hooks)", async () => {
        const onValues = vi.fn();
        await renderComponent(
            <ThemeProvider backend={backend}>
                <HookTestComponent onValues={onValues} />
            </ThemeProvider>,
        );

        expect(onValues).toHaveBeenCalledWith({ themeIsLoading: false, theme: {}, themeStatus: "pending" });
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
            undefined,
        );
    });

    it("should use theme from props and contain complete complementary palette (via hooks)", async () => {
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

        const onValues = vi.fn();
        await renderComponent(
            <ThemeProvider theme={theme}>
                <HookTestComponent onValues={onValues} />
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
        expect(onValues).toHaveBeenLastCalledWith({
            themeIsLoading: false,
            theme: expectedTheme,
            themeStatus: "success",
        });
    });

    it("should not hang and should still apply valid colors when the theme contains an invalid color", async () => {
        // A full complementary palette where a single shade (c9) is an invalid hex value.
        const themeWithInvalidColor: ITheme = {
            palette: {
                primary: { base: "#001F5A" },
                complementary: {
                    c0: "#ffffff",
                    c1: "#2662FC",
                    c2: "#BAD1F5",
                    c3: "#F9F9F9",
                    c4: "#00C2FF",
                    c5: "#000C36",
                    c6: "#082485",
                    c7: "#0F3DB5",
                    c8: "#E7F1FC",
                    c9: "#1616D",
                },
            },
        };

        const TestComponent = vi.fn(() => null);
        const TestComponentWithTheme = withTheme(TestComponent);
        await renderComponent(
            <ThemeProvider theme={themeWithInvalidColor}>
                <TestComponentWithTheme />
            </ThemeProvider>,
        );

        // loading gate is released - no infinite loading screen
        expect(TestComponent).toHaveBeenLastCalledWith(
            expect.objectContaining({ themeIsLoading: false, themeStatus: "success" }),
            undefined,
        );

        const themeElement = document.getElementById("gdc-theme-properties");
        // a valid color is preserved, the invalid one is dropped (no variable emitted for it)
        expect(themeElement?.innerHTML.indexOf("--gd-palette-complementary-1: #2662FC;")).toBeGreaterThan(-1);
        expect(themeElement?.innerHTML).not.toContain("1616D");
    });

    it("should not hang and should still apply valid colors when the theme contains an invalid color (via hooks)", async () => {
        // A full complementary palette where a single shade (c9) is an invalid hex value.
        const themeWithInvalidColor: ITheme = {
            palette: {
                primary: { base: "#001F5A" },
                complementary: {
                    c0: "#ffffff",
                    c1: "#2662FC",
                    c2: "#BAD1F5",
                    c3: "#F9F9F9",
                    c4: "#00C2FF",
                    c5: "#000C36",
                    c6: "#082485",
                    c7: "#0F3DB5",
                    c8: "#E7F1FC",
                    c9: "#1616D",
                },
            },
        };

        const onValues = vi.fn();
        await renderComponent(
            <ThemeProvider theme={themeWithInvalidColor}>
                <HookTestComponent onValues={onValues} />
            </ThemeProvider>,
        );

        // loading gate is released - no infinite loading screen
        expect(onValues).toHaveBeenLastCalledWith(
            expect.objectContaining({ themeIsLoading: false, themeStatus: "success" }),
        );

        const themeElement = document.getElementById("gdc-theme-properties");
        // a valid color is preserved, the invalid one is dropped (no variable emitted for it)
        expect(themeElement?.innerHTML.indexOf("--gd-palette-complementary-1: #2662FC;")).toBeGreaterThan(-1);
        expect(themeElement?.innerHTML).not.toContain("1616D");
    });

    it("should not hang when loading or applying the backend theme fails", async () => {
        // Simulate a failure while processing the loaded theme (e.g. an unrecoverable color error).
        const throwingModifier: ThemeModifier = () => {
            throw new Error("Boom while processing theme");
        };
        const TestComponent = vi.fn(() => null);
        const TestComponentWithTheme = withTheme(TestComponent);

        await suppressConsole(
            () =>
                act(() => {
                    render(
                        <ThemeProvider backend={backend} workspace={workspace} modifier={throwingModifier}>
                            <TestComponentWithTheme />
                        </ThemeProvider>,
                    );
                }),
            "error",
            [
                {
                    type: "startsWith",
                    value: "The current testing environment is not configured to support act(...)",
                },
                { type: "startsWith", value: "Failed to load or process the theme from the backend." },
            ],
        );

        // loading gate is released even though theme processing failed - no infinite loading screen,
        // and the context theme is reset to the default so it stays consistent with the cleared CSS
        expect(TestComponent).toHaveBeenLastCalledWith(
            { themeIsLoading: false, theme: {}, themeStatus: "success" },
            undefined,
        );
    });

    it("should not hang when loading or applying the backend theme fails (via hooks)", async () => {
        // Simulate a failure while processing the loaded theme (e.g. an unrecoverable color error).
        const throwingModifier: ThemeModifier = () => {
            throw new Error("Boom while processing theme");
        };
        const onValues = vi.fn();

        await suppressConsole(
            () =>
                act(() => {
                    render(
                        <ThemeProvider backend={backend} workspace={workspace} modifier={throwingModifier}>
                            <HookTestComponent onValues={onValues} />
                        </ThemeProvider>,
                    );
                }),
            "error",
            [
                {
                    type: "startsWith",
                    value: "The current testing environment is not configured to support act(...)",
                },
                { type: "startsWith", value: "Failed to load or process the theme from the backend." },
            ],
        );

        // loading gate is released even though theme processing failed - no infinite loading screen,
        // and the context theme is reset to the default so it stays consistent with the cleared CSS
        expect(onValues).toHaveBeenLastCalledWith({
            themeIsLoading: false,
            theme: {},
            themeStatus: "success",
        });
    });

    it("should not re-add global theme styles when the backend theme resolves after unmount", async () => {
        let resolveTheme: (theme: ITheme) => void = () => {};
        const pendingTheme = new Promise<ITheme>((resolve) => {
            resolveTheme = resolve;
        });
        const getTheme = vi.fn(() => pendingTheme);
        const pendingBackend = {
            workspace: () => ({
                styling: () => ({
                    getTheme,
                }),
            }),
        } as unknown as IAnalyticalBackend;

        const { unmount } = await renderComponent(
            <ThemeProvider backend={pendingBackend} workspace={workspace}>
                <div>Test</div>
            </ThemeProvider>,
        );

        // without this the test would pass vacuously - no getTheme() call means no theme to re-add
        expect(getTheme).toHaveBeenCalled();

        unmount();
        resolveTheme(theme);
        // let the getTheme() continuation inside ThemeProvider run
        await pendingTheme;
        await Promise.resolve();

        expect(document.getElementById("gdc-theme-properties")).toEqual(null);
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
