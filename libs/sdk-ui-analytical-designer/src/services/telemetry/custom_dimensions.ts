// (C) 2021-2026 GoodData Corporation

import {
    getOrganizationName,
    getProjectId,
    getProjectTemplate,
    getUserEmailDomain,
    getUserLoginMD5,
} from "../../selectors/bootstrap_selector.js";
import { getViewportInfo } from "../../selectors/meta_selector.js";
import { type IAppState } from "../../store/types.js";

export const getCustomDimensions = (state: IAppState) => ({
    // dimension1: 'Logged-in' / 'Guest' is used in old client only
    dimension2: getUserLoginMD5(state),
    dimension3: getUserEmailDomain(state),
    dimension4: getOrganizationName(state),
    dimension5: getProjectId(state),
    // dimension6: origin used in interactive reports
    // dimension7: 'dashboard id' is used in new dashboards
    dimension8: getViewportInfo(state),
    dimension9: getProjectTemplate(state),
});
