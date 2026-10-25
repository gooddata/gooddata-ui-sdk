// (C) 2026 GoodData Corporation

// The mount path comes straight from constants/state_paths, never from the domain's own
// reducer module (4.4 delivery note — that direction closes an import cycle).
import { type IAppState } from "../types.js";

import { type IConfigurationPanelState } from "./configuration_panel_state.js";

/** The domain's single input selector. */
export const getConfigurationPanelState: (state: IAppState) => IConfigurationPanelState = (
    state: IAppState,
) => state.data.configurationPanel;

// `|| false` kept verbatim from selectors/configuration_panel_selector.ts: the dragging flag is
// unseeded, and buckets_reducer deletes it again when a dragged item lands in a bucket.
export const isConfigurationPanelCollapsed = (state: IAppState): boolean =>
    getConfigurationPanelState(state).collapsed || false;

export const isConfigurationPanelCollapsedByDragging = (state: IAppState): boolean =>
    getConfigurationPanelState(state).collapsedByDragging || false;
