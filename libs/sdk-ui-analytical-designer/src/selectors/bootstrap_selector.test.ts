// (C) 2007-2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import { type IBootstrapData } from "../actions/app_context_actions.js";
import { initialState } from "../reducers/initial_state.js";
import { type IAppState } from "../store/types.js";
import { withRouteQuery } from "../tests/route.test.helpers.js";
import { withMeta, withRoot } from "../tests/state_builder.test.helpers.js";
import { type PartialRecursive } from "../typings/type_utils.js";

import { getOrganizationId, isTopBarHidden } from "./bootstrap_selector.js";
import { getConfig } from "./report_visualization_selector.js";

vi.hoisted(() => {
    vi.resetModules();
});

describe("Bootstrap selector test", () => {
    describe("getConfig", () => {
        it("should return separators", () => {
            const separators = {
                thousand: ".",
                decimal: ",",
            };
            const bootstrapResource: PartialRecursive<IBootstrapData> = {
                user: {
                    separators,
                },
            };

            const state = withRoot(initialState, {
                bootstrapData: bootstrapResource as unknown as IBootstrapData,
            });

            expect(getConfig(state)).toEqual({ separators });
        });

        it("should return mapbox token", () => {
            const mapboxToken = "dummy_mapbox_token";
            const bootstrapResource: PartialRecursive<IBootstrapData> = {
                mapboxToken,
            };

            const state = withRoot(initialState, {
                bootstrapData: bootstrapResource as unknown as IBootstrapData,
            });
            expect(getConfig(state)).toEqual({ mapboxToken: "dummy_mapbox_token" });
        });

        it("should return ag grid token", () => {
            const agGridToken = "dummy_ag_grid_token";
            const bootstrapResource: PartialRecursive<IBootstrapData> = {
                agGridToken,
            };
            const state = withRoot(initialState, {
                bootstrapData: bootstrapResource as unknown as IBootstrapData,
            });
            expect(getConfig(state)).toEqual({ agGridToken: "dummy_ag_grid_token" });
        });

        it("should return empty config if none is not defined", () => {
            expect(getConfig(initialState)).toEqual({});
        });
    });

    describe("hide top bar", () => {
        const setupHideTopBarState = (isEmbedded: boolean, hideControl: string): IAppState => {
            return withMeta(withRouteQuery(initialState, { hideControl }), { isEmbedded: isEmbedded });
        };

        it("should hide top bar", () => {
            const state: IAppState = setupHideTopBarState(true, "[topBar]");
            expect(isTopBarHidden(state)).toBe(true);
        });

        it("should not hide top bar if not in embedded mode", () => {
            const state: IAppState = setupHideTopBarState(false, "[topBar]");
            expect(isTopBarHidden(state)).toBe(false);
        });

        it("should not hide top bar if url params isn't provided", () => {
            // invalid param
            let state: IAppState = setupHideTopBarState(true, "blabla");
            expect(isTopBarHidden(state)).toBe(false);

            // empty array
            state = setupHideTopBarState(true, "[]");
            expect(isTopBarHidden(state)).toBe(false);

            // missing control hide topBar
            state = setupHideTopBarState(true, "[sideBar]");
            expect(isTopBarHidden(state)).toBe(false);
        });

        it("should hide top bar while hide topBar was provided together with another control", () => {
            const state: IAppState = setupHideTopBarState(true, "[topBar, sideBar]");
            expect(isTopBarHidden(state)).toBe(true);
        });
    });

    describe("getOrganizationId", () => {
        it("should return organization ID from bootstrap data domain URI", () => {
            const bootstrapResource: PartialRecursive<IBootstrapData> = {
                user: {
                    domain: "/gdc/domains/myDomain",
                },
            };
            const state = withRoot(initialState, {
                bootstrapData: bootstrapResource as unknown as IBootstrapData,
            });
            expect(getOrganizationId(state)).toEqual("myDomain");
        });

        it("should return undefined when domain URI is not found in bootstrap data", () => {
            const state = initialState;
            expect(getOrganizationId(state)).toBeUndefined();
        });
    });
});
