import * as PropTypes from 'prop-types';
import isNumber = require('lodash/isNumber');
import isString = require('lodash/isString');

function twoNumbersOrTwoStrings(props, propName, componentName) {
    const between = props.between;

    const isDate = date => date.match(/^\d{4}-\d{2}-\d{2}$/);
    const isWholeNumber = num => num % 1 === 0;

    if (!Array.isArray(between) ||
        between.length !== 2 ||
        !(
            between.every(isString) ||
            between.every(isNumber)
        ) ||
        (between.every(isString) && !between.every(isDate)) ||
        (between.every(isNumber) && !between.every(isWholeNumber))
    ) {
        return new Error(
            `Invalid prop ${propName} supplied to ${componentName}. Validation failed.
            Prop ${propName} must be array of two numbers or array of two strings.`
        );
    }
}

const baseAttributeFilter = {
    id: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['attribute']).isRequired
};

export default {
    filters: PropTypes.arrayOf(
        PropTypes.oneOfType([
            PropTypes.shape({
                id: PropTypes.string.isRequired,
                type: PropTypes.oneOf(['date']).isRequired,
                between: twoNumbersOrTwoStrings,
                granularity: PropTypes.string.isRequired
            }),
            PropTypes.oneOfType([
                PropTypes.shape({
                    in: PropTypes.arrayOf(PropTypes.string).isRequired,
                    ...baseAttributeFilter
                }),
                PropTypes.shape({
                    notIn: PropTypes.arrayOf(PropTypes.string).isRequired,
                    ...baseAttributeFilter
                })
            ]).isRequired
        ])
    )
};
