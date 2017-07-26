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
                    filters: PropTypes.oneOfType([
                        PropTypes.arrayOf(PropTypes.shape({
                            id: PropTypes.string.isRequired,
                            in: PropTypes.arrayOf(PropTypes.string).isRequired
                        })).isRequired,
                        PropTypes.arrayOf(PropTypes.shape({
                            id: PropTypes.string.isRequired,
                            notIn: PropTypes.arrayOf(PropTypes.string).isRequired
                        }))
                    ]),
                    aggregation: PropTypes.string,
                    popAttribute: PropTypes.shape({
                        id: PropTypes.string.isRequired
                    }),
                    showInPercent: PropTypes.bool
                })
            })
        )
    }).isRequired
};
