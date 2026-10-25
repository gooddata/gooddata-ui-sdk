// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IBootstrapData, type bootstrapData } from "../../actions/app_context_actions.js";
import { setEmbedded, setReadOnlyMode } from "../../actions/embedded_actions.js";
import { isHostedComponentSelector, setHostedComponentMode } from "../../appMode/appMode.js";
import { ActionTypeKeys } from "../../constants/actions.js";
import { combinedRootReducer } from "../../reducers/combined_root_reducer.js";
import { initialState } from "../../reducers/initial_state.js";
import {
    getDevicePixelRatio,
    getIsEmbedded,
    getIsMobileDevice,
    getViewport,
} from "../../selectors/meta_selector.js";
import { themeSelector } from "../../selectors/theme_selector.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";

import { getIsReadOnlyMode } from "./embedding_selectors.js";

const bootstrap = (
    windowInfo: Partial<ReturnType<typeof bootstrapData>["payload"]["windowInfo"]>,
    theme?: IBootstrapData["theme"],
) => ({
    type: ActionTypeKeys.BOOTSTRAP_DATA,
    payload: { data: { user: {}, theme }, windowInfo },
});

describe("embedding store (appState.meta mini-branch mounts)", () => {
    it("self-initializes with the meta defaults", () => {
        const state = combinedRootReducer(getInitializedState(), { type: "@@INIT" });

        expect(getViewport(state)).toBe("0x0");
        expect(getDevicePixelRatio(state)).toBe(0);
        expect(getIsMobileDevice(state)).toBe(false);
        expect(getIsEmbedded(state)).toBe(false);
        expect(isHostedComponentSelector(state)).toBe(false);
        expect(themeSelector(state)).toBeUndefined();
    });

    it("serves defaults through the selectors before the slices ever reduced", () => {
        expect(getViewport(initialState)).toBe("0x0");
        expect(getIsEmbedded(initialState)).toBe(false);
    });

    it("BOOTSTRAP_DATA stores the device info", () => {
        const state = combinedRootReducer(
            getInitializedState(),
            bootstrap({ viewport: "800x600", pixelRatio: 2, isMobileDevice: true }),
        );

        expect(getViewport(state)).toBe("800x600");
        expect(getDevicePixelRatio(state)).toBe(2);
        expect(getIsMobileDevice(state)).toBe(true);
    });

    it("BOOTSTRAP_DATA stores the host theme, defaulting to null", () => {
        const theme = { palette: { primary: { base: "#14b2e2" } } };

        const withTheme = combinedRootReducer(getInitializedState(), bootstrap({}, theme));
        expect(themeSelector(withTheme)).toBe(theme);

        const withoutTheme = combinedRootReducer(getInitializedState(), bootstrap({}));
        expect(themeSelector(withoutTheme)).toBeUndefined();
    });

    it("stores the mode flags of the SET_* actions", () => {
        let state = combinedRootReducer(getInitializedState(), setEmbedded(true));
        state = combinedRootReducer(state, setHostedComponentMode(true));

        expect(getIsEmbedded(state)).toBe(true);
        expect(isHostedComponentSelector(state)).toBe(true);
    });

    it("keeps sibling meta leaves owned by other domains intact", () => {
        const state = combinedRootReducer(
            getInitializedState(),
            bootstrap({ viewport: "800x600", pixelRatio: 2, isMobileDevice: false }),
        );

        // postMessageContext (postMessage domain) survives the leaf-scoped device write
        expect(state.appState.meta.postMessageContext).toBeNull();
    });

    it("keeps the root reference on unrelated actions (identity short-circuit)", () => {
        const state = getInitializedState();

        expect(combinedRootReducer(state, { type: "SOMETHING_ELSE" })).toBe(state);
    });

    it("stores the read-only mode the host sets", () => {
        const state = getInitializedState();

        expect(getIsReadOnlyMode(state)).toBe(false);
        expect(getIsReadOnlyMode(combinedRootReducer(state, setReadOnlyMode(true)))).toBe(true);
    });
});
