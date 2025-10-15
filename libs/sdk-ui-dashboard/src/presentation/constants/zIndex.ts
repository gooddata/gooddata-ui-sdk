// (C) 2020-2025 GoodData Corporation

// Z index of all overlays in Dashboard component
export const DASHBOARD_OVERLAYS_Z_INDEX = 5000;

// Z index of all overlays in Dashboard header component
export const DASHBOARD_HEADER_OVERLAYS_Z_INDEX = 6000;

// Z index of all overlays in Dashboard component in conflict with filter bar
export const DASHBOARD_OVERLAYS_FILTER_Z_INDEX = 6000;

// Z index of all overlays in dashboard dialogs
export const DASHBOARD_DIALOG_OVERS_Z_INDEX = 6100;

// Z index of the toast messages container overlay
export const DASHBOARD_TOASTS_OVERLAY_Z_INDEX = 9000;

// Z index of the drill menu when overlayed by the drill dialog
export const DASHBOARD_DRILL_MENU_BOTTOM_LAYER_Z_INDEX = DASHBOARD_OVERLAYS_FILTER_Z_INDEX;

// Z index of the drill menu when not overlayed by the drill dialog
export const DASHBOARD_DRILL_MENU_TOP_LAYER_Z_INDEX = DASHBOARD_DIALOG_OVERS_Z_INDEX;
