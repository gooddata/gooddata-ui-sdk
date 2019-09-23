// (C) 2007-2018 GoodData Corporation
import * as PropTypes from "prop-types";
import { EventsPropTypes } from "./Events";
import { FiltersPropType } from "./Filters";

import { Requireable } from "prop-types"; // tslint:disable-line:no-duplicate-imports
export { Requireable };

export const KpiPropTypes = {
    ...EventsPropTypes,
    filters: FiltersPropType,
    format: PropTypes.string,
    measure: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    ErrorComponent: PropTypes.func,
    LoadingComponent: PropTypes.func,
};
