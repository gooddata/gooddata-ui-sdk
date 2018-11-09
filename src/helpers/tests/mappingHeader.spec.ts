// (C) 2007-2018 GoodData Corporation
import {
    getMappingHeaderIndentifier,
    getMappingHeaderLocalIdentifier,
    getMappingHeaderName, getMappingHeaderUri
} from '../mappingHeader';
import {
    attributeHeader,
    attributeHeaderItem,
    measureHeaderItem
} from '../../factory/tests/mocks';

describe('getMappingHeaderLocalIdentifier', () => {
    it('should return localIdentifier from attributeHeader', () => {
        expect(getMappingHeaderLocalIdentifier(attributeHeader)).toBe('attributeHeader.localIdentifier');
    });

    it('should return localIdentifier from measureHeader', () => {
        expect(getMappingHeaderLocalIdentifier(measureHeaderItem)).toBe('measureHeaderItem.localIdentifier');
    });

    it('should throw error when object is not attributeHeader or measureHeaderItem', () => {
        expect(() => getMappingHeaderLocalIdentifier(attributeHeaderItem)).toThrowError();
    });
});

describe('getMappingHeaderName', () => {
    it('should return name from formOf of attributeHeader', () => {
        expect(getMappingHeaderName(attributeHeader)).toBe('attributeHeader.element.name');
    });

    it('should return name from attributeHeaderItem', () => {
        expect(getMappingHeaderName(attributeHeaderItem)).toBe('attributeHeaderItem.name');
    });

    it('should return name from measureHeaderItem', () => {
        expect(getMappingHeaderName(measureHeaderItem)).toBe('measureHeaderItem.name');
    });
});

describe('getMappingHeaderIndentifier', () => {
    it('should return identifier from attributeHeader', () => {
        expect(getMappingHeaderIndentifier(attributeHeader)).toBe('attributeHeader.identifier');
    });

    it('should return identifier from measureHeader', () => {
        expect(getMappingHeaderIndentifier(measureHeaderItem)).toBe('measureHeaderItem.identifier');
    });

    it('should throw error when object is not attributeHeader or measureHeaderItem', () => {
        expect(() => getMappingHeaderIndentifier(attributeHeaderItem)).toThrowError();
    });
});

describe('getMappingHeaderUri', () => {
    it('should return uri from attributeHeader', () => {
        expect(getMappingHeaderUri(attributeHeader)).toBe('/attributeHeader.uri');
    });

    it('should return uri from attributeHeaderItem', () => {
        expect(getMappingHeaderUri(attributeHeaderItem)).toBe('/attributeHeaderItem.uri');
    });

    it('should return uri from measureHeaderItem', () => {
        expect(getMappingHeaderUri(measureHeaderItem)).toBe('/measureHeaderItem.uri');
    });
});
