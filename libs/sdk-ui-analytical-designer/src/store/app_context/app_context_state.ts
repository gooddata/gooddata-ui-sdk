// (C) 2026 GoodData Corporation

import { type IColorPalette } from "@gooddata/sdk-model";

import { type BootstrapError, type IBootstrapData } from "../../actions/app_context_actions.js";

/**
 * The appContext domain owns three ROOT-level branches (`bootstrapData`, `projectId`,
 * `colorPalette`) plus the `appState.errors` / `appState.appReady` leaves, each its own
 * `combineReducers` entry.
 *
 * `appState.sessionId` deliberately stays OUT of the slices: it is refreshed outside any action a
 * slice could wire, so it is single-owned by session_id_reducer.ts.
 *
 * The null initials are read through selectors that treat the values as optional.
 */
export type IBootstrapDataState = IBootstrapData | null;
export const bootstrapDataInitialState: IBootstrapDataState = null;

export type IProjectIdState = string | null;
export const projectIdInitialState: IProjectIdState = null;

export type IColorPaletteState = IColorPalette | null;
export const colorPaletteInitialState: IColorPaletteState = null;

export type IErrorsState = BootstrapError[];
export const errorsInitialState: IErrorsState = [];

export type IAppReadyState = boolean;
export const appReadyInitialState: IAppReadyState = false;
