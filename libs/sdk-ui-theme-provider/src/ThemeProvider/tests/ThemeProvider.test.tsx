// (C) 2020 GoodData Corporation
import React from "react";
import { act } from "react-dom/test-utils";
import { mount, ReactWrapper } from "enzyme";
import { recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { ITheme } from "@gooddata/sdk-backend-spi";
import { WorkspaceProvider, BackendProvider } from "@gooddata/sdk-ui";

import { ThemeProvider } from "../ThemeProvider";
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

    it("should not load the theme and not set the properties if backend is missing", async () => {
        await renderComponent(
            <ThemeProvider workspace={workspace}>
                <div>Test</div>
            </ThemeProvider>,
        );

        expect(document.getElementById("gdc-theme-properties")).toEqual(null);
    });

    it("should not load the theme and not set the properties if workspace is missing", async () => {
        const backend = recordedBackend(ReferenceRecordings.Recordings, { theme });

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
});
