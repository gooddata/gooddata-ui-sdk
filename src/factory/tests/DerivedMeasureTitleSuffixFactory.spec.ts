// (C) 2007-2018 GoodData Corporation
import DerivedMeasureTitleSuffixFactory from '../DerivedMeasureTitleSuffixFactory';

describe('DerivedMeasureTitleSuffixFactory', () => {
    describe('getSuffix', () => {
        it('should return empty string for simple measure', () => {
            const suffixFactory = new DerivedMeasureTitleSuffixFactory('en-US');
            const suffix = suffixFactory.getSuffix({
                measureDefinition: {
                    item: {
                        uri: '/uri'
                    }
                }
            });
            expect(suffix).toEqual('');
        });

        it('should return correct suffix for PoP measure', () => {
            const suffixFactory = new DerivedMeasureTitleSuffixFactory('en-US');
            const suffix = suffixFactory.getSuffix({
                popMeasureDefinition: {
                    measureIdentifier: 'm1',
                    popAttribute: {
                        uri: '/uri'
                    }
                }
            });
            expect(suffix).toEqual(' - SP year ago');
        });

        it('should return correct suffix for previous period measure', () => {
            const suffixFactory = new DerivedMeasureTitleSuffixFactory('en-US');
            const suffix = suffixFactory.getSuffix({
                previousPeriodMeasure: {
                    measureIdentifier: 'm1',
                    dateDataSets: [{
                        dataSet: {
                            uri: '/uri'
                        },
                        periodsAgo: 1
                    }]
                }
            });
            expect(suffix).toEqual(' - period ago');
        });
    });
});
