// (C) 2007-2018 GoodData Corporation
import { IHeaderPredicate } from '../../interfaces/HeaderPredicate';
import * as headerPredicateFactory from '../HeaderPredicateFactory';
import {
    afmWithDerived,
    afmWithAmMeasures,
    amMeasureHeaderItems,
    attributeHeader,
    attributeHeaderItem,
    measureHeaderItem,
    measureHeaderItemWithoutUriAndIndentifier,
    measureHeaderItemPP,
    measureHeaderItemSP
} from './mocks';

describe('uriMatch', () => {
    describe('measureHeaderItem', () => {
        it('should match predicate when measure item uri matches', () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.uriMatch('/measureHeaderItem.uri');

            expect(predicate(measureHeaderItem, afmWithDerived)).toEqual(true);
        });

        it('should not match predicate when measure item uri does not matches', () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.uriMatch('/someOtherUri');

            expect(predicate(measureHeaderItem, afmWithDerived)).toEqual(false);
        });

        it('should not match predicate when empty uri provided', () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.uriMatch(null);

            expect(predicate(measureHeaderItem, afmWithDerived)).toEqual(false);
        });

        describe('uknown header uri (adhoc measures)', () => {
            it('should match uri predicate against AFM when header uri is undefined', () => {
                const predicate: IHeaderPredicate = headerPredicateFactory.uriMatch('/measureHeaderItem.uri');

                expect(predicate(measureHeaderItemWithoutUriAndIndentifier, afmWithDerived)).toEqual(true);
            });

            // tslint:disable-next-line:max-line-length
            it('should not match uri predicate against AFM when header uri is undefined and measure is not found in AFM', () => {
                const predicate: IHeaderPredicate = headerPredicateFactory.uriMatch('/someOtherUri');

                expect(predicate(measureHeaderItemWithoutUriAndIndentifier, afmWithDerived)).toEqual(false);
            });
        });

        describe('derived measures', () => {
            it('should match PP derived measure when master measure uri provided', () => {
                const predicate: IHeaderPredicate = headerPredicateFactory.uriMatch('/measureHeaderItem.uri');

                expect(predicate(measureHeaderItemPP, afmWithDerived)).toEqual(true);
            });

            it('should match SP derived measure when master measure uri provided', () => {
                const predicate: IHeaderPredicate = headerPredicateFactory.uriMatch('/measureHeaderItem.uri');

                expect(predicate(measureHeaderItemSP, afmWithDerived)).toEqual(true);
            });
        });
    });

    describe('attributeHeader', () => {
        it('should match predicate when measure item uri matches', () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.uriMatch('/attributeHeader.uri');

            expect(predicate(attributeHeader, afmWithDerived)).toEqual(true);
        });

        it('should not match predicate when measure item uri does not match', () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.uriMatch('/someOtherUri');

            expect(predicate(attributeHeader, afmWithDerived)).toEqual(false);
        });

        it('should not match predicate when empty uri provided', () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.uriMatch(null);

            expect(predicate(attributeHeader, afmWithDerived)).toEqual(false);
        });
    });

    describe('attributeHeaderItem', () => {
        it('should match predicate when measure item uri matches', () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.uriMatch('/attributeHeaderItem.uri');

            expect(predicate(attributeHeaderItem, afmWithDerived)).toEqual(true);
        });

        it('should not match predicate when measure item uri does not match', () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.uriMatch('/someOtherUri');

            expect(predicate(attributeHeaderItem, afmWithDerived)).toEqual(false);
        });

        it('should not match predicate when empty uri provided', () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.uriMatch(null);

            expect(predicate(attributeHeaderItem, afmWithDerived)).toEqual(false);
        });
    });
});

describe('identifierMatch', () => {
    describe('measureHeaderItem', () => {
        it('should match predicate when measure item identifier matches', () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.identifierMatch('measureHeaderItem.identifier');

            expect(predicate(measureHeaderItem, afmWithDerived)).toEqual(true);
        });

        it('should not match predicate when measure item identifier does not match', () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.identifierMatch('someOtherId');

            expect(predicate(measureHeaderItem, afmWithDerived)).toEqual(false);
        });

        it('should not match predicate when empty identifier provided', () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.identifierMatch(null);

            expect(predicate(measureHeaderItem, afmWithDerived)).toEqual(false);
        });

        describe('uknown header uri (adhoc measures)', () => {
            it('should match identifier predicate against AFM when header identifier is undefined', () => {
                const predicate: IHeaderPredicate =
                    headerPredicateFactory.identifierMatch('measureHeaderItem.identifier');

                expect(predicate(measureHeaderItemWithoutUriAndIndentifier, afmWithDerived)).toEqual(true);
            });

            // tslint:disable-next-line:max-line-length
            it('should not match identifier predicate against AFM when header identifier is undefined and measure is not found in AFM', () => {
                const predicate: IHeaderPredicate = headerPredicateFactory.identifierMatch('someOtherId');

                expect(predicate(measureHeaderItemWithoutUriAndIndentifier, afmWithDerived)).toEqual(false);
            });
        });

        describe('derived measures', () => {
            it('should match PP derived measure when master measure identifier provided', () => {
                const predicate: IHeaderPredicate =
                    headerPredicateFactory.identifierMatch('measureHeaderItem.identifier');

                expect(predicate(measureHeaderItemPP, afmWithDerived)).toEqual(true);
            });

            it('should match SP derived measure when master measure identifier provided', () => {
                const predicate: IHeaderPredicate =
                    headerPredicateFactory.identifierMatch('measureHeaderItem.identifier');

                expect(predicate(measureHeaderItemSP, afmWithDerived)).toEqual(true);
            });
        });
    });

    describe('attributeHeader', () => {
        it('should match predicate when measure item identifier matches', () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.identifierMatch('attributeHeader.identifier');

            expect(predicate(attributeHeader, afmWithDerived)).toEqual(true);
        });

        it('should not match predicate when measure item identifier does not match', () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.identifierMatch('someOtherId');

            expect(predicate(attributeHeader, afmWithDerived)).toEqual(false);
        });

        it('should not match predicate when empty identifier provided', () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.identifierMatch(null);

            expect(predicate(attributeHeader, afmWithDerived)).toEqual(false);
        });
    });

    describe('attributeHeaderItem', () => {
        it('should not match predicate since attributeHeaderItem does not have identifier', () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.identifierMatch(null);

            expect(predicate(attributeHeaderItem, afmWithDerived)).toEqual(false);
        });
    });
});

describe('composedFromUri', () => {
    it('should match predicate when measure uri is in measure tree', () => {
        const predicate: IHeaderPredicate = headerPredicateFactory.composedFromUri('/m1.uri');

        expect(predicate(amMeasureHeaderItems.am1, afmWithAmMeasures)).toEqual(true);
    });

    it('should match predicate when measure uri is in measure multilevel tree', () => {
        const predicate: IHeaderPredicate = headerPredicateFactory.composedFromUri('/m1.uri');

        expect(predicate(amMeasureHeaderItems.am3, afmWithAmMeasures)).toEqual(true);
    });

    it('should not match predicate when measure uri is not in measure tree', () => {
        const predicate: IHeaderPredicate = headerPredicateFactory.composedFromUri('/some-other-uri');

        expect(predicate(amMeasureHeaderItems.am1, afmWithAmMeasures)).toEqual(false);
    });

    it('should not match predicate when measure uri is not in multilevel measure tree', () => {
        const predicate: IHeaderPredicate = headerPredicateFactory.composedFromUri('/some-other-uri');

        expect(predicate(amMeasureHeaderItems.am3, afmWithAmMeasures)).toEqual(false);
    });
});

describe('composedFromIdentifier', () => {
    it('should match predicate when measure identifier is in measure tree', () => {
        const predicate: IHeaderPredicate = headerPredicateFactory.composedFromIdentifier('m1.identifier');

        expect(predicate(amMeasureHeaderItems.am1, afmWithAmMeasures)).toEqual(true);
    });

    it('should match predicate when measure identifier is in measure multilevel tree', () => {
        const predicate: IHeaderPredicate = headerPredicateFactory.composedFromIdentifier('m1.identifier');

        expect(predicate(amMeasureHeaderItems.am3, afmWithAmMeasures)).toEqual(true);
    });

    it('should not match predicate when measure identifier is not in measure tree', () => {
        const predicate: IHeaderPredicate = headerPredicateFactory.composedFromIdentifier('someOtherId');

        expect(predicate(amMeasureHeaderItems.am1, afmWithAmMeasures)).toEqual(false);
    });

    it('should not match predicate when measure identifier is not in multilevel measure tree', () => {
        const predicate: IHeaderPredicate = headerPredicateFactory.composedFromIdentifier('someOtherId');

        expect(predicate(amMeasureHeaderItems.am3, afmWithAmMeasures)).toEqual(false);
    });
});

describe('localIdentifierMatch', () => {
    it('should match predicate when measureHeaderItem localIdentifier matches', () => {
        const predicate = headerPredicateFactory.localIdentifierMatch(
            'measureHeaderItem.localIdentifier'
        );

        expect(predicate(measureHeaderItem, afmWithDerived)).toEqual(true);
    });

    it('should not match predicate when measureHeaderItem localIdentifier does not match', () => {
        const predicate = headerPredicateFactory.localIdentifierMatch('someOtherLocalIdentifier');

        expect(predicate(measureHeaderItem, afmWithDerived)).toEqual(false);
    });

    it('should not match predicate when empty localIdentifier provided', () => {
        const predicate = headerPredicateFactory.localIdentifierMatch(null);

        expect(predicate(measureHeaderItem, afmWithDerived)).toEqual(false);
    });

    it('should return false when object is not measureHeaderItem', () => {
        const predicate = headerPredicateFactory.localIdentifierMatch(
            'measureHeaderItem.localIdentifier'
        );

        expect(predicate(attributeHeaderItem, afmWithDerived)).toEqual(false);
    });
});

describe('attributeItemNameMatch', () => {
    it('should match predicate when attributeHeaderItem name matches', () => {
        const predicate = headerPredicateFactory.attributeItemNameMatch('attributeHeaderItem.name');

        expect(predicate(attributeHeaderItem, afmWithDerived)).toEqual(true);
    });

    it('should not match predicate when attributeHeaderItem name does not match', () => {
        const predicate = headerPredicateFactory.attributeItemNameMatch('someOtherName');

        expect(predicate(attributeHeaderItem, afmWithDerived)).toEqual(false);
    });

    it('should not match predicate when empty name provided', () => {
        const predicate = headerPredicateFactory.attributeItemNameMatch(null);

        expect(predicate(attributeHeaderItem, afmWithDerived)).toEqual(false);
    });

    it('should return false when object is not attributeHeaderItem', () => {
        const predicate = headerPredicateFactory.attributeItemNameMatch('attributeHeaderItem.name');

        expect(predicate(measureHeaderItem, afmWithDerived)).toEqual(false);
    });
});
