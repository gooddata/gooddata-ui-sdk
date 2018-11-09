// (C) 2007-2018 GoodData Corporation
import { AFM } from '@gooddata/typings';
import * as headerPredicateFactory from '../../factory/HeaderPredicateFactory';
import { afmWithDerived, measureHeaderItem } from '../../factory/tests/mocks';
import { IMappingHeader } from '../../interfaces/MappingHeader';
import { IHeaderPredicate } from '../../interfaces/HeaderPredicate';
import { convertDrillableItemsToPredicates, isSomeHeaderPredicateMatched } from '../headerPredicate';

describe('isSomeHeaderPredicateMatched', () => {
    it('should return true when some of predicates match header', () => {
        const header: IMappingHeader = { attributeHeaderItem: { uri: 'uri', name: 'name' } };
        const afm: AFM.IAfm = {};
        const drillablePredicates: IHeaderPredicate[] = [
            jest.fn(() => false),
            jest.fn(() => true)
        ];

        expect(isSomeHeaderPredicateMatched(drillablePredicates, header, afm)).toBe(true);
        expect(drillablePredicates[0]).toBeCalledWith(header, afm);
        expect(drillablePredicates[1]).toBeCalledWith(header, afm);
    });

    it('should return false when none of predicates match header', () => {
        const header: IMappingHeader = { attributeHeaderItem: { uri: 'uri', name: 'name' } };
        const afm: AFM.IAfm = {};
        const drillablePredicates: IHeaderPredicate[] = [
            jest.fn(() => false),
            jest.fn(() => false)
        ];

        expect(isSomeHeaderPredicateMatched(drillablePredicates, header, afm)).toBe(false);
        expect(drillablePredicates[0]).toBeCalledWith(header, afm);
        expect(drillablePredicates[1]).toBeCalledWith(header, afm);
    });

    it('should return false when no of predicates provided', () => {
        const header: IMappingHeader = { attributeHeaderItem: { uri: 'uri', name: 'name' } };
        const afm: AFM.IAfm = {};
        const drillablePredicates: IHeaderPredicate[] = [];

        expect(isSomeHeaderPredicateMatched(drillablePredicates, header, afm)).toBe(false);
    });
});

describe('convertDrillableItemsToPredicates', () => {
    it('should convert legacy drillable items to drillable predicates', () => {
        const drillableItems = [
            { uri: '/some-uri' },
            { identifier: 'some-identifier' }
        ];

        const drillablePredicates = convertDrillableItemsToPredicates(drillableItems);

        expect(drillablePredicates).toHaveLength(drillableItems.length);
        drillablePredicates.forEach((predicate) => {
            expect(typeof predicate).toBe('function');
            expect(typeof predicate(measureHeaderItem, afmWithDerived)).toBe('boolean');
        });
    });

    it('should convert legacy drillable items with drillable predicates to drillable predicates', () => {
        const drillableItems = [
            { uri: '/some-uri' },
            { identifier: 'some-identifier' },
            headerPredicateFactory.uriMatch('/some-uri'),
            headerPredicateFactory.identifierMatch('identifier')
        ];

        const drillablePredicates = convertDrillableItemsToPredicates(drillableItems);

        expect(drillablePredicates).toHaveLength(drillableItems.length);
        drillablePredicates.forEach((predicate) => {
            expect(typeof predicate).toBe('function');
            expect(typeof predicate(measureHeaderItem, afmWithDerived)).toBe('boolean');
        });
    });

    it('should convert legacy drillable item with uri and identifier to 2 predicates', () => {
        const drillableItems = [
            {
                uri: '/some-uri',
                identifier: 'some-identifier'
            }
        ];

        const drillablePredicates = convertDrillableItemsToPredicates(drillableItems);

        expect(drillablePredicates).toHaveLength(2);
        drillablePredicates.forEach((predicate) => {
            expect(typeof predicate).toBe('function');
            expect(typeof predicate(measureHeaderItem, afmWithDerived)).toBe('boolean');
        });
    });

    it('should match converted legacy drillable item with uri', () => {
        const drillableItems = [
            {
                uri: '/measureHeaderItem.uri'
            }
        ];

        const [ predicate ] = convertDrillableItemsToPredicates(drillableItems);
        expect(predicate(measureHeaderItem, afmWithDerived)).toEqual(true);
    });

    it('should match converted legacy drillable item with identifier', () => {
        const drillableItems = [
            {
                identifier: 'measureHeaderItem.identifier'
            }
        ];

        const [ predicate ] = convertDrillableItemsToPredicates(drillableItems);
        expect(predicate(measureHeaderItem, afmWithDerived)).toEqual(true);
    });

    it('should match both converted legacy drillable items with identifier and uri', () => {
        const drillableItems = [
            {
                uri: '/measureHeaderItem.uri',
                identifier: 'measureHeaderItem.identifier'
            }
        ];

        const drillablePredicates = convertDrillableItemsToPredicates(drillableItems);
        drillablePredicates.forEach((predicate) => {
            expect(predicate(measureHeaderItem, afmWithDerived)).toEqual(true);
        });
    });
});
