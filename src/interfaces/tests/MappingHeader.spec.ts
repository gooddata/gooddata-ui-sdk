// (C) 2007-2018 GoodData Corporation
import { attributeHeaderItem, measureHeaderItem, attributeHeader } from '../../factory/tests/mocks';
import { isMappingHeaderAttributeItem, isMappingHeaderMeasureItem, isMappingHeaderAttribute } from '../MappingHeader';
import { isHeaderPredicate } from '../HeaderPredicate';
import * as headerPredicateFactory from '../../factory/HeaderPredicateFactory';

describe('isMappingHeaderMeasureItem', () => {
    it('should return true when object contains measureHeaderItem', () => {
        expect(isMappingHeaderMeasureItem(measureHeaderItem)).toEqual(true);
    });

    it('should return false measureHeaderItem when object does not contain measureHeaderItem', () => {
        expect(isMappingHeaderMeasureItem(attributeHeaderItem)).toEqual(false);
    });
});

describe('isMappingHeaderAttribute', () => {
    it('should return true when object contains attributeHeader', () => {
        expect(isMappingHeaderAttribute(attributeHeader)).toEqual(true);
    });

    it('should return false when measureHeaderItem when object does not contain measureHeaderItem', () => {
        expect(isMappingHeaderAttribute(attributeHeaderItem)).toEqual(false);
    });
});

describe('isMappingHeaderAttributeItem', () => {
    it('should return true when object contains attributeHeaderItem', () => {
        expect(isMappingHeaderAttributeItem(attributeHeaderItem)).toEqual(true);
    });

    it('should return false when object does not contain attributeHeaderItem', () => {
        expect(isMappingHeaderAttributeItem(measureHeaderItem)).toEqual(false);
    });
});

describe('isHeaderPredicate', () => {
    it('should return true when is header predicate', () => {
       expect(isHeaderPredicate(headerPredicateFactory.uriMatch('/some-uri'))).toEqual(true);
    });

    it('should return false when is legacy drillable item', () => {
        expect(isHeaderPredicate({ uri: '/some-uri' })).toEqual(false);
    });
});
