// (C) 2019-2026 GoodData Corporation

// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";

import { convertReferencesToUris, convertUrisToReferences } from "./ReferenceConverter.js";
import {
    colorMappingWithReferencesAndEmptyReferences,
    colorMappingWithReferencesAndExistingReferences,
    colorMappingWithReferencesAndMismatchingReferences,
    colorMappingWithReferencesAndNewReferences,
    colorMappingWithReferencesAndNoReferences,
    colorMappingWithUrisAndExistingReferences,
    colorMappingWithUrisAndNoReferences,
    colorMappingWithUrisAndSurplusReferences,
    sortLocatorsWithReferencesAndNewReferences,
    sortLocatorsWithUrisAndExistingReferences,
    sortLocatorsWithUrisAndNoReferences,
} from "./ReferenceConverter.test.helpers.js";

describe("reference handling", () => {
    describe("convertReferencesToUris", () => {
        it("should convert colorMapping with correct references properly", () => {
            expect(convertReferencesToUris(colorMappingWithReferencesAndExistingReferences)).toEqual(
                colorMappingWithUrisAndExistingReferences,
            );
        });

        it("should not throw on colorMapping with invalid references", () => {
            expect(() =>
                convertReferencesToUris(colorMappingWithReferencesAndMismatchingReferences),
            ).not.toThrow();
        });

        it("should convert colorMapping with only measures properly", () => {
            expect(convertReferencesToUris(colorMappingWithReferencesAndEmptyReferences)).toEqual(
                colorMappingWithReferencesAndNoReferences,
            );
        });

        it("should convert sorting with correct references properly", () => {
            expect(convertReferencesToUris(sortLocatorsWithReferencesAndNewReferences)).toEqual(
                sortLocatorsWithUrisAndExistingReferences,
            );
        });
    });

    describe("convertUrisToReferences", () => {
        let idGenerator = () => "NOT INITIALIZED";
        beforeEach(() => {
            idGenerator = (() => {
                let lastId = 0;
                return () => `id_${lastId++}`;
            })();
        });

        it("should convert colorMapping properly with existing references", () => {
            expect(convertUrisToReferences(colorMappingWithUrisAndExistingReferences, idGenerator)).toEqual(
                colorMappingWithReferencesAndExistingReferences,
            );
        });

        it("should convert colorMapping properly with existing references and strip unused ones", () => {
            expect(convertUrisToReferences(colorMappingWithUrisAndSurplusReferences, idGenerator)).toEqual(
                colorMappingWithReferencesAndExistingReferences,
            );
        });

        it("should convert colorMapping properly with no references", () => {
            expect(convertUrisToReferences(colorMappingWithUrisAndNoReferences, idGenerator)).toEqual(
                colorMappingWithReferencesAndNewReferences,
            );
        });

        it("should convert colorMapping with only measures properly", () => {
            expect(convertUrisToReferences(colorMappingWithReferencesAndEmptyReferences)).toEqual(
                colorMappingWithReferencesAndNoReferences,
            );
        });

        it("should convert sorting properly with no references", () => {
            expect(convertUrisToReferences(sortLocatorsWithUrisAndNoReferences, idGenerator)).toEqual(
                sortLocatorsWithReferencesAndNewReferences,
            );
        });
    });
});
