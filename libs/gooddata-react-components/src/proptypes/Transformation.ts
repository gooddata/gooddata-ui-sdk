// (C) 2007-2018 GoodData Corporation
import * as PropTypes from "prop-types";

import { Requireable } from "prop-types"; // tslint:disable-line:no-duplicate-imports
export { Requireable };

const object = {
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
};

export const TransformationPropType = PropTypes.shape({
    sorting: PropTypes.arrayOf(
        PropTypes.shape({
            column: PropTypes.string.isRequired,
            direction: PropTypes.string.isRequired,
        }),
    ),
    measures: PropTypes.arrayOf(
        PropTypes.shape({
            format: PropTypes.string,
            ...object,
        }),
    ),
    dimensions: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
            attributes: PropTypes.arrayOf(PropTypes.shape(object)).isRequired,
        }),
    ),
});
