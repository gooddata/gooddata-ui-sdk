// (C) 2020 GoodData Corporation
import React from "react";
import { act } from "react-dom/test-utils";
import { mount, ReactWrapper } from "enzyme";
import { recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";

import { WorkspaceProvider, BackendProvider } from "../../../index";
import { TranslationsCustomizationProvider } from "../TranslationsCustomizationProvider";
import { resetWorkspaceSettingsLoader } from "../workspaceSettingsLoader";

const workspace = "testWorkspace";
const getBackend = (enableInsightToReport = true) =>
    recordedBackend(ReferenceRecordings.Recordings, {
        globalSettings: {
            enableInsightToReport,
        },
    });
const messages = {
    "translatedString|insight": "Insight",
    "translatedString|report": "Report",
};

const renderComponent = async (component: React.ReactElement) => {
    let wrappedComponent: ReactWrapper | undefined;
    await act(async () => {
        wrappedComponent = mount(component);
    });
    wrappedComponent?.update();
    return wrappedComponent;
};

describe("TranslationsCustomizationProvider", () => {
    afterEach(() => {
        delete window.gdSettings;
        resetWorkspaceSettingsLoader();
    });

    it("should load the config and set it to `window.gdSettings` (backend and workspace is provided through context)", async () => {
        await renderComponent(
            <BackendProvider backend={getBackend()}>
                <WorkspaceProvider workspace={workspace}>
                    <TranslationsCustomizationProvider
                        render={() => <div>Test</div>}
                        translations={messages}
                    />
                </WorkspaceProvider>
            </BackendProvider>,
        );

        expect(window.gdSettings).toMatchObject({ enableInsightToReport: true });
    });

    it("should load the config and set it to `window.gdSettings` (backend and workspace is provided through props)", async () => {
        await renderComponent(
            <TranslationsCustomizationProvider
                backend={getBackend()}
                workspace={workspace}
                render={() => <div>Test</div>}
                translations={messages}
            />,
        );

        expect(window.gdSettings).toMatchObject({ enableInsightToReport: true });
    });

    it("should prepare the translations so there is always used `Report` instead of `Insight` when `enableInsightToReport` feature flag is set to true", async () => {
        const component = await renderComponent(
            <TranslationsCustomizationProvider
                backend={getBackend()}
                workspace={workspace}
                render={(translations) => <div>{translations.translatedString}</div>}
                translations={messages}
            />,
        );

        expect(component?.text()).toEqual("Report");
    });

    it("should prepare the translations so there is always used `Insight` when `enableInsightToReport` feature flag is set to false as is by default", async () => {
        const component = await renderComponent(
            <TranslationsCustomizationProvider
                backend={getBackend(false)}
                workspace={workspace}
                render={(translations) => <div>{translations.translatedString}</div>}
                translations={messages}
            />,
        );

        expect(component?.text()).toEqual("Insight");
    });

    it("should not load the config if backend is missing", async () => {
        const component = await renderComponent(
            <TranslationsCustomizationProvider
                workspace={workspace}
                render={(translations) => <div>{translations.translatedString}</div>}
                translations={messages}
            />,
        );

        expect(component?.text()).toEqual("Insight");
        expect(window.gdSettings).toEqual(undefined);
    });

    it("should not load the config if workspace is missing", async () => {
        const component = await renderComponent(
            <TranslationsCustomizationProvider
                backend={getBackend()}
                render={(translations) => <div>{translations.translatedString}</div>}
                translations={messages}
            />,
        );

        expect(component?.text()).toEqual("Insight");
        expect(window.gdSettings).toEqual(undefined);
    });
});
