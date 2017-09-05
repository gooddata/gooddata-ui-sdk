import * as PropTypes from 'prop-types';
import chartConfig from './ChartConfig';
import events from './Events';
import { dataSourcePropTypes } from './DataSource';
import { metadataSourcePropTypes } from './MetadataSource';
import drillableItem from './DrillableItem';

export const chartPropTypes = {
    ...chartConfig,
    ...events,
    dataSource: dataSourcePropTypes.isRequired,
    metadataSource: metadataSourcePropTypes,
    locale: PropTypes.string,
    height: PropTypes.number,
    drillableItems: PropTypes.arrayOf(PropTypes.shape(drillableItem)),
    environment: PropTypes.string
};
