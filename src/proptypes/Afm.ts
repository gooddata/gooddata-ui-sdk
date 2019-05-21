// (C) 2007-2018 GoodData Corporation
import * as PropTypes from "prop-types";
import { FiltersPropType } from "./Filters";

import { Requireable } from "prop-types"; // tslint:disable-line:no-duplicate-imports
export { Requireable };

export const AfmPropType = PropTypes.shape({
    attributes: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            type: PropTypes.oneOf(["date", "attribute"]).isRequired,
        }),
    ),
    filters: FiltersPropType,
    measures: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            definition: PropTypes.shape({
                baseObject: PropTypes.oneOfType([
                    PropTypes.shape({ id: PropTypes.string.isRequired }),
                    PropTypes.shape({ lookupId: PropTypes.string.isRequired }),
                ]).isRequired,
                filters: FiltersPropType,
                aggregation: PropTypes.string,
                popAttribute: PropTypes.shape({
                    id: PropTypes.string.isRequired,
                }),
                showInPercent: PropTypes.bool,
            }),
        }),
    ),
    nativeTotals: PropTypes.arrayOf(
        PropTypes.shape({
            measureIdentifier: PropTypes.string.isRequired,
            attributeIdentifiers: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
        }),
    ),
});
