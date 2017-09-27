import * as PropTypes from 'prop-types';
import filters from './Filters';

export default {
    afm: PropTypes.shape({
        attributes: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.string.isRequired,
                type: PropTypes.oneOf(['date', 'attribute']).isRequired
            })
        ),
        ...filters,
        measures: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.string.isRequired,
                definition: PropTypes.shape({
                    baseObject: PropTypes.oneOfType([
                        PropTypes.shape({ id: PropTypes.string.isRequired }),
                        PropTypes.shape({ lookupId: PropTypes.string.isRequired })
                    ]).isRequired,
                    ...filters,
                    aggregation: PropTypes.string,
                    popAttribute: PropTypes.shape({
                        id: PropTypes.string.isRequired
                    }),
                    showInPercent: PropTypes.bool
                })
            })
        )
    })
};
