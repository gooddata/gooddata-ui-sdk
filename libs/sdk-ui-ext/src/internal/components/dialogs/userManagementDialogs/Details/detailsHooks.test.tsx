// (C) 2026 GoodData Corporation

import { type PropsWithChildren } from "react";

import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { dummyBackendEmptyData } from "@gooddata/sdk-backend-base";
import { type IUserLocalizationSettings } from "@gooddata/sdk-backend-spi";
import { type IUser } from "@gooddata/sdk-model";
import { BackendProvider } from "@gooddata/sdk-ui";

import { OrganizationIdProvider } from "../OrganizationIdContext.js";
import { TelemetryProvider } from "../TelemetryContext.js";

import { useUserDetails } from "./detailsHooks.js";

vi.mock("@gooddata/sdk-ui-kit", async (importOriginal) => ({
    ...(await importOriginal<Record<string, unknown>>()),
    useToastMessage: () => ({ addSuccess: vi.fn(), addError: vi.fn() }),
}));

const USER: IUser = { ref: { identifier: "ben", type: "user" } as never, login: "ben", firstName: "Ben" };

function renderUserDetails(
    languages: IUserLocalizationSettings | undefined,
    onLanguagesSaveFailed = vi.fn(),
) {
    const backend = dummyBackendEmptyData();
    const organization = backend.organization("org");
    const users = organization.users();
    const setUserLocalizationSetting = vi.spyOn(users, "setUserLocalizationSetting");
    const updateUser = vi.spyOn(users, "updateUser");
    vi.spyOn(organization, "users").mockReturnValue(users);
    vi.spyOn(backend, "organization").mockReturnValue(organization);
    const onSubmit = vi.fn();
    const trackEvent = vi.fn();
    const wrapper = ({ children }: PropsWithChildren) => (
        <BackendProvider backend={backend}>
            <OrganizationIdProvider organizationId="org">
                <TelemetryProvider trackEvent={trackEvent}>{children}</TelemetryProvider>
            </OrganizationIdProvider>
        </BackendProvider>
    );
    const { result, rerender } = renderHook(
        ({ saved }) =>
            useUserDetails(
                USER,
                false,
                onSubmit,
                vi.fn(),
                () => Promise.resolve(),
                false,
                saved,
                onLanguagesSaveFailed,
            ),
        { wrapper, initialProps: { saved: languages } },
    );
    return {
        result,
        rerender,
        onSubmit,
        trackEvent,
        setUserLocalizationSetting,
        updateUser,
        onLanguagesSaveFailed,
    };
}

describe("useUserDetails languages", () => {
    it("saves only the languages that changed and reports them", async () => {
        const { result, onSubmit, setUserLocalizationSetting } = renderUserDetails({
            LOCALE: "ko-KR",
            METADATA_LOCALE: "de-DE",
        });

        act(() => result.current.onLanguagesChange({ LOCALE: "fr-FR", METADATA_LOCALE: undefined }));
        expect(result.current.isDirty).toBe(true);
        act(() => result.current.onSave());

        await waitFor(() => expect(onSubmit).toHaveBeenCalled());
        expect(setUserLocalizationSetting).toHaveBeenCalledTimes(2);
        expect(setUserLocalizationSetting).toHaveBeenCalledWith("ben", "LOCALE", "fr-FR");
        expect(setUserLocalizationSetting).toHaveBeenCalledWith("ben", "METADATA_LOCALE", undefined);
        expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ login: "ben" }), false, {
            LOCALE: "fr-FR",
            METADATA_LOCALE: undefined,
        });
    });

    it("reports one saved-language event per changed setting", async () => {
        const { result, onSubmit, trackEvent } = renderUserDetails({ LOCALE: "ko-KR", DATA_LOCALE: "de-DE" });

        act(() => result.current.onLanguagesChange({ LOCALE: "fr-FR", DATA_LOCALE: undefined }));
        act(() => result.current.onSave());

        await waitFor(() => expect(onSubmit).toHaveBeenCalled());
        expect(trackEvent).toHaveBeenCalledTimes(3);
        expect(trackEvent).toHaveBeenCalledWith("user-detail-updated");
        expect(trackEvent).toHaveBeenCalledWith("user-display-language-saved");
        expect(trackEvent).toHaveBeenCalledWith("user-data-language-saved");
    });

    it("reports only the languages whose write succeeded when another write fails", async () => {
        const { result, trackEvent, setUserLocalizationSetting, onLanguagesSaveFailed } = renderUserDetails({
            LOCALE: "ko-KR",
        });
        setUserLocalizationSetting.mockImplementation((_login, type) =>
            type === "DATA_LOCALE" ? Promise.reject(new Error("failed")) : Promise.resolve(),
        );
        vi.spyOn(console, "error").mockImplementation(() => {});

        act(() => result.current.onLanguagesChange({ LOCALE: "fr-FR", DATA_LOCALE: "es-ES" }));
        act(() => result.current.onSave());

        await waitFor(() => expect(onLanguagesSaveFailed).toHaveBeenCalled());
        expect(trackEvent.mock.calls).toEqual([["user-display-language-saved"]]);
    });

    it("leaves the profile alone when only a language changed", async () => {
        const { result, onSubmit, setUserLocalizationSetting, updateUser } = renderUserDetails({
            LOCALE: "ko-KR",
        });

        act(() => result.current.onLanguagesChange({ LOCALE: "fr-FR" }));
        act(() => result.current.onSave());

        await waitFor(() => expect(onSubmit).toHaveBeenCalled());
        expect(setUserLocalizationSetting).toHaveBeenCalledWith("ben", "LOCALE", "fr-FR");
        expect(updateUser).not.toHaveBeenCalled();
    });

    it("saves the profile with a language change when the profile changed too", async () => {
        const { result, onSubmit, updateUser } = renderUserDetails({ LOCALE: "ko-KR" });

        act(() => result.current.onChange({ ...USER, firstName: "Benjamin" }, false));
        act(() => result.current.onLanguagesChange({ LOCALE: "fr-FR" }));
        act(() => result.current.onSave());

        await waitFor(() => expect(onSubmit).toHaveBeenCalled());
        expect(updateUser).toHaveBeenCalledWith(expect.objectContaining({ firstName: "Benjamin" }));
    });

    it("writes no language when only the profile changed", async () => {
        const { result, onSubmit, setUserLocalizationSetting, updateUser } = renderUserDetails({
            LOCALE: "ko-KR",
        });

        act(() => result.current.onChange({ ...USER, firstName: "Benjamin" }, false));
        act(() => result.current.onSave());

        await waitFor(() => expect(onSubmit).toHaveBeenCalled());
        expect(updateUser).toHaveBeenCalled();
        expect(setUserLocalizationSetting).not.toHaveBeenCalled();
    });

    it("is not dirty when a language is set back to its saved value", () => {
        const { result } = renderUserDetails({ LOCALE: "ko-KR" });

        act(() => result.current.onLanguagesChange({ LOCALE: "fr-FR" }));
        act(() => result.current.onLanguagesChange({ LOCALE: "ko-KR" }));

        expect(result.current.isDirty).toBe(false);
    });

    it("writes no language when the languages were not loaded", async () => {
        const { result, onSubmit, setUserLocalizationSetting } = renderUserDetails(undefined);

        act(() => result.current.onChange({ ...USER, firstName: "Benjamin" }, false));
        act(() => result.current.onSave());

        await waitFor(() => expect(onSubmit).toHaveBeenCalled());
        expect(setUserLocalizationSetting).not.toHaveBeenCalled();
    });

    it("reloads the saved languages when a language write fails", async () => {
        const { result, onSubmit, setUserLocalizationSetting, onLanguagesSaveFailed } = renderUserDetails({
            LOCALE: "ko-KR",
        });
        setUserLocalizationSetting.mockImplementation((_login, type) =>
            type === "DATA_LOCALE" ? Promise.reject(new Error("failed")) : Promise.resolve(),
        );
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

        act(() => result.current.onLanguagesChange({ LOCALE: "fr-FR", DATA_LOCALE: "es-ES" }));
        act(() => result.current.onSave());

        await waitFor(() => expect(onLanguagesSaveFailed).toHaveBeenCalledTimes(1));
        expect(onSubmit).not.toHaveBeenCalled();
        expect(consoleError).toHaveBeenCalledWith("Change of user details failed", expect.any(Error));
    });

    it("does not reload the languages when only the profile fails to save", async () => {
        const { result, updateUser, onLanguagesSaveFailed } = renderUserDetails({ LOCALE: "ko-KR" });
        updateUser.mockRejectedValue(new Error("failed"));
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

        act(() => result.current.onChange({ ...USER, firstName: "Benjamin" }, false));
        act(() => result.current.onSave());

        await waitFor(() => expect(result.current.isProcessing).toBe(false));
        expect(onLanguagesSaveFailed).not.toHaveBeenCalled();
        expect(consoleError).toHaveBeenCalledWith("Change of user details failed", expect.any(Error));
    });

    it("keeps the pending languages when the saved ones reload, and saves only what still differs", async () => {
        const { result, rerender, setUserLocalizationSetting } = renderUserDetails({ LOCALE: "ko-KR" });

        act(() => result.current.onLanguagesChange({ LOCALE: "fr-FR", DATA_LOCALE: "es-ES" }));
        rerender({ saved: { LOCALE: "fr-FR" } });

        expect(result.current.updatedLanguages).toEqual({ LOCALE: "fr-FR", DATA_LOCALE: "es-ES" });
        act(() => result.current.onSave());

        await waitFor(() => expect(setUserLocalizationSetting).toHaveBeenCalledTimes(1));
        expect(setUserLocalizationSetting).toHaveBeenCalledWith("ben", "DATA_LOCALE", "es-ES");
    });
});
