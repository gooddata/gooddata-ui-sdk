// (C) 2026 GoodData Corporation

import { type PropsWithChildren } from "react";

import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { dummyBackendEmptyData } from "@gooddata/sdk-backend-base";
import { type IAnalyticalBackend, type ILocalizationStatistics } from "@gooddata/sdk-backend-spi";
import { type ISettings } from "@gooddata/sdk-model";
import { BackendProvider } from "@gooddata/sdk-ui";

import { LANGUAGE_NOTICE_WORKSPACE_LIMIT, useLanguageNoticeData } from "./dialogHooks.js";
import { type IGrantedWorkspace } from "./types.js";

const statisticsOf = (locale: string): ILocalizationStatistics => ({
    metadata: { locales: [{ locale }] },
    data: { locales: [] },
});

const ORGANIZATION_SETTINGS: ISettings = { metadataLocale: "fr-FR", dataLocale: "de-DE" };

function renderNoticeData(
    grantedWorkspaces: IGrantedWorkspace[] | undefined,
    isEnabled = true,
    getStatistics = vi.fn((id: string) => Promise.resolve(statisticsOf(`${id}-locale`))),
    getSettings = vi.fn(() => Promise.resolve(ORGANIZATION_SETTINGS)),
) {
    const backend = dummyBackendEmptyData();
    vi.spyOn(backend, "workspace").mockImplementation(
        (id: string) =>
            ({
                localization: () => ({ getStatistics: () => getStatistics(id) }),
            }) as unknown as ReturnType<IAnalyticalBackend["workspace"]>,
    );
    vi.spyOn(backend, "organization").mockImplementation(
        () =>
            ({
                settings: () => ({ getSettings }),
            }) as unknown as ReturnType<IAnalyticalBackend["organization"]>,
    );
    const wrapper = ({ children }: PropsWithChildren) => (
        <BackendProvider backend={backend}>{children}</BackendProvider>
    );
    const { result, rerender } = renderHook(
        ({ workspaces }) => useLanguageNoticeData("org", workspaces, isEnabled),
        { wrapper, initialProps: { workspaces: grantedWorkspaces } },
    );
    return { result, rerender, getStatistics, getSettings };
}

const workspace = (id: string) => ({ id }) as IGrantedWorkspace;

describe("useLanguageNoticeData", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("loads the statistics once for each workspace the user has, and the organization languages", async () => {
        const { result, getStatistics, getSettings } = renderNoticeData([
            workspace("sales"),
            workspace("hr"),
            workspace("sales"),
        ]);

        await waitFor(() => expect(result.current).toBeDefined());
        expect(getStatistics).toHaveBeenCalledTimes(2);
        expect(getSettings).toHaveBeenCalledTimes(1);
        expect(result.current).toEqual({
            workspaceStatistics: [statisticsOf("hr-locale"), statisticsOf("sales-locale")],
            organizationLanguages: { METADATA_LOCALE: "fr-FR", DATA_LOCALE: "de-DE" },
        });
    });

    it("loads nothing while the workspaces are unknown or localization is off", async () => {
        const unknown = renderNoticeData(undefined);
        const disabled = renderNoticeData([workspace("sales")], false);

        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(unknown.result.current).toBeUndefined();
        expect(disabled.result.current).toBeUndefined();
        expect(unknown.getStatistics).not.toHaveBeenCalled();
        expect(unknown.getSettings).not.toHaveBeenCalled();
        expect(disabled.getStatistics).not.toHaveBeenCalled();
        expect(disabled.getSettings).not.toHaveBeenCalled();
    });

    it("loads nothing for more workspaces than the limit", async () => {
        const workspaces = Array.from({ length: LANGUAGE_NOTICE_WORKSPACE_LIMIT + 1 }, (_, index) =>
            workspace(`workspace-${index}`),
        );
        const { result, getStatistics, getSettings } = renderNoticeData(workspaces);

        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(result.current).toBeUndefined();
        expect(getStatistics).not.toHaveBeenCalled();
        expect(getSettings).not.toHaveBeenCalled();
    });

    it("loads the statistics for as many workspaces as the limit", async () => {
        const workspaces = Array.from({ length: LANGUAGE_NOTICE_WORKSPACE_LIMIT }, (_, index) =>
            workspace(`workspace-${index}`),
        );
        const { result, getStatistics } = renderNoticeData(workspaces);

        await waitFor(() => expect(result.current).toBeDefined());
        expect(getStatistics).toHaveBeenCalledTimes(LANGUAGE_NOTICE_WORKSPACE_LIMIT);
    });

    it("drops the statistics of the previous workspaces as soon as the workspaces change", async () => {
        const getStatistics = vi.fn((id: string) =>
            id === "sales" ? Promise.resolve(statisticsOf("sales-locale")) : new Promise<never>(() => {}),
        );
        const { result, rerender } = renderNoticeData([workspace("sales")], true, getStatistics);
        await waitFor(() =>
            expect(result.current?.workspaceStatistics).toEqual([statisticsOf("sales-locale")]),
        );

        rerender({ workspaces: [workspace("hr")] });

        expect(result.current).toBeUndefined();
    });

    it("keeps no earlier statistics when loading the new workspaces fails", async () => {
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        const getStatistics = vi.fn((id: string) =>
            id === "sales"
                ? Promise.resolve(statisticsOf("sales-locale"))
                : Promise.reject(new Error("failed")),
        );
        const { result, rerender } = renderNoticeData([workspace("sales")], true, getStatistics);
        await waitFor(() =>
            expect(result.current?.workspaceStatistics).toEqual([statisticsOf("sales-locale")]),
        );

        rerender({ workspaces: [workspace("hr")] });
        await waitFor(() => expect(getStatistics).toHaveBeenCalledWith("hr"));
        await waitFor(() => expect(consoleError).toHaveBeenCalledTimes(1));

        expect(result.current).toBeUndefined();
    });

    it("gives no notice data when the organization languages fail to load", async () => {
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        const getSettings = vi.fn(() => Promise.reject(new Error("failed")));
        const { result, getStatistics } = renderNoticeData(
            [workspace("sales")],
            true,
            undefined,
            getSettings,
        );

        await waitFor(() => expect(consoleError).toHaveBeenCalledTimes(1));

        expect(getStatistics).toHaveBeenCalled();
        expect(getSettings).toHaveBeenCalled();
        expect(result.current).toBeUndefined();
    });
});
