// (C) 2007-2018 GoodData Corporation
import * as PropTypes from 'prop-types';
import { EventsPropTypes } from './Events';
import { DataSourcePropType } from './DataSource';
import { DrillableItemPropType } from './DrillableItem';

import { Requireable } from 'prop-types'; // tslint:disable-line:no-duplicate-imports
export {
    Requireable
};

export const TablePropTypes = {
    ...EventsPropTypes,
    dataSource: DataSourcePropType,
    locale: PropTypes.string,
    height: PropTypes.number,
    environment: PropTypes.string,
    drillableItems: PropTypes.arrayOf(DrillableItemPropType),
    stickyHeader: PropTypes.number,
    totals: PropTypes.array,
    totalsEditAllowed: PropTypes.bool,
    ErrorComponent: PropTypes.func,
    LoadingComponent: PropTypes.func,
    config: PropTypes.object
};
