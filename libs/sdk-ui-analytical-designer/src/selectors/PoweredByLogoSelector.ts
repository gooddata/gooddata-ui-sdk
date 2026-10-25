// (C) 2019-2026 GoodData Corporation

import { createSelector } from "reselect";

import { getAppReadyState } from "../store/app_context/app_context_selectors.js";
import { type IAppState } from "../store/types.js";

import { isFreeEdition } from "./feature_flag_selector.js";
import { getIsEmbedded } from "./meta_selector.js";
import { canManageProject } from "./permissions_selector.js";
import { isEmbeddedFromKD } from "./route_selector.js";

function getHref(canManageProject: boolean): string {
    const href = canManageProject
        ? "https://help.gooddata.com/pages/viewpage.action?pageId=86789085&"
        : "https://gooddata.com/?";
    const utmParameters = "utm_medium=platform&utm_source=product&utm_content=logo";
    return href + utmParameters;
}

export const isPoweredByGDLogoPresent = createSelector(
    (state: IAppState) => getIsEmbedded(state),
    (state: IAppState) => isFreeEdition(state),
    (state: IAppState) => getAppReadyState(state),
    (state: IAppState) => isEmbeddedFromKD(state),
    (isEmbedded, isFreeEdition, isAppReady, isEmbeddedFromKD) =>
        !isEmbeddedFromKD && isEmbedded && isFreeEdition && isAppReady,
);

export const poweredByGDLogoLink = createSelector(canManageProject, getHref);
