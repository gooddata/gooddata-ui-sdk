// (C) 2007-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";
import $ from "jquery";
import { v4 as uuid } from "uuid";

import { type ApiEntitlement } from "@gooddata/sdk-backend-tiger";
import { type IColorPalette, type ITheme } from "@gooddata/sdk-model";
import { type ISeparators } from "@gooddata/sdk-ui";

import { ActionTypeKeys } from "../constants/actions.js";
import { type IBearBootstrap } from "../typings/bear/bearTypes.js";
import { isMobile } from "../utils/browser_detect.js";

export interface IExternalScripts {
    walkMe: string;
    walkMeEnvironment: string;
    includeTrialSnippet: string;
}

// In the future, split to submodules
export interface IBootstrapData {
    mapboxToken?: string;
    agGridToken?: string;
    maxZoomLevel?: number | null;

    // User info
    user: {
        firstName: string;
        lastName: string;
        email: string;
        uri: string;
        domain: string;
        loginMD5: string;
        language: string;
        stashedProjectUri: string;
        separators: ISeparators;
        created: string;
        companyName: string;
        formatLocale?: string;
        permissions?: string[];
    };

    // Specific ui settings
    uiSettings: {
        // Texts
        // Optional: in pluggable mode the host owns the tab title (and its brand segment), so the
        // pluggable bootstrap does not supply applicationTitle. Standalone still sets it.
        applicationTitle?: string;
        organizationName: string;
        organizationId?: string;
        // UI Flags
        displayProjects: boolean;
        displayAccountPage: boolean;

        // Logo urls
        logoUrl: string;
        faviconUrl: string;
        appleTouchIconUrl: string;

        // Colors
        activeColor?: string;
        headerColor?: string;
        headerTextColor?: string;

        // Branding
        documentationUrl?: string;
        isBranded: boolean;
        supportEmail?: string;
        supportForumUrl?: string;

        // SSO info
        ssoLogoutUrl?: string;
        ssoExpiredUrl?: string;
        ssoUnauthorizedUrl?: string;
        showSSOCustomUnauthorizedLoginPage?: boolean;
    };

    // Current project info
    project: null | {
        identifier: string;
        uri: string;
        title: string;
        templateUrl: string;
        timezoneOffset: number;
        description: string;
        defaultDashboard: string;
        defaultDashboardTab: string;
        analyticalDashboards: IBearBootstrap["bootstrapResource"]["current"]["analyticalDashboards"];
    };

    // External scripts to load
    externalScripts?: IExternalScripts;

    // Color palette
    colorPalette?: IColorPalette;

    // Bear specific data
    bear: {
        // Bear client still requires this to be able to update the stashed project
        profileSetting?: IBearBootstrap["bootstrapResource"]["profileSetting"];
        // When this is null, user has not access to the workspace
        // (please remove this if you know about better way, how to check workspace access)
        projectPermissions?: IBearBootstrap["bootstrapResource"]["current"]["projectPermissions"];
    };

    // Tiger specific data
    tiger: {
        isOrganizationAdmin?: boolean;
        organizationExpiredDate?: string;
        organizationEntitlements?: ApiEntitlement[];
    };

    // Host-provided theme. Populated by the pluggable wrapper.
    theme?: ITheme;
}

export type AppContextActions =
    | IAppLoadingAction
    | IResetApplicationAction
    | IClearInsightContentAction
    | IBootstrapErrorAction
    | IBootstrapDataAction
    | IRefreshSessionIdAction
    | ReturnType<typeof setIntlMessages>
    | ReturnType<typeof setLocale>
    | ISetThemeAction
    | ISetColorPaletteAction;

export const bootstrapData = createAction(
    ActionTypeKeys.BOOTSTRAP_DATA,
    (data: IBootstrapData, windowInstance = window) => {
        const $window = $(windowInstance);
        const viewportWidth = $window.width();
        const viewportHeight = $window.height();

        const windowInfo = {
            viewport: `${viewportWidth}x${viewportHeight}`,
            pixelRatio: windowInstance.devicePixelRatio || 1,
            isMobileDevice: isMobile(),
        };

        return {
            payload: {
                data,
                windowInfo,
                // a bootstrap starts a fresh session — the id is generated HERE so the
                // sessionId reducer stays pure (store/app_context/session_id_reducer.ts)
                sessionId: uuid(),
            },
        };
    },
);

/** Kept for consumers that type case reducers / saga handlers by the action shape. */
export type IBootstrapDataAction = ReturnType<typeof bootstrapData>;

export type BootstrapError = {
    type: string;
};

export const bootstrapError = createAction(
    ActionTypeKeys.BOOTSTRAP_ERROR,
    (projectId: string, error: BootstrapError) => ({ payload: { projectId, error } }),
);

export type IBootstrapErrorAction = ReturnType<typeof bootstrapError>;

export const appStartedLoading = createAction(ActionTypeKeys.APP_READINESS_CHANGE, () => ({
    payload: { isReady: false },
}));

export const appFinishedLoading = createAction(ActionTypeKeys.APP_READINESS_CHANGE, () => ({
    payload: { isReady: true },
}));

export type IAppLoadingAction = ReturnType<typeof appStartedLoading>;

export const appFinishedSuccessfulInitialization = createAction(
    ActionTypeKeys.APP_FINISHED_SUCCESSFUL_INITIALIZATION,
    (isEmptyReport: boolean) => ({ payload: { isEmptyReport } }),
);

export type IAppFinishedInitialization = ReturnType<typeof appFinishedSuccessfulInitialization>;

export const resetApplication = createAction(ActionTypeKeys.RESET_APPLICATION);

export type IResetApplicationAction = ReturnType<typeof resetApplication>;

export const clearInsightContent = createAction(ActionTypeKeys.CLEAR_INSIGHT_CONTENT);

export type IClearInsightContentAction = ReturnType<typeof clearInsightContent>;

export const loadExternalScripts = createAction(
    ActionTypeKeys.LOAD_EXTERNAL_SCRIPTS_REQUESTED,
    (scripts: IExternalScripts) => ({ payload: { scripts } }),
);

export type ILoadExternalScriptsAction = ReturnType<typeof loadExternalScripts>;

// the fresh id is generated HERE so the sessionId reducer stays pure
export const refreshSessionId = createAction(ActionTypeKeys.STORE_REFRESH_SESSION_ID, () => ({
    payload: { sessionId: uuid() },
}));

export type IRefreshSessionIdAction = ReturnType<typeof refreshSessionId>;

export const setIntlMessages = createAction(
    ActionTypeKeys.SET_INTL_MESSAGES,
    (locale: string, messages: Record<string, string>) => ({ payload: { locale, messages } }),
);

export const setLocale = createAction(ActionTypeKeys.SET_LOCALE, (locale: string) => ({
    payload: { locale },
}));

/** Kept for the public index export — the creator is a createAction. */
export type ISetLocaleAction = ReturnType<typeof setLocale>;

// `theme?:` / `colorPalette?:` are deliberately OPTIONAL parameters rather than
// `T | undefined` unions. Both are part of the package's public API (src/index.ts) and are
// called by the pluggable module with a possibly-absent host value. This package compiles
// with `strictNullChecks: false`, so the declaration emitter — which has to SYNTHESIZE the
// inferred createAction type — strips `undefined` out of the union and would publish
// `[theme: ITheme]`, breaking strict-null consumers. Parameter optionality is a flag on the
// parameter, not a union member, so it survives that erasure. (The pre-4.4 hand-written
// creators were unaffected: declaration emit prints EXPLICIT annotations verbatim.)
export const setTheme = createAction(ActionTypeKeys.SET_THEME, (theme?: ITheme) => ({
    payload: { theme },
}));

export type ISetThemeAction = ReturnType<typeof setTheme>;

export const setColorPalette = createAction(
    ActionTypeKeys.SET_COLOR_PALETTE,
    (colorPalette?: IColorPalette) => ({ payload: { colorPalette } }),
);

export type ISetColorPaletteAction = ReturnType<typeof setColorPalette>;
