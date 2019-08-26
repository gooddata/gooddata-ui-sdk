// (C) 2007-2018 GoodData Corporation
import * as PropTypes from "prop-types";
import {
    AfmPropTypesShape,
    ResultSpecPropTypesShape,
} from "../components/visualizations/proptypes/execution";
import { EventsPropTypes } from "./Events";

import { Requireable } from "prop-types"; // tslint:disable-line:no-duplicate-imports
export { Requireable };

export const ExecutePropType = {
    ...EventsPropTypes,
    projectId: PropTypes.string.isRequired,
    afm: AfmPropTypesShape.isRequired,
    resultSpec: ResultSpecPropTypesShape,
    children: PropTypes.func.isRequired,
    LoadingComponent: PropTypes.func,
    ErrorComponent: PropTypes.func,
    telemetryComponentName: PropTypes.string,
};
