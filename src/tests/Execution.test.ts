// (C) 2007-2018 GoodData Corporation
import { Execution } from '../Execution';
import isAttributeHeaderItem = Execution.isAttributeHeaderItem;
import IResultHeaderItem = Execution.IResultHeaderItem;
import isMeasureHeaderItem = Execution.isMeasureHeaderItem;
import isTotalHeaderItem = Execution.isTotalHeaderItem;
import IHeader = Execution.IHeader;
import isMeasureGroupHeader = Execution.isMeasureGroupHeader;
import isAttributeHeader = Execution.isAttributeHeader;

describe('Execution type guards', () => {
    const attr: IResultHeaderItem = {
        attributeHeaderItem: {
            uri: '/uri',
            name: 'Name'
        }
    };

    const measure: IResultHeaderItem = {
        measureHeaderItem: {
            name: 'Name',
            order: 1
        }
    };

    const total: IResultHeaderItem = {
        totalHeaderItem: {
            name: 'Name',
            type: 'asdf'
        }
    };

    it('should recognize IResultHeaderItem subtypes', () => {
        expect(isAttributeHeaderItem(attr)).toEqual(true);
        expect(isMeasureHeaderItem(attr)).toEqual(false);
        expect(isTotalHeaderItem(attr)).toEqual(false);

        expect(isAttributeHeaderItem(measure)).toEqual(false);
        expect(isMeasureHeaderItem(measure)).toEqual(true);
        expect(isTotalHeaderItem(measure)).toEqual(false);

        expect(isAttributeHeaderItem(total)).toEqual(false);
        expect(isMeasureHeaderItem(total)).toEqual(false);
        expect(isTotalHeaderItem(total)).toEqual(true);
    });

    const measureGroup: IHeader = {
        measureGroupHeader: {
            items: [
                {
                    measureHeaderItem: {
                        localIdentifier: 'm1',
                        name: 'Senseilevel',
                        format: '###'
                    }
                }
            ]
        }
    };

    const attributeHeader: IHeader = {
        attributeHeader: {
            uri: '/uri',
            identifier: 'id',
            localIdentifier: 'a1',
            name: 'Year over year',
            formOf: {
                uri: '/uri2',
                identifier: 'id2',
                name: 'Date of birth'
            }
        }
    };

    it('should recognize IHeader subtypes', () => {
        expect(isMeasureGroupHeader(measureGroup)).toEqual(true);
        expect(isAttributeHeader(measureGroup)).toEqual(false);

        expect(isMeasureGroupHeader(attributeHeader)).toEqual(false);
        expect(isAttributeHeader(attributeHeader)).toEqual(true);
    });
});
