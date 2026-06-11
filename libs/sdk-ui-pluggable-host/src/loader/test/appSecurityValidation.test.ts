// (C) 2026 GoodData Corporation

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    type LocalPluggableApplicationRegistryItem,
    type RemotePluggableApplicationRegistryItem,
} from "@gooddata/sdk-model";
import { type IPlatformContext, type IPluggableApp } from "@gooddata/sdk-pluggable-application-model";

import {
    BUILD_FRESHNESS_WINDOW_MS,
    isSecuredRemoteUrl,
    validateAppSecurity,
} from "../appSecurityValidation.js";

const ORG_ID = "org-allowed";
const ORG_ID_OTHER = "org-other";
const NOW = 1_700_000_000_000;

const SECURED_URL = "https://demo-dashboard-plugins.gooddata.com/apps/gdc-sample-dashboard/remoteEntry.js";
const SAME_ORIGIN_URL = "https://localhost/organization/remotes/gdc-home-ui/remoteEntry.js";

function securedRemoteApp(): RemotePluggableApplicationRegistryItem {
    return {
        apiVersion: "1.0",
        id: "gdc-sample-dashboard",
        applicationScope: "organization",
        remote: {
            url: SECURED_URL,
            scope: "gdc_sample_dashboard",
            module: "./pluggableApp",
            routeBase: "/sample-dashboard",
        },
    } as RemotePluggableApplicationRegistryItem;
}

function sameOriginRemoteApp(): RemotePluggableApplicationRegistryItem {
    return {
        apiVersion: "1.0",
        id: "gdc-home-ui",
        applicationScope: "organization",
        remote: {
            url: SAME_ORIGIN_URL,
            scope: "gdc_home_ui",
            module: "./pluggableApp",
            routeBase: "/home",
        },
    } as RemotePluggableApplicationRegistryItem;
}

function localApp(): LocalPluggableApplicationRegistryItem {
    return {
        apiVersion: "1.0",
        id: "gdc-local",
        applicationScope: "organization",
        local: { routeBase: "/local" },
    } as LocalPluggableApplicationRegistryItem;
}

function loadedApp(overrides: Partial<IPluggableApp> = {}): IPluggableApp {
    return {
        mount: vi.fn(),
        allowedOrganizations: [ORG_ID],
        buildTimestamp: NOW - 1000,
        ...overrides,
    };
}

// Note: do not give `orgId` a default — the default would fire for `ctx(undefined)`,
// silently re-introducing the org id we want to exclude. Each caller passes the value
// they actually want.
function ctx(orgId: string | undefined): IPlatformContext {
    return { organization: orgId ? { id: orgId } : undefined } as IPlatformContext;
}

describe("isSecuredRemoteUrl", () => {
    beforeEach(() => {
        Object.defineProperty(window, "location", {
            configurable: true,
            value: { hostname: "localhost", origin: "https://localhost" },
        });
    });

    it("returns true for the demo plugins bucket hostname", () => {
        expect(isSecuredRemoteUrl(SECURED_URL)).toBe(true);
    });

    it("returns false for same-origin remote URLs", () => {
        expect(isSecuredRemoteUrl(SAME_ORIGIN_URL)).toBe(false);
        expect(isSecuredRemoteUrl("/organization/remotes/gdc-home-ui/remoteEntry.js")).toBe(false);
    });

    it("returns false for unparseable URLs and undefined", () => {
        expect(isSecuredRemoteUrl(undefined)).toBe(false);
        expect(isSecuredRemoteUrl("")).toBe(false);
        expect(isSecuredRemoteUrl("::not a url::")).toBe(false);
    });
});

describe("validateAppSecurity", () => {
    beforeEach(() => {
        Object.defineProperty(window, "location", {
            configurable: true,
            value: { hostname: "localhost", origin: "https://localhost" },
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("skips validation for local registry items regardless of metadata", () => {
        expect(
            validateAppSecurity(localApp(), { mount: vi.fn() } as IPluggableApp, ctx(ORG_ID), NOW),
        ).toBeUndefined();
    });

    it("skips validation for same-origin remote URLs", () => {
        expect(
            validateAppSecurity(sameOriginRemoteApp(), { mount: vi.fn() } as IPluggableApp, ctx(ORG_ID), NOW),
        ).toBeUndefined();
    });

    it("returns metadata-missing when allowedOrganizations is absent", () => {
        const loaded = loadedApp({ allowedOrganizations: undefined });
        expect(validateAppSecurity(securedRemoteApp(), loaded, ctx(ORG_ID), NOW)).toEqual({
            kind: "metadata-missing",
        });
    });

    it("returns metadata-missing when buildTimestamp is absent", () => {
        const loaded = loadedApp({ buildTimestamp: undefined });
        expect(validateAppSecurity(securedRemoteApp(), loaded, ctx(ORG_ID), NOW)).toEqual({
            kind: "metadata-missing",
        });
    });

    it("returns metadata-missing when buildTimestamp is NaN (non-finite)", () => {
        const loaded = loadedApp({ buildTimestamp: Number.NaN });
        expect(validateAppSecurity(securedRemoteApp(), loaded, ctx(ORG_ID), NOW)).toEqual({
            kind: "metadata-missing",
        });
    });

    it("returns metadata-missing when buildTimestamp is in the future (would yield negative age)", () => {
        // A future timestamp produces a negative `ageMs`, which is never > the freshness window
        // and would otherwise silently bypass the expiry check. Fail closed — treat it as bad metadata.
        const loaded = loadedApp({ buildTimestamp: NOW + 1 });
        expect(validateAppSecurity(securedRemoteApp(), loaded, ctx(ORG_ID), NOW)).toEqual({
            kind: "metadata-missing",
        });
    });

    it("accepts a buildTimestamp exactly equal to now", () => {
        const loaded = loadedApp({ buildTimestamp: NOW });
        expect(validateAppSecurity(securedRemoteApp(), loaded, ctx(ORG_ID), NOW)).toBeUndefined();
    });

    it("returns organization-not-allowed when the org is not in the allowlist", () => {
        expect(validateAppSecurity(securedRemoteApp(), loadedApp(), ctx(ORG_ID_OTHER), NOW)).toEqual({
            kind: "organization-not-allowed",
        });
    });

    it("returns organization-not-allowed when the allowlist is empty", () => {
        expect(
            validateAppSecurity(
                securedRemoteApp(),
                loadedApp({ allowedOrganizations: [] }),
                ctx(ORG_ID),
                NOW,
            ),
        ).toEqual({ kind: "organization-not-allowed" });
    });

    it("returns organization-not-allowed when there is no organization in the context", () => {
        expect(validateAppSecurity(securedRemoteApp(), loadedApp(), ctx(undefined), NOW)).toEqual({
            kind: "organization-not-allowed",
        });
    });

    it("accepts a build at exactly the freshness boundary", () => {
        const loaded = loadedApp({ buildTimestamp: NOW - BUILD_FRESHNESS_WINDOW_MS });
        expect(validateAppSecurity(securedRemoteApp(), loaded, ctx(ORG_ID), NOW)).toBeUndefined();
    });

    it("rejects a build one millisecond past the freshness boundary", () => {
        const loaded = loadedApp({ buildTimestamp: NOW - BUILD_FRESHNESS_WINDOW_MS - 1 });
        expect(validateAppSecurity(securedRemoteApp(), loaded, ctx(ORG_ID), NOW)).toEqual({
            kind: "build-expired",
            ageMs: BUILD_FRESHNESS_WINDOW_MS + 1,
        });
    });

    it("returns undefined for a fresh build with a permitted organization", () => {
        expect(validateAppSecurity(securedRemoteApp(), loadedApp(), ctx(ORG_ID), NOW)).toBeUndefined();
    });
});
