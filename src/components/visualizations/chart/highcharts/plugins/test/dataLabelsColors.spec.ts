// (C) 2007-2018 GoodData Corporation
import {
    isWhiteNotContrastEnough
} from '../dataLabelsColors';

import {
    DEFAULT_COLOR_PALETTE
} from '../../../../utils/color';

describe('dataLabelsColors', () => {
    describe('isWhiteNotContrastEnough', () => {
        it('should return false for black', () => {
            expect(isWhiteNotContrastEnough('rgb(0, 0, 0)')).toBeFalsy();
        });

        it('should return true for white', () => {
            expect(isWhiteNotContrastEnough('rgb(255, 255, 255)')).toBeTruthy();
        });

        it('should fullfill UX requirement for default color palette', () => {
            const result: boolean[] = DEFAULT_COLOR_PALETTE
            .map((defaultColor: string) => isWhiteNotContrastEnough(defaultColor));

            // first 17 colors should return false -> have white label
            const expectedValues = new Array(20).fill(false);
            // last 3 colors should return true -> have black label
            expectedValues[17] = true;
            expectedValues[18] = true;
            expectedValues[19] = true;
            expect(result).toEqual(expectedValues);
        });
    });
});
