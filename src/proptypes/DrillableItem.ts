// (C) 2007-2018 GoodData Corporation
import * as PropTypes from "prop-types";

import { Requireable } from "prop-types"; // tslint:disable-line:no-duplicate-imports
export { Requireable };

export const DrillableItemPropType = PropTypes.shape({
    uri: PropTypes.string,
    identifier: PropTypes.string,
});

export const DrillablePredicatePropType = PropTypes.func;
