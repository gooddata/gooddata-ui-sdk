import * as PropTypes from 'prop-types';

export default {
    config: PropTypes.shape({
        colors: PropTypes.arrayOf(PropTypes.string),
        legend: PropTypes.shape({
            enabled: PropTypes.bool,
            position: PropTypes.oneOf(['top', 'left', 'right', 'bottom'])
        }),
        limits: PropTypes.shape({
            series: PropTypes.number,
            categories: PropTypes.number
        })
    })
};
