import * as PropTypes from 'prop-types';

const object = {
    id: PropTypes.string.isRequired,
    title: PropTypes.string
};

export default {
    transformation: PropTypes.shape({
        sorting: PropTypes.arrayOf(
            PropTypes.shape({
                column: PropTypes.string.isRequired,
                direction: PropTypes.string.isRequired
            })
        ),
        measures: PropTypes.arrayOf(
            PropTypes.shape({
                format: PropTypes.string,
                ...object
            })
        ),
        buckets: PropTypes.arrayOf(
            PropTypes.shape({
                name: PropTypes.string.isRequired,
                attributes: PropTypes.arrayOf(
                    PropTypes.shape(object)
                ).isRequired
            })
        )
    })
};
