// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import { type IAnalyticalBackend, type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { type IColorPalette, type ITheme, type IUser, idRef } from "@gooddata/sdk-model";

import { type IBootstrapData } from "../../actions/app_context_actions.js";

import { backendBootstrapData } from "./backendBootstrapData.js";

const user: IUser = {
    ref: idRef("jane"),
    login: "jane",
    email: "jane@example.com",
    firstName: "Jane",
    lastName: "Doe",
    fullName: "Jane Doe",
    organizationName: "Profile Org",
    permissions: ["MANAGE"],
};

const workspaceSettings = {
    workspace: "ws1",
    userId: "jane",
    locale: "de-DE",
    separators: { thousand: " ", decimal: "," },
    formatLocale: "cs-CZ",
    agGridToken: "ag-grid-token",
    mapboxToken: "mapbox-token",
    maxZoomLevel: 12,
    whiteLabeling: { enabled: true, logoUrl: "/logo.svg" },
} as IUserWorkspaceSettings;

const colorPalette: IColorPalette = [{ guid: "c1", fill: { r: 1, g: 2, b: 3 } }];
const theme: ITheme = { palette: { primary: { base: "#123456" } } };
const entitlements = [{ name: "Tier", value: "PRODUCTION" }] as const;

interface IBackendOverrides {
    user?: Partial<IUser>;
    organization?: () => Promise<{ id: string; title?: string }>;
    entitlements?: () => Promise<unknown>;
    colorPalette?: () => Promise<IColorPalette>;
    theme?: () => Promise<ITheme>;
    workspaceSettings?: () => Promise<IUserWorkspaceSettings>;
}

function mockBackend(overrides: IBackendOverrides = {}) {
    const getUserSettings = vi.fn(() => Promise.resolve({ userId: "jane", locale: "fr-FR" }));
    const getUserWithDetails = vi.fn(() => Promise.resolve({ ...user, ...overrides.user }));
    const getCurrentOrganization = vi.fn(() =>
        Promise.resolve({
            organizationId: "org1",
            getDescriptor: overrides.organization ?? (() => Promise.resolve({ id: "org1", title: "Acme" })),
        }),
    );
    const resolveEntitlements = vi.fn(overrides.entitlements ?? (() => Promise.resolve(entitlements)));
    const getColorPalette = vi.fn(overrides.colorPalette ?? (() => Promise.resolve(colorPalette)));
    const backend = {
        currentUser: () => ({
            getUserWithDetails,
            settings: () => ({ getSettings: getUserSettings }),
        }),
        organizations: () => ({ getCurrentOrganization }),
        entitlements: () => ({ resolveEntitlements }),
        workspace: (id: string) => ({
            workspace: id,
            settings: () => ({
                getSettingsForCurrentUser:
                    overrides.workspaceSettings ?? (() => Promise.resolve(workspaceSettings)),
            }),
            styling: () => ({
                getColorPalette,
                getTheme: overrides.theme ?? (() => Promise.resolve(theme)),
            }),
        }),
    } as unknown as IAnalyticalBackend;
    return {
        backend,
        getUserSettings,
        getUserWithDetails,
        getCurrentOrganization,
        resolveEntitlements,
        getColorPalette,
    };
}

const expected: IBootstrapData = {
    user: {
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
        uri: "/api/v1/entities/users/jane",
        domain: "",
        loginMD5: "jane",
        language: "de-DE",
        stashedProjectUri: "/gdc/projects/ws1",
        separators: { thousand: " ", decimal: "," },
        formatLocale: "cs-CZ",
        created: "",
        companyName: "Acme",
        permissions: ["MANAGE"],
    },
    uiSettings: {
        organizationName: "Acme",
        organizationId: "org1",
        displayProjects: true,
        displayAccountPage: true,
        logoUrl: "/logo.svg",
        faviconUrl: "",
        appleTouchIconUrl: "",
        isBranded: true,
        documentationUrl: "https://www.gooddata.com/developers/cloud-native/doc/cloud/",
        supportEmail: "tiger-beta@gooddata.com",
        supportForumUrl: "https://support.gooddata.com/home",
    },
    project: {
        identifier: "ws1",
        uri: "/gdc/projects/ws1",
        title: "ws1",
        templateUrl: "",
        timezoneOffset: 0,
        description: "",
        defaultDashboard: "",
        defaultDashboardTab: "",
        analyticalDashboards: [],
    },
    bear: {},
    tiger: {
        organizationEntitlements: [...entitlements],
        isOrganizationAdmin: true,
    },
    colorPalette,
    theme,
    agGridToken: "ag-grid-token",
    mapboxToken: "mapbox-token",
    maxZoomLevel: 12,
};

describe("backendBootstrapData", () => {
    it("builds the bootstrap data from the user, organization, workspace and settings", async () => {
        const { backend } = mockBackend();

        await expect(backendBootstrapData(backend, "ws1", "de-DE")).resolves.toEqual(expected);
    });

    it("falls back to the defaults when the optional values cannot be loaded", async () => {
        vi.spyOn(console, "warn").mockImplementation(() => {});
        const failure = () => Promise.reject(new Error("forbidden"));
        const { backend } = mockBackend({
            user: { permissions: undefined, firstName: undefined, lastName: undefined, email: undefined },
            organization: failure,
            entitlements: failure,
            colorPalette: failure,
            theme: failure,
        });

        const data = await backendBootstrapData(backend, "ws1", undefined);

        expect(data.user).toMatchObject({
            firstName: "Jane Doe",
            lastName: "",
            email: "",
            language: "en-US",
            companyName: "",
            permissions: [],
        });
        expect(data.uiSettings).toMatchObject({ organizationName: "", organizationId: undefined });
        expect(data.tiger).toEqual({ organizationEntitlements: [], isOrganizationAdmin: false });
        expect(data.colorPalette).toBeUndefined();
        expect(data.theme).toBeUndefined();
    });

    it("fails when the workspace settings cannot be loaded", async () => {
        const { backend } = mockBackend({ workspaceSettings: () => Promise.reject(new Error("not found")) });

        await expect(backendBootstrapData(backend, "ws1", "en-US")).rejects.toThrow("not found");
    });

    it("uses the user settings and no project without a workspace", async () => {
        const { backend, getUserSettings } = mockBackend();

        const data = await backendBootstrapData(backend, undefined, "en-US");

        expect(getUserSettings).toHaveBeenCalledTimes(1);
        expect(data.project).toBeNull();
        expect(data.user.stashedProjectUri).toBe("");
        expect(data.user.separators).toEqual({ thousand: ",", decimal: "." });
        expect(data.agGridToken).toBeUndefined();
        expect(data.mapboxToken).toBeUndefined();
        expect(data.colorPalette).toBeUndefined();
    });

    it("uses the settings it is given", async () => {
        const { backend } = mockBackend();
        const settings = { ...workspaceSettings, formatLocale: "en-GB" } as IUserWorkspaceSettings;

        const data = await backendBootstrapData(backend, "ws1", "de-DE", { settings });

        expect(data.user.formatLocale).toBe("en-GB");
    });

    it("does not load the values it is given", async () => {
        const mocks = mockBackend();
        const givenUser: IUser = { ...user, login: "john", email: "john@example.com" };
        const givenPalette: IColorPalette = [{ guid: "c2", fill: { r: 4, g: 5, b: 6 } }];

        const data = await backendBootstrapData(mocks.backend, "ws1", "de-DE", {
            user: givenUser,
            organization: { id: "org2", title: "Globex" },
            entitlements: [],
            colorPalette: givenPalette,
        });

        expect(mocks.getUserWithDetails).not.toHaveBeenCalled();
        expect(mocks.getCurrentOrganization).not.toHaveBeenCalled();
        expect(mocks.resolveEntitlements).not.toHaveBeenCalled();
        expect(mocks.getColorPalette).not.toHaveBeenCalled();
        expect(data.user).toMatchObject({ email: "john@example.com", uri: "/api/v1/entities/users/john" });
        expect(data.uiSettings).toMatchObject({ organizationName: "Globex", organizationId: "org2" });
        expect(data.tiger.organizationEntitlements).toEqual([]);
        expect(data.colorPalette).toBe(givenPalette);
    });

    it("does not load the theme when loadTheme is false", async () => {
        const getTheme = vi.fn(() => Promise.resolve(theme));
        const { backend } = mockBackend({ theme: getTheme });

        const data = await backendBootstrapData(backend, "ws1", "de-DE", { loadTheme: false });

        expect(getTheme).not.toHaveBeenCalled();
        expect(data.theme).toBeUndefined();
    });
});
