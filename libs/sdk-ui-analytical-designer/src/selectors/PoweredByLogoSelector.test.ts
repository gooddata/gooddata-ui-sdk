// (C) 2007-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { initialState } from "../reducers/initial_state.js";
import { withRouteQuery } from "../tests/route.test.helpers.js";
import { withAppState, withMeta, withRoot } from "../tests/state_builder.test.helpers.js";

import { Permissions } from "./permissions_selector.js";
import { isPoweredByGDLogoPresent, poweredByGDLogoLink } from "./PoweredByLogoSelector.js";

interface IParameters {
    isEmbedded: boolean;
    platformEdition: string;
    isAppReady: boolean;
    /** the raw URL query value the route carries — compared against "true" by the selector */
    isEmbeddedFromKD?: string;
}

const uTMParameters = "utm_medium=platform&utm_source=product&utm_content=logo";
const goodDataHomePage = "https://gooddata.com/?" + uTMParameters;
const goodDataHelpPage = "https://help.gooddata.com/pages/viewpage.action?pageId=86789085&" + uTMParameters;

const getStateForIsAdmin = (isAdmin: boolean) =>
    withRoot(initialState, {
        workspacePermissions: {
            ...initialState.workspacePermissions,
            [Permissions.CAN_MANAGE_PROJECT]: isAdmin,
        },
    });

const getState = ({ isEmbedded, platformEdition, isAppReady, isEmbeddedFromKD }: IParameters) =>
    withRouteQuery(
        withAppState(
            withRoot(withMeta(initialState, { isEmbedded: isEmbedded }), {
                featureFlags: {
                    platformEdition,
                } as never,
            }),
            { appReady: isAppReady },
        ),
        { isEmbeddedFromKD },
    );

describe("poweredByGDLogoLink", () => {
    it("should return GoodData home page with UTM parameters if the user is not an 'admin'", () => {
        const state = getStateForIsAdmin(false);
        expect(poweredByGDLogoLink(state)).toBe(goodDataHomePage);
    });
    it("should return GoodData help page with UTM parameters if the user is an 'admin'", () => {
        const state = getStateForIsAdmin(true);
        expect(poweredByGDLogoLink(state)).toBe(goodDataHelpPage);
    });
});

describe("PowerByGDLogoSelector", () => {
    it.each([
        [
            false,
            "application is not embedded",
            {
                isEmbedded: false,
                platformEdition: "free",
                isAppReady: true,
            },
        ],
        [
            false,
            "application is wrong tier",
            {
                isEmbedded: true,
                platformEdition: "enterprise",
                isAppReady: true,
            },
        ],
        [
            false,
            "application is not ready",
            {
                isEmbedded: true,
                platformEdition: "free",
                isAppReady: false,
            },
        ],
        [
            true,
            "application is embedded, ready and free tier",
            {
                isEmbedded: true,
                platformEdition: "free",
                isAppReady: true,
            },
        ],
        [
            false,
            "application is embedded from the embedded KD",
            {
                isEmbedded: true,
                platformEdition: "free",
                isAppReady: true,
                isEmbeddedFromKD: "true",
            },
        ],
        [
            true,
            "application is embedded from the KD",
            {
                isEmbedded: true,
                platformEdition: "free",
                isAppReady: true,
                isEmbeddedFromKD: "false",
            },
        ],
    ])("returns %s if %s", (expectedResult: boolean, _: string, parameters: IParameters) => {
        expect(isPoweredByGDLogoPresent(getState(parameters))).toBe(expectedResult);
    });
});
