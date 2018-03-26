// (C) 2007-2018 GoodData Corporation
import {
    parseValue,
    immutableSet,
    repeatItemsNTimes,
    unEscapeAngleBrackets,
    getAttributeElementIdFromAttributeElementUri
} from '../common';

describe('Common utils', () => {
    describe('parseValue', () => {
        it('should parse string to float', () => {
            expect(parseValue('12345')).toEqual(12345);
            expect(parseValue('1.2345')).toEqual(1.2345);
            expect(parseValue('1.2345678901e-05')).toEqual(0.000012345678901);
        });

        it('should return null when value is string', () => {
            expect(parseValue('test')).toEqual(null);
        });
    });

    describe('immutableSet', () => {
        const data: any = {
            array: [
                {
                    modified: [1],
                    untouched: {}
                },
                { untouched: 3 }
            ]
        };
        const path = 'array[0].modified[1]';
        const newValue = 4;

        const updated: any = immutableSet(data, path, newValue);
        it('should set values deep in the object hierarchy', () => {
            expect(updated.array[0].modified[1]).toEqual(4);
        });
        it('should clone objects that have been updated', () => {
            expect(updated.array[0].modified).not.toBe(data.array[0].modified);
        });
        it('should not clone objects that have NOT been updated', () => {
            expect(updated.array[1]).toBe(data.array[1]);
        });
    });

    describe('repeatItemsNTimes', () => {
        const array = [1, 2, 3];
        const n = 3;

        const repeatedArray = repeatItemsNTimes(array, n);
        it('should return a new array with original items repeated N times', () => {
            expect(repeatedArray).toEqual([1, 2, 3, 1, 2, 3, 1, 2, 3]);
        });
    });

    describe('getAttributeElementIdFromAttributeElementUri', () => {
        const uri = '/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1024/elements?id=1225';

        it('should return id from attribute value uri', () => {
            expect(getAttributeElementIdFromAttributeElementUri(uri)).toEqual('1225');
        });
    });

    describe('unEscapeAngleBrackets', () => {
        const str = 'abc&lt;&#60;&gt;&#62;def';
        const expectedString = 'abc<<>>def';

        it('should return id from attribute value uri', () => {
            expect(unEscapeAngleBrackets(str)).toEqual(expectedString);
        });
    });
});
