// (C) 2026 GoodData Corporation

import { type ITheme } from "@gooddata/sdk-model";

import { getThemeState } from "../store/embedding/embedding_selectors.js";
import { type IAppState } from "../store/types.js";

export const themeSelector = (state: IAppState): ITheme | undefined => getThemeState(state) ?? undefined;
