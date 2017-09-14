import * as PropTypes from 'prop-types';
import isNumber = require('lodash/isNumber');
import isString = require('lodash/isString');
import { Afm } from '@gooddata/data-layer';

import { Requireable } from 'prop-types'; // tslint:disable-line:no-duplicate-imports
export {
    Requireable
};

function twoNumbersOrTwoStrings(props: Afm.IDateFilter, propName: string, componentName: string) {
    const between: any = props.between;

    const isDate = (date: string) => date.match(/^\d{4}-\d{2}-\d{2}$/) !== null;
    const isWholeNumber = (num: number) => num % 1 === 0;

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

export const FiltersPropType =
    PropTypes.arrayOf(
        PropTypes.oneOfType([
            PropTypes.shape({
                id: PropTypes.string.isRequired,
                type: PropTypes.oneOf(['date']).isRequired,
                between: twoNumbersOrTwoStrings,
                granularity: PropTypes.string.isRequired,
                intervalType: PropTypes.oneOf(['absolute', 'relative']).isRequired
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
    );
