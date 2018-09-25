// (C) 2007-2018 GoodData Corporation
import * as PropTypes from 'prop-types';
import { EventsPropTypes } from './Events';
import { DataSourcePropType } from './DataSource';
import { DrillableItemPropType } from './DrillableItem';

import { Requireable } from 'prop-types'; // tslint:disable-line:no-duplicate-imports
export {
    Requireable
};

export const HeadlinePropTypes = {
    ...EventsPropTypes,
    dataSource: DataSourcePropType,
    locale: PropTypes.string,
    drillableItems: PropTypes.arrayOf(DrillableItemPropType),
    onFiredDrillEvent: PropTypes.func,
    stickyHeader: PropTypes.number,
    ErrorComponent: PropTypes.func,
    LoadingComponent: PropTypes.func
};
