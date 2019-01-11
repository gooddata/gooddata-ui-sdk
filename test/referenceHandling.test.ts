// (C) 2007-2019 GoodData Corporation
import { convertReferencesToUris, convertUrisToReferences } from '../src/referenceHandling';
import * as fixtures from './fixtures/referenceHandling';

describe('reference handling', () => {
    describe('convertReferencesToUris', () => {
        it('should convert colorMapping with correct references properly', () => {
            expect(convertReferencesToUris(fixtures.colorMappingWithReferencesAndExistingReferences))
                .toEqual(fixtures.colorMappingWithUrisAndExistingReferences);
        });

        it('should not throw on colorMapping with invalid references', () => {
            expect(() => convertReferencesToUris(fixtures.colorMappingWithReferencesAndMismatchingReferences))
                .not.toThrow();
        });

        it('should convert colorMapping with only measures properly', () => {
            expect(convertReferencesToUris(fixtures.colorMappingWithReferencesAndEmptyReferences))
                .toEqual(fixtures.colorMappingWithReferencesAndNoReferences);
        });

        it('should convert sorting with correct references properly', () => {
            expect(convertReferencesToUris(fixtures.sortLocatorsWithReferencesAndNewReferences))
                .toEqual(fixtures.sortLocatorsWithUrisAndExistingReferences);
        });
    });

    describe('convertUrisToReferences', () => {
        let idGenerator = () => 'NOT INITIALIZED';
        beforeEach(() => {
            idGenerator = (() => {
                let lastId = 0;
                return () => `id_${lastId++}`;
            })();
        });

        it('should convert colorMapping properly with existing references', () => {
            expect(convertUrisToReferences(fixtures.colorMappingWithUrisAndExistingReferences, idGenerator))
                .toEqual(fixtures.colorMappingWithReferencesAndExistingReferences);
        });

        it('should convert colorMapping properly with existing references and strip unused ones', () => {
            expect(convertUrisToReferences(fixtures.colorMappingWithUrisAndSurplusReferences, idGenerator))
                .toEqual(fixtures.colorMappingWithReferencesAndExistingReferences);
        });

        it('should convert colorMapping properly with no references', () => {
            expect(convertUrisToReferences(fixtures.colorMappingWithUrisAndNoReferences, idGenerator))
                .toEqual(fixtures.colorMappingWithReferencesAndNewReferences);
        });

        it('should convert colorMapping with only measures properly', () => {
            expect(convertUrisToReferences(fixtures.colorMappingWithReferencesAndEmptyReferences))
                .toEqual(fixtures.colorMappingWithReferencesAndNoReferences);
        });

        it('should convert sorting properly with no references', () => {
            expect(convertUrisToReferences(fixtures.sortLocatorsWithUrisAndNoReferences, idGenerator))
                .toEqual(fixtures.sortLocatorsWithReferencesAndNewReferences);
        });
    });
});
