// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IUserWorkspaceSettings, idRef } from "@gooddata/sdk-model";
import { type IPlatformContext } from "@gooddata/sdk-pluggable-application-model";

import {
    type IAdBootstrapHostValues,
    hostValuesToBootstrapData,
    platformContextToBootstrapData,
} from "./platformContext.js";

const SETTINGS = {
    workspace: "ws-1",
    userId: "user-1",
    locale: "en-US",
    separators: { thousand: " ", decimal: "," },
    formatLocale: "cs-CZ",
    agGridToken: "ag-grid-token",
} as unknown as IUserWorkspaceSettings;

const COLOR_PALETTE = [{ guid: "c1", fill: { r: 1, g: 2, b: 3 } }];
const ENTITLEMENTS = [{ name: "Tier" as const, value: "Premium" }];

const USER = {
    ref: idRef("user-1"),
    login: "user-1",
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    permissions: ["canInitData"],
};

const HOST_VALUES: IAdBootstrapHostValues = {
    workspaceId: "ws-1",
    locale: "de-DE",
    settings: SETTINGS,
    user: USER,
    organization: { id: "org-1", title: "Org" },
    isOrganizationAdmin: true,
    entitlements: ENTITLEMENTS,
    whiteLabeling: { enabled: true, logoUrl: "logo.svg", faviconUrl: "favicon.ico" },
    colorPalette: COLOR_PALETTE,
};

const UI_SETTINGS_CONSTANTS = {
    displayProjects: true,
    displayAccountPage: true,
    documentationUrl: "https://www.gooddata.com/developers/cloud-native/doc/cloud/",
    supportEmail: "tiger-beta@gooddata.com",
    supportForumUrl: "https://support.gooddata.com/home",
};

const PROJECT = {
    identifier: "ws-1",
    uri: "/gdc/projects/ws-1",
    title: "ws-1",
    templateUrl: "",
    timezoneOffset: 0,
    description: "",
    defaultDashboard: "",
    defaultDashboardTab: "",
    analyticalDashboards: [] as string[],
};

describe("hostValuesToBootstrapData", () => {
    it("carries the user, settings, organization and branding the host gives", () => {
        expect(hostValuesToBootstrapData(HOST_VALUES)).toEqual({
            user: {
                firstName: "Ada",
                lastName: "Lovelace",
                email: "ada@example.com",
                uri: "/api/v1/entities/users/user-1",
                domain: "",
                loginMD5: "user-1",
                language: "de-DE",
                stashedProjectUri: "/gdc/projects/ws-1",
                separators: { thousand: " ", decimal: "," },
                formatLocale: "cs-CZ",
                created: "",
                companyName: "Org",
                permissions: ["canInitData"],
            },
            uiSettings: {
                ...UI_SETTINGS_CONSTANTS,
                organizationName: "Org",
                organizationId: "org-1",
                logoUrl: "logo.svg",
                faviconUrl: "favicon.ico",
                appleTouchIconUrl: "",
                isBranded: true,
            },
            project: PROJECT,
            bear: {},
            tiger: { organizationEntitlements: ENTITLEMENTS, isOrganizationAdmin: true },
            colorPalette: COLOR_PALETTE,
            theme: undefined,
            agGridToken: "ag-grid-token",
        });
    });

    it("falls back to defaults for the values the host leaves out", () => {
        const settings = { userId: "user-2", locale: "en-US" } as unknown as IUserWorkspaceSettings;

        expect(
            hostValuesToBootstrapData({
                workspaceId: "ws-1",
                settings,
                user: { ref: idRef("user-2"), login: "user-2" },
            }),
        ).toEqual({
            user: {
                firstName: "user-2",
                lastName: "",
                email: "",
                uri: "/api/v1/entities/users/user-2",
                domain: "",
                loginMD5: "user-2",
                language: "en-US",
                stashedProjectUri: "/gdc/projects/ws-1",
                separators: { thousand: ",", decimal: "." },
                formatLocale: undefined,
                created: "",
                companyName: "",
                permissions: [],
            },
            uiSettings: {
                ...UI_SETTINGS_CONSTANTS,
                organizationName: "",
                organizationId: undefined,
                logoUrl: "",
                faviconUrl: "",
                appleTouchIconUrl: "",
                isBranded: false,
            },
            project: PROJECT,
            bear: {},
            tiger: { organizationEntitlements: [], isOrganizationAdmin: false },
            colorPalette: undefined,
            theme: undefined,
            agGridToken: undefined,
        });
    });
});

describe("platformContextToBootstrapData", () => {
    it("maps the platform context to the same bootstrap data as the host values", () => {
        const ctx = {
            currentWorkspaceId: "ws-1",
            preferredLocale: "de-DE",
            user: USER,
            userSettings: { userId: "user-1", locale: "en-US" },
            workspaceSettings: SETTINGS,
            organization: { id: "org-1", title: "Org" },
            organizationPermissions: { canManageOrganization: true },
            entitlements: ENTITLEMENTS,
            whiteLabeling: { enabled: true, logoUrl: "logo.svg", faviconUrl: "favicon.ico" },
            colorPalette: COLOR_PALETTE,
        } as unknown as IPlatformContext;

        expect(platformContextToBootstrapData(ctx)).toEqual(hostValuesToBootstrapData(HOST_VALUES));
    });
});
