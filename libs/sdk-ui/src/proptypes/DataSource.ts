// (C) 2007-2018 GoodData Corporation
import * as PropTypes from "prop-types";

import { Requireable } from "prop-types"; // tslint:disable-line:no-duplicate-imports
export { Requireable };

export const DataSourcePropType = PropTypes.shape({
    getData: PropTypes.func.isRequired,
    getAfm: PropTypes.func.isRequired,
    getFingerprint: PropTypes.func.isRequired,
});
