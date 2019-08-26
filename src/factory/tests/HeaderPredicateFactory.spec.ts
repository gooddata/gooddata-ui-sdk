// (C) 2007-2018 GoodData Corporation
import { IHeaderPredicate } from "../../interfaces/HeaderPredicate";
import * as headerPredicateFactory from "../HeaderPredicateFactory";
import { measureHeaders, context, attributeHeaderItem, attributeHeader } from "./HeaderPredicateFactory.mock";

describe("uriMatch", () => {
    describe("measure headers", () => {
        describe("simple measure headers", () => {
            it("should match when uri-based measure uri matches header uri", () => {
                const predicate: IHeaderPredicate = headerPredicateFactory.uriMatch("/uriBasedMeasureUri");

                expect(predicate(measureHeaders.uriBasedMeasure, context)).toBe(true);
            });
            it("should match when identifier-based measure uri matches header uri", () => {
                const predicate: IHeaderPredicate = headerPredicateFactory.uriMatch(
                    "identifierBasedMeasureUri",
                );

                expect(predicate(measureHeaders.identifierBasedMeasure, context)).toBe(true);
            });

            it("should NOT match when measure uri does not match header uri", () => {
                const predicate: IHeaderPredicate = headerPredicateFactory.uriMatch("/someOtherUri");

                expect(predicate(measureHeaders.uriBasedMeasure, context)).toBe(false);
            });
            it("should NOT match when measure uri is null", () => {
                const predicate: IHeaderPredicate = headerPredicateFactory.uriMatch(null);

                expect(predicate(measureHeaders.uriBasedMeasure, context)).toBe(false);
            });
            it("should NOT match when measure uri is empty", () => {
                const predicate: IHeaderPredicate = headerPredicateFactory.uriMatch("");

                expect(predicate(measureHeaders.uriBasedMeasure, context)).toBe(false);
            });
        });

        describe("show in % ad-hoc measure headers", () => {
            // tslint:disable-next-line:max-line-length
            it("should match when show in % ad-hoc measure matches uri used to define measure in afm", () => {
                const predicate: IHeaderPredicate = headerPredicateFactory.uriMatch(
                    "/uriBasedRatioMeasureUri",
                );

                expect(predicate(measureHeaders.uriBasedRatioMeasure, context)).toBe(true);
            });
            // tslint:disable-next-line:max-line-length
            it("should NOT match when show in % ad-hoc measure since identifier was used to define measure in afm and ad-hoc headers does not contain identifiers", () => {
                const predicate: IHeaderPredicate = headerPredicateFactory.uriMatch(
                    "/identifierBasedRatioMeasureUri",
                );

                expect(predicate(measureHeaders.identifierBasedRatioMeasure, context)).toBe(false);
            });
        });

        describe("ad-hoc measure headers", () => {
            // tslint:disable-next-line:max-line-length
            it("should NOT match when ad-hoc measure is created from identifier-based attribute matching uri since uri of attribute not available in execution response or afm", () => {
                const predicate: IHeaderPredicate = headerPredicateFactory.uriMatch("/attributeUri");

                expect(predicate(measureHeaders.identifierBasedAdhocMeasure, context)).toBe(false);
            });
            // tslint:disable-next-line:max-line-length
            it("should match when ad-hoc measure is created from uri-based attribute matching uri", () => {
                const predicate: IHeaderPredicate = headerPredicateFactory.uriMatch("/attributeUri");

                expect(predicate(measureHeaders.uriBasedAdhocMeasure, context)).toBe(true);
            });
        });

        describe("derived measure headers", () => {
            it("should match when uri-based PP derived measure uri matches header uri", () => {
                const predicate: IHeaderPredicate = headerPredicateFactory.uriMatch("/uriBasedMeasureUri");

                expect(predicate(measureHeaders.uriBasedPPMeasure, context)).toBe(true);
            });
            it("should match when identifier-based PP derived measure uri matches header uri", () => {
                const predicate: IHeaderPredicate = headerPredicateFactory.uriMatch(
                    "identifierBasedMeasureUri",
                );

                expect(predicate(measureHeaders.identifierBasedPPMeasure, context)).toBe(true);
            });

            it("should match when uri-based SP derived measure uri matches header identifier", () => {
                const predicate: IHeaderPredicate = headerPredicateFactory.uriMatch("/uriBasedMeasureUri");

                expect(predicate(measureHeaders.uriBasedSPMeasure, context)).toBe(true);
            });
            it("should match when identifier-based SP derived measure uri matches header uri", () => {
                const predicate: IHeaderPredicate = headerPredicateFactory.uriMatch(
                    "identifierBasedMeasureUri",
                );

                expect(predicate(measureHeaders.identifierBasedSPMeasure, context)).toBe(true);
            });
        });

        describe("derived show in % measure headers", () => {
            it("should match when uri-based PP derived ratio measure uri matches header uri", () => {
                const predicate: IHeaderPredicate = headerPredicateFactory.uriMatch(
                    "/uriBasedRatioMeasureUri",
                );

                expect(predicate(measureHeaders.uriBasedPPRatioMeasure, context)).toBe(true);
            });
            // tslint:disable-next-line:max-line-length
            it("should NOT match when identifier-based PP derived ratio measure uri matches header uri since measure was defined using identifier in afm and ratio measure headers does not contain uri", () => {
                const predicate: IHeaderPredicate = headerPredicateFactory.uriMatch(
                    "/identifierBasedRatioMeasureUri",
                );

                expect(predicate(measureHeaders.identifierBasedPPRatioMeasure, context)).toBe(false);
            });

            it("should match when uri-based SP derived ratio measure uri matches header uri", () => {
                const predicate: IHeaderPredicate = headerPredicateFactory.uriMatch(
                    "/uriBasedRatioMeasureUri",
                );

                expect(predicate(measureHeaders.uriBasedSPRatioMeasure, context)).toBe(true);
            });
            // tslint:disable-next-line:max-line-length
            it("should NOT match when identifier-based SP derived ratio measure uri matches header uri since measure was defined using identifier in afm and ration measure headers does not contain uri", () => {
                const predicate: IHeaderPredicate = headerPredicateFactory.uriMatch(
                    "/identifierBasedRatioMeasureUri",
                );

                expect(predicate(measureHeaders.identifierBasedSPRatioMeasure, context)).toBe(false);
            });
        });

        describe("AM headers", () => {
            it("should NOT match when AM uri-based operand uri matches header uri", () => {
                const predicate: IHeaderPredicate = headerPredicateFactory.uriMatch("/uriBasedMeasureUri");

                expect(predicate(measureHeaders.arithmeticMeasure, context)).toBe(false);
            });
            it("should NOT match when AM identifier-based operand uri matches header uri", () => {
                const predicate: IHeaderPredicate = headerPredicateFactory.uriMatch(
                    "identifierBasedMeasureUri",
                );

                expect(predicate(measureHeaders.arithmeticMeasure, context)).toBe(false);
            });
        });
    });

    describe("attribute headers", () => {
        it("should match when measure item uri matches", () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.uriMatch("/attributeUri");

            expect(predicate(attributeHeader, context)).toBe(true);
        });
        it("should NOT match when measure item uri does not match", () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.uriMatch("/someOtherUri");

            expect(predicate(attributeHeader, context)).toBe(false);
        });
    });

    describe("attribute item header", () => {
        it("should match when attributeHeaderItem matches uri", () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.uriMatch("/attributeItemUri");

            expect(predicate(attributeHeaderItem, context)).toBe(true);
        });
        it("should NOT match when attributeHeaderItem does not match uri", () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.uriMatch("/someOtherUri");

            expect(predicate(attributeHeaderItem, context)).toBe(false);
        });
    });
});

describe("identifierMatch", () => {
    describe("measure headers", () => {
        describe("simple measure headers", () => {
            it("should match when uri-based measure identifier matches header identifier", () => {
                const predicate: IHeaderPredicate = headerPredicateFactory.identifierMatch(
                    "uriBasedMeasureIdentifier",
                );

                expect(predicate(measureHeaders.uriBasedMeasure, context)).toBe(true);
            });
            it("should match when identifier-based measure identifier matches header identifier", () => {
                const predicate: IHeaderPredicate = headerPredicateFactory.identifierMatch(
                    "identifierBasedMeasureIdentifier",
                );

                expect(predicate(measureHeaders.identifierBasedMeasure, context)).toBe(true);
            });

            it("should NOT match when measure identifier does not match header identifier", () => {
                const predicate: IHeaderPredicate = headerPredicateFactory.identifierMatch("someOtherId");

                expect(predicate(measureHeaders.uriBasedMeasure, context)).toBe(false);
            });
            it("should NOT match when measure identifier is null", () => {
                const predicate: IHeaderPredicate = headerPredicateFactory.identifierMatch(null);

                expect(predicate(measureHeaders.uriBasedMeasure, context)).toBe(false);
            });
            it("should NOT match when measure identifier is empty", () => {
                const predicate: IHeaderPredicate = headerPredicateFactory.identifierMatch("");

                expect(predicate(measureHeaders.uriBasedMeasure, context)).toBe(false);
            });
        });

        describe("show in % ad-hoc measure headers", () => {
            // tslint:disable-next-line:max-line-length
            it("should NOT match when show in % ad-hoc measure since uri was used to define measure in afm and ad-hoc headers does not contain uris", () => {
                const predicate: IHeaderPredicate = headerPredicateFactory.identifierMatch(
                    "uriBasedRatioMeasureIdentifier",
                );

                expect(predicate(measureHeaders.uriBasedRatioMeasure, context)).toBe(false);
            });
            // tslint:disable-next-line:max-line-length
            it("should match when show in % ad-hoc measure matches identifier used to define measure in afm", () => {
                const predicate: IHeaderPredicate = headerPredicateFactory.identifierMatch(
                    "identifierBasedRatioMeasureIdentifier",
                );

                expect(predicate(measureHeaders.identifierBasedRatioMeasure, context)).toBe(true);
            });
        });

        describe("ad-hoc measure headers", () => {
            // tslint:disable-next-line:max-line-length
            it("should NOT match when ad-hoc measure is created from uri-based attribute matching identifier since identifier of attribute not available in execution response or afm", () => {
                const predicate: IHeaderPredicate = headerPredicateFactory.identifierMatch(
                    "uriBasedMeasureIdentifier",
                );

                expect(predicate(measureHeaders.uriBasedAdhocMeasure, context)).toBe(false);
            });
            // tslint:disable-next-line:max-line-length
            it("should match when ad-hoc measure is created from identifier-based attribute matching identifier", () => {
                const predicate: IHeaderPredicate = headerPredicateFactory.identifierMatch(
                    "attributeIdentifier",
                );

                expect(predicate(measureHeaders.identifierBasedAdhocMeasure, context)).toBe(true);
            });
        });

        describe("derived measure headers", () => {
            it("should match when uri-based PP derived measure identifier matches header identifier", () => {
                const predicate: IHeaderPredicate = headerPredicateFactory.identifierMatch(
                    "uriBasedMeasureIdentifier",
                );

                expect(predicate(measureHeaders.uriBasedPPMeasure, context)).toBe(true);
            });
            it("should match when identifier-based PP derived measure identifier matches header identifier", () => {
                const predicate: IHeaderPredicate = headerPredicateFactory.identifierMatch(
                    "identifierBasedMeasureIdentifier",
                );

                expect(predicate(measureHeaders.identifierBasedPPMeasure, context)).toBe(true);
            });

            it("should match when uri-based SP derived measure identifier matches header identifier", () => {
                const predicate: IHeaderPredicate = headerPredicateFactory.identifierMatch(
                    "uriBasedMeasureIdentifier",
                );

                expect(predicate(measureHeaders.uriBasedSPMeasure, context)).toBe(true);
            });
            it("should match when identifier-based SP derived measure identifier matches header identifier", () => {
                const predicate: IHeaderPredicate = headerPredicateFactory.identifierMatch(
                    "identifierBasedMeasureIdentifier",
                );

                expect(predicate(measureHeaders.identifierBasedSPMeasure, context)).toBe(true);
            });
        });

        describe("derived show in % measure headers", () => {
            // tslint:disable-next-line:max-line-length
            it("should NOT match when uri-based PP derived ratio measure identifier matches header identifier since measure was defined using uri in afm and ratio measure headers does not contain identifier", () => {
                const predicate: IHeaderPredicate = headerPredicateFactory.identifierMatch(
                    "uriBasedRatioMeasureIdentifier",
                );

                expect(predicate(measureHeaders.uriBasedPPRatioMeasure, context)).toBe(false);
            });
            // tslint:disable-next-line:max-line-length
            it("should match when identifier-based PP derived ratio measure identifier matches header identifier", () => {
                const predicate: IHeaderPredicate = headerPredicateFactory.identifierMatch(
                    "identifierBasedRatioMeasureIdentifier",
                );

                expect(predicate(measureHeaders.identifierBasedPPRatioMeasure, context)).toBe(true);
            });

            // tslint:disable-next-line:max-line-length
            it("should NOT match when uri-based SP derived ratio measure identifier matches header identifier since measure was defined using uri in afm and ratio measure headers does not contain identifier", () => {
                const predicate: IHeaderPredicate = headerPredicateFactory.identifierMatch(
                    "uriBasedRatioMeasureIdentifier",
                );

                expect(predicate(measureHeaders.uriBasedSPRatioMeasure, context)).toBe(false);
            });
            // tslint:disable-next-line:max-line-length
            it("should match when identifier-based SP derived ratio measure identifier matches header identifier", () => {
                const predicate: IHeaderPredicate = headerPredicateFactory.identifierMatch(
                    "identifierBasedRatioMeasureIdentifier",
                );

                expect(predicate(measureHeaders.identifierBasedSPRatioMeasure, context)).toBe(true);
            });
        });

        describe("AM headers", () => {
            // tslint:disable-next-line:max-line-length
            it("should NOT match when AM uri-based operand identifier matches header identifier since AMs are not supported", () => {
                const predicate: IHeaderPredicate = headerPredicateFactory.identifierMatch(
                    "uriBasedMeasureIdentifier",
                );

                expect(predicate(measureHeaders.arithmeticMeasure, context)).toBe(false);
            });
            // tslint:disable-next-line:max-line-length
            it("should NOT match when AM identifier-based operand identifier matches header identifier since AMs are not supported", () => {
                const predicate: IHeaderPredicate = headerPredicateFactory.identifierMatch(
                    "identifierBasedMeasureIdentifier",
                );

                expect(predicate(measureHeaders.arithmeticMeasure, context)).toBe(false);
            });
        });
    });

    describe("attribute headers", () => {
        it("should match when measure item identifier matches", () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.identifierMatch("attributeIdentifier");

            expect(predicate(attributeHeader, context)).toBe(true);
        });
        it("should NOT match when measure item identifier does not match", () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.identifierMatch("someOtherIdentifier");

            expect(predicate(attributeHeader, context)).toBe(false);
        });
    });

    describe("attribute item headers", () => {
        it("should NOT match since attributeHeaderItem does not have identifier", () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.identifierMatch(null);

            expect(predicate(attributeHeaderItem, context)).toBe(false);
        });
    });
});

describe("composedFromUri", () => {
    describe("simple measure headers (not supported)", () => {
        it("should NOT match when uri-based measure identifier matches header identifier", () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.composedFromIdentifier(
                "uriBasedMeasureIdentifier",
            );

            expect(predicate(measureHeaders.uriBasedMeasure, context)).toBe(false);
        });
        it("should NOT match when identifier-based measure identifier matches header identifier", () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.composedFromIdentifier(
                "identifierBasedMeasureIdentifier",
            );

            expect(predicate(measureHeaders.identifierBasedMeasure, context)).toBe(false);
        });
    });

    describe("ad-hoc measure headers (not supported)", () => {
        // tslint:disable-next-line:max-line-length
        it("should NOT match when ad-hoc measure is created from identifier-based attribute matching uri", () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.composedFromUri("/attributeUri");

            expect(predicate(measureHeaders.identifierBasedAdhocMeasure, context)).toBe(false);
        });
        // tslint:disable-next-line:max-line-length
        it("should NOT match when ad-hoc measure is created from uri-based attribute matching uri", () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.composedFromUri("/attributeUri");

            expect(predicate(measureHeaders.uriBasedAdhocMeasure, context)).toBe(false);
        });
    });

    describe("derived measure headers (not supported)", () => {
        it("should NOT match when uri-based PP derived measure uri matches header uri", () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.composedFromUri("/uriBasedPPMeasure");

            expect(predicate(measureHeaders.uriBasedPPMeasure, context)).toBe(false);
        });
        it("should NOT match when identifier-based PP derived measure uri matches header uri", () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.composedFromUri(
                "/identifierBasedPPMeasure",
            );

            expect(predicate(measureHeaders.identifierBasedPPMeasure, context)).toBe(false);
        });
    });

    describe("AM headers", () => {
        it("should match when AM uri-based operand uri matches header uri", () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.composedFromUri("/uriBasedMeasureUri");

            expect(predicate(measureHeaders.arithmeticMeasure, context)).toBe(true);
        });
        it("should match when AM identifier-based operand uri matches header uri", () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.composedFromUri(
                "identifierBasedMeasureUri",
            );

            expect(predicate(measureHeaders.arithmeticMeasure, context)).toBe(true);
        });
        it("should NOT match when AM uri-based operand uri does not match header uri", () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.composedFromUri("/someUri");

            expect(predicate(measureHeaders.arithmeticMeasure, context)).toBe(false);
        });
    });

    describe("2nd order AM headers", () => {
        it("should match when 2nd order AM uri-based operand uri matches header uri", () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.composedFromUri("/uriBasedMeasureUri");

            expect(predicate(measureHeaders.arithmeticMeasureOf2ndOrder, context)).toBe(true);
        });
        // tslint:disable-next-line:max-line-length
        it("should match when 2nd order AM identifier-based operand uri matches header uri", () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.composedFromUri(
                "identifierBasedMeasureUri",
            );

            expect(predicate(measureHeaders.arithmeticMeasureOf2ndOrder, context)).toBe(true);
        });
        it("should NOT match when 2nd order AM uri-based operand uri does not match header uri", () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.composedFromUri("/someOtherUri");

            expect(predicate(measureHeaders.arithmeticMeasureOf2ndOrder, context)).toBe(false);
        });
    });

    describe("derived AM headers", () => {
        it("should match when AM uri-based PP+SP derived operand uri matches header uri", () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.composedFromUri("/uriBasedMeasureUri");

            expect(predicate(measureHeaders.uriBasedCompareArithmeticMeasure, context)).toBe(true);
        });
        it("should match when AM identifier-based PP+SP derived operand uri matches header uri", () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.composedFromUri(
                "identifierBasedMeasureUri",
            );

            expect(predicate(measureHeaders.identifierBasedCompareArithmeticMeasure, context)).toBe(true);
        });
    });

    describe("derived from AM", () => {
        it("should match when derived PP from AM matches header uri", () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.composedFromUri("/uriBasedMeasureUri");

            expect(predicate(measureHeaders.derivedPPFromArithmeticMeasure, context)).toEqual(true);
        });

        it("should not match when derived PP from AM doesn't match header uri", () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.composedFromUri("/someOtherUri");

            expect(predicate(measureHeaders.derivedPPFromArithmeticMeasure, context)).toEqual(false);
        });

        it("should match when derived SP from AM matches header uri", () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.composedFromUri("/uriBasedMeasureUri");

            expect(predicate(measureHeaders.derivedSPFromArithmeticMeasure, context)).toEqual(true);
        });

        it("should not match when derived SP from AM doesn't match header uri", () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.composedFromUri("/someOtherUri");

            expect(predicate(measureHeaders.derivedSPFromArithmeticMeasure, context)).toEqual(false);
        });
    });
});

describe("composedFromIdentifier", () => {
    describe("simple measure headers (not supported)", () => {
        it("should NOT match when uri-based measure identifier matches header identifier", () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.composedFromIdentifier(
                "uriBasedMeasureIdentifier",
            );

            expect(predicate(measureHeaders.uriBasedMeasure, context)).toBe(false);
        });
        it("should NOT match when identifier-based measure identifier matches header identifier", () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.composedFromIdentifier(
                "identifierBasedMeasureIdentifier",
            );

            expect(predicate(measureHeaders.identifierBasedMeasure, context)).toBe(false);
        });
    });

    describe("ad-hoc measure headers (not supported)", () => {
        // tslint:disable-next-line:max-line-length
        it("should NOT match when ad-hoc measure is created from uri-based attribute matching identifier", () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.composedFromIdentifier(
                "uriBasedIdentifier",
            );

            expect(predicate(measureHeaders.uriBasedAdhocMeasure, context)).toBe(false);
        });
        // tslint:disable-next-line:max-line-length
        it("should NOT match when ad-hoc measure is created from identifier-based attribute matching identifier", () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.composedFromIdentifier(
                "attributeIdentifier",
            );

            expect(predicate(measureHeaders.identifierBasedAdhocMeasure, context)).toBe(false);
        });
    });

    describe("derived measure headers (not supported)", () => {
        it("should NOT match when uri-based PP derived measure identifier matches header identifier", () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.composedFromIdentifier(
                "uriBasedPPMeasureIdentifier",
            );

            expect(predicate(measureHeaders.uriBasedPPMeasure, context)).toBe(false);
        });
        it("should NOT match when identifier-based PP derived measure identifier matches header identifier", () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.composedFromIdentifier(
                "identifierBasedPPMeasureIdentifier",
            );

            expect(predicate(measureHeaders.identifierBasedPPMeasure, context)).toBe(false);
        });
    });

    describe("AM headers", () => {
        it("should match when AM uri-based operand identifier matches header identifier", () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.composedFromIdentifier(
                "uriBasedMeasureIdentifier",
            );

            expect(predicate(measureHeaders.arithmeticMeasure, context)).toBe(true);
        });
        it("should match when AM identifier-based operand identifier matches header identifier", () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.composedFromIdentifier(
                "identifierBasedMeasureIdentifier",
            );

            expect(predicate(measureHeaders.arithmeticMeasure, context)).toBe(true);
        });
        it("should NOT match when AM uri-based operand identifier does not match header identifier", () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.composedFromIdentifier(
                "someIdentifier",
            );

            expect(predicate(measureHeaders.arithmeticMeasure, context)).toBe(false);
        });
    });

    describe("2nd order AM headers", () => {
        it("should match when 2nd order AM uri-based operand identifier matches header identifier", () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.composedFromIdentifier(
                "uriBasedMeasureIdentifier",
            );

            expect(predicate(measureHeaders.arithmeticMeasureOf2ndOrder, context)).toBe(true);
        });
        // tslint:disable-next-line:max-line-length
        it("should match when 2nd order AM identifier-based operand identifier matches header identifier", () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.composedFromIdentifier(
                "identifierBasedMeasureIdentifier",
            );

            expect(predicate(measureHeaders.arithmeticMeasureOf2ndOrder, context)).toBe(true);
        });
        it("should NOT match when 2nd order AM uri-based operand identifier does not match header identifier", () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.composedFromIdentifier("someOtherId");

            expect(predicate(measureHeaders.arithmeticMeasureOf2ndOrder, context)).toBe(false);
        });
    });

    describe("derived AM headers", () => {
        it("should match when AM uri-based PP+SP derived operand identifier matches header identifier", () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.composedFromIdentifier(
                "uriBasedMeasureIdentifier",
            );

            expect(predicate(measureHeaders.uriBasedCompareArithmeticMeasure, context)).toBe(true);
        });
        it("should match when AM identifier-based PP+SP derived operand identifier matches header identifier", () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.composedFromIdentifier(
                "identifierBasedMeasureIdentifier",
            );

            expect(predicate(measureHeaders.identifierBasedCompareArithmeticMeasure, context)).toBe(true);
        });
    });

    describe("derived from AM", () => {
        it("should match when derived PP from AM matches header uri", () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.composedFromIdentifier(
                "identifierBasedMeasureIdentifier",
            );

            expect(predicate(measureHeaders.derivedPPFromArithmeticMeasure, context)).toEqual(true);
        });

        it("should not match when derived PP from AM doesn't match header uri", () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.composedFromIdentifier(
                "someOtherIdentifier",
            );

            expect(predicate(measureHeaders.derivedPPFromArithmeticMeasure, context)).toEqual(false);
        });

        it("should match when derived SP from AM matches header uri", () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.composedFromIdentifier(
                "identifierBasedMeasureIdentifier",
            );

            expect(predicate(measureHeaders.derivedSPFromArithmeticMeasure, context)).toEqual(true);
        });

        it("should not match when derived SP from AM doesn't match header uri", () => {
            const predicate: IHeaderPredicate = headerPredicateFactory.composedFromIdentifier(
                "someOtherIdentifier",
            );

            expect(predicate(measureHeaders.derivedSPFromArithmeticMeasure, context)).toEqual(false);
        });
    });
});

describe("localIdentifierMatch", () => {
    it("should match predicate when measureHeaderItem localIdentifier matches", () => {
        const predicate = headerPredicateFactory.localIdentifierMatch("uriBasedMeasureLocalIdentifier");

        expect(predicate(measureHeaders.uriBasedMeasure, context)).toBe(true);
    });

    it("should not match predicate when measureHeaderItem localIdentifier does not match", () => {
        const predicate = headerPredicateFactory.localIdentifierMatch("someOtherLocalIdentifier");

        expect(predicate(measureHeaders.uriBasedMeasure, context)).toBe(false);
    });

    it("should not match predicate when empty localIdentifier provided", () => {
        const predicate = headerPredicateFactory.localIdentifierMatch(null);

        expect(predicate(measureHeaders.uriBasedMeasure, context)).toBe(false);
    });

    it("should return false when object is not measureHeaderItem", () => {
        const predicate = headerPredicateFactory.localIdentifierMatch("measureHeaderItem.localIdentifier");

        expect(predicate(attributeHeaderItem, context)).toBe(false);
    });
});

describe("attributeItemNameMatch", () => {
    it("should match predicate when attributeHeaderItem name matches", () => {
        const predicate = headerPredicateFactory.attributeItemNameMatch("attributeItemName");

        expect(predicate(attributeHeaderItem, context)).toBe(true);
    });

    it("should not match predicate when attributeHeaderItem name does not match", () => {
        const predicate = headerPredicateFactory.attributeItemNameMatch("someOtherName");

        expect(predicate(attributeHeaderItem, context)).toBe(false);
    });

    it("should not match predicate when empty name provided", () => {
        const predicate = headerPredicateFactory.attributeItemNameMatch(null);

        expect(predicate(attributeHeaderItem, context)).toBe(false);
    });

    it("should return false when object is not attributeHeaderItem", () => {
        const predicate = headerPredicateFactory.attributeItemNameMatch("attributeItemName");

        expect(predicate(measureHeaders.uriBasedMeasure, context)).toBe(false);
    });
});
