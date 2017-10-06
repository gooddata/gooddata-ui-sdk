import * as PropTypes from 'prop-types';
import { EventsPropTypes } from './Events';
import { DataSourcePropType } from './DataSource';
import { MetadataSourcePropType } from './MetadataSource';
import { DrillableItemPropType } from './DrillableItem';

import { Requireable } from 'prop-types'; // tslint:disable-line:no-duplicate-imports
export {
    Requireable
};

export const TablePropTypes = {
    ...EventsPropTypes,
    dataSource: DataSourcePropType,
    metadataSource: MetadataSourcePropType,
    locale: PropTypes.string,
    height: PropTypes.number,
    environment: PropTypes.string,
    drillableItems: PropTypes.arrayOf(DrillableItemPropType),
    stickyHeader: PropTypes.number
};
