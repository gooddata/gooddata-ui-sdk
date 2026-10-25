// (C) 2026 GoodData Corporation

import { type UnknownAction } from "redux";
import { describe, expect, it } from "vitest";

import { type IColorPalette, type ITheme, type IWorkspacePermissions } from "@gooddata/sdk-model";

import {
    type IBootstrapData,
    appFinishedLoading,
    bootstrapError,
    clearInsightContent,
    refreshSessionId,
    resetApplication,
    setColorPalette,
    setIntlMessages,
    setLocale,
    setTheme,
} from "../actions/app_context_actions.js";
import { setEmbedded } from "../actions/embedded_actions.js";
import { setFeatureFlagsItems } from "../actions/featureFlags_actions.js";
import { workspacePermissionsSuccess } from "../actions/permissions_actions.js";
import { setHostedComponentMode } from "../appMode/appMode.js";
import { ActionTypeKeys } from "../constants/actions.js";
import { NOT_AUTHENTICATED_ERROR } from "../constants/errors.js";
import { bootstrapData as bootstrapDataSelector, getProjectId } from "../selectors/bootstrap_selector.js";
import { getFeatureFlags } from "../selectors/feature_flag_selector.js";
import { getIntlMessagesForLocale, getLocale } from "../selectors/intl_selector.js";
import { getIsEmbedded, getViewport } from "../selectors/meta_selector.js";
import { workspacePermissions } from "../selectors/permissions_selector.js";
import { themeSelector } from "../selectors/theme_selector.js";
import { getColorPalette } from "../store/app_context/app_context_selectors.js";
import {
    buildApplicationResetCarrier,
    wholeApplicationReset,
} from "../store/app_context/application_reset_events.js";
import { setRemovedItems } from "../store/bucket_notifications/bucket_notifications_actions.js";
import { getRemovedItems } from "../store/bucket_notifications/bucket_notifications_selector.js";
import { routeChanged } from "../store/router/router_actions.js";
import { buildNextRoute, shouldResetOnNavigation } from "../store/router/router_helpers.js";
import { getRouteState } from "../store/router/router_selectors.js";
import { type IAppState } from "../store/types.js";
import { getVisualizationClassesState } from "../store/visualization_classes/visualization_classes_selectors.js";
import { userSettings } from "../tests/feature_flags.test.helpers.js";
import { getInitializedState } from "../tests/state.test.helpers.js";
import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "../utils/translations.js";

import { rootReducer } from "./root_reducer.js";

/**
 * Characterization suite for the app_context / featureFlags / permissions domains. Every test drives
 * the FULL root chain (rootReducer), so if one of these assertions has to move, that is a
 * deliberate, reviewed behavior change.
 */

const dispatch = (state: IAppState, action: UnknownAction): IAppState => rootReducer(state, action);

const dispatchAll = (state: IAppState, actions: UnknownAction[]): IAppState =>
    actions.reduce(dispatch, state);

const windowInfo = { viewport: "800x600", pixelRatio: 2, isMobileDevice: false };

let bootstrapCount = 0;
const bootstrap = (data: Partial<IBootstrapData>, info: typeof windowInfo = windowInfo) => ({
    // hand-built on purpose: the action SHAPE is part of the frozen contract, and the
    // creator measures the real window — deterministic device info makes the pin exact.
    // `sessionId` JOINED the shape: the creator's prepare generates it so the
    // single-owner sessionId reducer stays pure (store/app_context/session_id_reducer.ts).
    type: ActionTypeKeys.BOOTSTRAP_DATA,
    payload: { data: data as IBootstrapData, windowInfo: info, sessionId: `session-${++bootstrapCount}` },
});

// the LOCATION_CHANGED flow is trigger -> router saga -> routeChanged (+ conditional
// wholeApplicationReset); this replicates the worker's exact synchronous prefix
// (sagas/router_sagas.ts#locationChanged) so the characterization keeps driving real dispatches
const navigate = (state: IAppState, hash: string): IAppState => {
    const previousRoute = getRouteState(state);
    const route = buildNextRoute(hash, previousRoute);
    const next = dispatch(state, routeChanged(route, previousRoute));
    if (!shouldResetOnNavigation(route, previousRoute)) {
        return next;
    }
    return dispatch(
        next,
        wholeApplicationReset({
            reset: buildApplicationResetCarrier(getVisualizationClassesState(next)),
        }),
    );
};

const bootstrapPayload = (): IBootstrapData =>
    ({
        user: { language: "de-DE" },
        project: { identifier: "myProject", uri: "/gdc/projects/myProject", title: "My Project" },
        colorPalette: [{ guid: "01", fill: { r: 255, g: 0, b: 0 } }],
        theme: { palette: { primary: { base: "#14b2e2" } } },
    }) as unknown as IBootstrapData;

describe("app_context domain characterization", () => {
    describe("BOOTSTRAP_DATA fan-out", () => {
        it("stores the bootstrap payload verbatim at the root bootstrapData branch", () => {
            const data = bootstrapPayload();

            const next = dispatch(getInitializedState(), bootstrap(data));

            expect(next.bootstrapData).toBe(data);
        });

        it("stores the project identifier at the root projectId branch", () => {
            const next = dispatch(getInitializedState(), bootstrap(bootstrapPayload()));

            expect(next.projectId).toBe("myProject");
        });

        it("leaves projectId empty when bootstrap carries no project", () => {
            const next = dispatch(getInitializedState(), bootstrap({ ...bootstrapPayload(), project: null }));

            expect(next.projectId == null).toBe(true);
        });

        it("stores the color palette verbatim at the root colorPalette branch", () => {
            const data = bootstrapPayload();

            const next = dispatch(getInitializedState(), bootstrap(data));

            expect(next.colorPalette).toBe(data.colorPalette);
        });

        it("stores the host-provided theme, defaulting to null when absent", () => {
            const data = bootstrapPayload();

            const withTheme = dispatch(getInitializedState(), bootstrap(data));
            expect(withTheme.appState.meta.theme).toBe(data.theme);

            const withoutTheme = dispatch(getInitializedState(), bootstrap({ ...data, theme: undefined }));
            expect(withoutTheme.appState.meta.theme).toBeNull();
        });

        it("stores the validated bootstrap locale", () => {
            const next = dispatch(getInitializedState(), bootstrap(bootstrapPayload()));

            expect(next.appState.intl.locale).toBe("de-DE");
        });

        it("falls back to the default locale when the bootstrap language is unsupported", () => {
            const data = { ...bootstrapPayload(), user: { language: "xx-XX" } } as IBootstrapData;

            const next = dispatch(getInitializedState(), bootstrap(data));

            expect(next.appState.intl.locale).toBe(DEFAULT_LANGUAGE);
        });

        it("stores the window device info", () => {
            const next = dispatch(getInitializedState(), bootstrap(bootstrapPayload()));

            expect(next.appState.meta.device.viewport).toBe("800x600");
            expect(next.appState.meta.device.pixelRatio).toBe(2);
            expect(next.appState.meta.device.isMobile).toBe(false);
        });

        it("assigns a fresh insight session id on every bootstrap", () => {
            const first = dispatch(getInitializedState(), bootstrap(bootstrapPayload()));
            const second = dispatch(first, bootstrap(bootstrapPayload()));

            expect(typeof first.appState.sessionId).toBe("string");
            expect(second.appState.sessionId).not.toBe(first.appState.sessionId);
        });

        it("clears previously stored bootstrap errors", () => {
            const error = { type: NOT_AUTHENTICATED_ERROR };
            const failed = dispatch(getInitializedState(), bootstrapError("proj", error));
            expect(failed.appState.errors).toEqual([error]);

            const recovered = dispatch(failed, bootstrap(bootstrapPayload()));

            expect(recovered.appState.errors).toEqual([]);
        });
    });

    describe("meta flags", () => {
        it("SET_HOSTED_COMPONENT_MODE stores the hosted-component flag", () => {
            const next = dispatch(getInitializedState(), setHostedComponentMode(true));

            expect(next.appState.meta.isHostedComponent).toBe(true);
        });

        it("SET_EMBEDDED stores the embedded flag", () => {
            const next = dispatch(getInitializedState(), setEmbedded(true));

            expect(next.appState.meta.isEmbedded).toBe(true);
        });
    });

    describe("locale & intl messages", () => {
        it("SET_LOCALE stores the locale verbatim, without validation", () => {
            const next = dispatch(getInitializedState(), setLocale("xx-XX"));

            expect(next.appState.intl.locale).toBe("xx-XX");
        });

        it("SET_INTL_MESSAGES merges the locale bundle over the existing map", () => {
            const bundle = { "some.key": "some value" };

            const next = dispatch(getInitializedState(), setIntlMessages("de-DE", bundle));

            const messages = next.appState.intl.messages;
            expect(messages["de-DE"]).toBe(bundle);
            expect(messages[DEFAULT_LANGUAGE]).toBe(DEFAULT_MESSAGES[DEFAULT_LANGUAGE]);
        });

        it("SET_INTL_MESSAGES keeps bundles of previously loaded locales", () => {
            const german = { "some.key": "german" };
            const french = { "some.key": "french" };

            const next = dispatchAll(getInitializedState(), [
                setIntlMessages("de-DE", german),
                setIntlMessages("fr-FR", french),
            ]);

            const messages = next.appState.intl.messages;
            expect(messages["de-DE"]).toBe(german);
            expect(messages["fr-FR"]).toBe(french);
        });
    });

    describe("theme & color palette setters", () => {
        it("SET_THEME stores the theme, normalizing undefined to null", () => {
            const theme = { palette: { primary: { base: "#000000" } } } as ITheme;

            const withTheme = dispatch(getInitializedState(), setTheme(theme));
            expect(withTheme.appState.meta.theme).toBe(theme);

            const cleared = dispatch(withTheme, setTheme(undefined));
            expect(cleared.appState.meta.theme).toBeNull();
        });

        it("SET_COLOR_PALETTE stores the palette verbatim and accepts clearing", () => {
            const palette: IColorPalette = [{ guid: "02", fill: { r: 0, g: 255, b: 0 } }];

            const withPalette = dispatch(getInitializedState(), setColorPalette(palette));
            expect(withPalette.colorPalette).toBe(palette);

            const cleared = dispatch(withPalette, setColorPalette(undefined));
            expect(cleared.colorPalette == null).toBe(true);
        });
    });

    describe("session id refresh", () => {
        it("STORE/REFRESH_SESSION_ID assigns a fresh session id and touches nothing else", () => {
            const bootstrapped = dispatch(getInitializedState(), bootstrap(bootstrapPayload()));

            const refreshed = dispatch(bootstrapped, refreshSessionId());

            expect(refreshed.appState.sessionId).not.toBe(bootstrapped.appState.sessionId);
            expect(refreshed.bootstrapData).toBe(bootstrapped.bootstrapData);
            expect(refreshed.projectId).toBe(bootstrapped.projectId);
            expect(refreshed.appState.intl.locale).toBe(bootstrapped.appState.intl.locale);
        });
    });

    describe("feature flags & workspace permissions", () => {
        it("STORE/FEATURE_FLAGS_DATA stores a shallow copy of the settings", () => {
            const configs = userSettings({ enableSomething: true, someLimit: 42 });

            const next = dispatch(getInitializedState(), setFeatureFlagsItems(configs));

            expect(next.featureFlags).toEqual(configs);
        });

        it("WORKSPACE_PERMISSIONS_SUCCESS stores the permissions", () => {
            const permissions = { canCreateVisualization: true } as IWorkspacePermissions;

            const next = dispatch(getInitializedState(), workspacePermissionsSuccess("w1", permissions));

            expect(next.workspacePermissions).toEqual(permissions);
        });
    });

    describe("router-triggered whole-app reset (resetWholeApplication path)", () => {
        const removedItems = { measures: 1, measureValueFilters: 42, rankingFilter: true };

        // the hash carries no workspace prefix (the host owns it): the whole-app reset on
        // navigation fires when the open report is cleared back to the default one
        const navigatedState = () =>
            dispatch(
                navigate(dispatch(getInitializedState(), bootstrap(bootstrapPayload())), "#/report1/edit"),
                setRemovedItems(removedItems),
            );

        it("refreshes the insight session id when the report is cleared to the default one", () => {
            const before = navigatedState();

            const after = navigate(before, "#/");

            expect(after.appState.sessionId).not.toBe(before.appState.sessionId);
        });

        it("resets bucket-notification removed items when the report is cleared to the default one", () => {
            const before = navigatedState();
            expect(getRemovedItems(before)).toEqual(removedItems);

            const after = navigate(before, "#/");

            expect(getRemovedItems(after)).toBeNull();
        });

        it("keeps the session id and removed items on navigation between reports", () => {
            const before = navigatedState();

            const after = navigate(before, "#/report2/edit");

            expect(after.appState.sessionId).toBe(before.appState.sessionId);
            expect(getRemovedItems(after)).toEqual(removedItems);
        });
    });

    // The app-context branches deliberately SURVIVE an insight-level reset. Pinned here so the
    // mini-branch slices cannot silently acquire a reset of their own.
    describe("insight-level reset leaves the app-context branches alone", () => {
        const bootstrapped = () => dispatch(getInitializedState(), bootstrap(bootstrapPayload()));

        it.each([
            ["RESET_APPLICATION", resetApplication()],
            ["CLEAR_INSIGHT_CONTENT", clearInsightContent()],
        ])("preserves bootstrapData/projectId/colorPalette/locale/appReady across %s", (_name, action) => {
            const before = dispatchAll(bootstrapped(), [appFinishedLoading()]);

            const after = dispatch(before, action);

            expect(after.bootstrapData).toBe(before.bootstrapData);
            expect(after.projectId).toBe(before.projectId);
            expect(after.colorPalette).toBe(before.colorPalette);
            expect(after.appState.intl.locale).toBe(before.appState.intl.locale);
            expect(after.appState.appReady).toBe(true);
        });

        it("preserves stored bootstrap errors across RESET_APPLICATION", () => {
            const error = { type: NOT_AUTHENTICATED_ERROR };
            const before = dispatch(getInitializedState(), bootstrapError("proj", error));

            const after = dispatch(before, resetApplication());

            expect(after.appState.errors).toEqual([error]);
        });
    });

    // RESET_FOR_PLUGGABLE_MOUNT short-circuits the whole chain and returns the pristine
    // initialState, which deliberately does NOT carry slice-owned subtrees (they self-initialize
    // via _infra/lift_slice). This pins that the
    // gap is unobservable: every reader defaults, and the branches materialize on the next action.
    describe("RESET_FOR_PLUGGABLE_MOUNT (host unmount)", () => {
        const resetState = () =>
            dispatch(
                dispatchAll(getInitializedState(), [bootstrap(bootstrapPayload()), appFinishedLoading()]),
                { type: ActionTypeKeys.RESET_FOR_PLUGGABLE_MOUNT },
            );

        it("serves every domain's default through its selectors right after the reset", () => {
            const after = resetState();

            expect(getLocale(after)).toBe(DEFAULT_LANGUAGE);
            expect(getIntlMessagesForLocale(after)).toBe(DEFAULT_MESSAGES[DEFAULT_LANGUAGE]);
            expect(getIsEmbedded(after)).toBe(false);
            expect(getViewport(after)).toBe("0x0");
            expect(themeSelector(after)).toBeUndefined();
            expect(bootstrapDataSelector(after)).toBeNull();
            expect(getProjectId(after)).toBeUndefined();
            expect(getColorPalette(after)).toBeNull();
            expect(getFeatureFlags(after)).toEqual({});
            expect(workspacePermissions(after)).toBeNull();
        });

        it("re-materializes the slice branches on the next dispatched action", () => {
            const remounted = dispatch(resetState(), setEmbedded(true));

            expect(remounted.appState.meta.isEmbedded).toBe(true);
            // the sibling leaves of the same shared containers are seeded too
            expect(remounted.appState.intl.locale).toBe(DEFAULT_LANGUAGE);
            expect(remounted.appState.appReady).toBe(false);
            expect(remounted.appState.errors).toEqual([]);
        });
    });
});
