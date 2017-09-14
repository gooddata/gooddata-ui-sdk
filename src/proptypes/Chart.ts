import * as PropTypes from 'prop-types';
import { ChartConfigPropType } from './ChartConfig';
import { EventsPropTypes } from './Events';
import { DataSourcePropType } from './DataSource';
import { MetadataSourcePropType } from './MetadataSource';
import { DrillableItemPropType } from './DrillableItem';

import { Requireable } from 'prop-types'; // tslint:disable-line:no-duplicate-imports
export {
    Requireable
};

export const ChartPropTypes = {
    config: ChartConfigPropType,
    ...EventsPropTypes,
    dataSource: DataSourcePropType.isRequired,
    metadataSource: MetadataSourcePropType,
    locale: PropTypes.string,
    height: PropTypes.number,
    drillableItems: PropTypes.arrayOf(DrillableItemPropType),
    environment: PropTypes.string
};
