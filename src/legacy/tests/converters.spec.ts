import omit = require('lodash/omit');

import {
    empty,
    simpleMeasure,
    filteredMeasure,
    popMeasure,
    popMeasureWithSorting,
    showInPercent,
    showInPercentWithDate,
    measureWithSorting,
    categoryWithSorting,
    factBasedMeasure,
    attributeBasedMeasure,
    stackingAttribute,
    attributeFilter,
    dateFilter,
    attributeWithIdentifier,
    ATTRIBUTE_URI,
    ATTRIBUTE_DISPLAY_FORM_URI
} from './fixtures/Afm.fixtures';

import { charts } from './fixtures/VisObj.fixtures';

import { toVisObj, toAFM } from '../../legacy/converters';
import { VisualizationType } from '../model/VisualizationObject';
import { IHeader } from '../../interfaces/Header';

const bar: VisualizationType = 'bar';

describe('converters', () => {
    describe('toVizObj', () => {
        function removeAttribute(vizObj) {
            return {
                ...vizObj,
                buckets: {
                    ...vizObj.buckets,
                    categories: vizObj.buckets.categories.map((category) => {
                        return {
                            category: {
                                ...omit(category.category, ['attribute'])
                            }
                        };
                    }),
                    filters: vizObj.buckets.filters.map((filter) => {
                        if (filter.dateFilter) {
                            return {
                                dateFilter: {
                                    ...omit(filter.dateFilter, ['attribute'])
                                }
                            };
                        }

                        return {
                            listAttributeFilter: {
                                ...omit(filter.listAttributeFilter, ['attribute'])
                            }
                        };
                    })
                }
            };
        }

        it('should convert empty AFM to empty viz. object', () => {
            const { afm, transformation } = empty;

            expect(toVisObj(bar, afm, transformation)).toEqual({
                type: 'bar',

                buckets: {
                    measures: [],
                    categories: [],
                    filters: []
                }
            });
        });

        it('should convert simple measure', () => {
            const { afm, transformation } = simpleMeasure;

            expect(toVisObj(bar, afm, transformation)).toEqual(charts.bar.simpleMeasure);
        });

        it('should convert fact based measure', () => {
            const { afm, transformation } = factBasedMeasure;

            expect(toVisObj(bar, afm, transformation)).toEqual(charts.bar.factBasedMeasure);
        });

        it('should convert attribute base measure', () => {
            const { afm, transformation } = attributeBasedMeasure;

            expect(toVisObj(bar, afm, transformation)).toEqual(charts.bar.attributeBasedMeasure);
        });

        it('should handle the case when no transformation is given', () => {
            const { afm } = simpleMeasure;

            expect(toVisObj(bar, afm, null)).toEqual({
                type: 'bar',

                buckets: {
                    measures: [{
                        measure: {
                            measureFilters: [],
                            objectUri: '/gdc/md/project/obj/metric.id',
                            showInPercent: false,
                            showPoP: false,
                            title: 'm1',
                            type: 'metric'
                        }
                    }],
                    categories: [],
                    filters: []
                }
            });
        });

        it('should convert show in percent measure with attribute', () => {
            const { afm, transformation } = showInPercent;

            expect(toVisObj(bar, afm, transformation)).toEqual(charts.bar.showInPercent);
        });

        it('should convert show in percent measure with date', () => {
            const { afm, transformation } = showInPercentWithDate;

            expect(toVisObj(bar, afm, transformation)).toEqual(charts.bar.showInPercentWithDate);
        });

        it('should apply sorting to simple measure', () => {
            const { afm, transformation } = measureWithSorting;

            expect(toVisObj(bar, afm, transformation)).toEqual(charts.bar.measureWithSorting);
        });

        it('should handle measure with PoP', () => {
            const { afm, transformation } = popMeasure;

            expect(removeAttribute(toVisObj(bar, afm, transformation))).toEqual(removeAttribute(charts.bar.popMeasure));
        });

        it('should handle measure with PoP with sorting', () => {
            const { afm, transformation } = popMeasureWithSorting;

            expect(toVisObj(bar, afm, transformation)).toEqual(removeAttribute(charts.bar.popMeasureWithSorting));
        });

        it('should apply sorting to category', () => {
            const { afm, transformation } = categoryWithSorting;

            expect(toVisObj(bar, afm, transformation)).toEqual(charts.bar.categoryWithSorting);
        });

        it('should set attribute collection to stack', () => {
            const { afm, transformation } = stackingAttribute;

            expect(toVisObj(bar, afm, transformation)).toEqual(removeAttribute(charts.bar.stackingAttribute));
        });
    });

    describe('toAFM', () => {
        const attributesMap = {
            [ATTRIBUTE_URI]: ATTRIBUTE_DISPLAY_FORM_URI
        };

        it('should convert simple measures', () => {
            expect(toAFM(charts.bar.simpleMeasure, attributesMap)).toEqual({
                ...simpleMeasure,
                type: 'bar'
            });
        });

        it('should convert filtered measures', () => {
            expect(toAFM(charts.bar.filteredMeasure, attributesMap)).toEqual({
                ...filteredMeasure,
                type: 'bar'
            });
        });

        it('should convert fact based measures', () => {
            expect(toAFM(charts.bar.factBasedMeasure, attributesMap)).toEqual({
                ...factBasedMeasure,
                type: 'bar'
            });
        });

        it('should convert attribute based measures', () => {
            expect(toAFM(charts.bar.attributeBasedMeasure, attributesMap)).toEqual({
                ...attributeBasedMeasure,
                type: 'bar'
            });
        });

        it('should convert measure with show in percent with attribute', () => {
            expect(toAFM(charts.bar.showInPercent, attributesMap)).toEqual({
                ...showInPercent,
                type: 'bar'
            });
        });

        it('should handle attribute with identifier', () => {
            const { afm, transformation } = attributeWithIdentifier;
            const resultHeaders: IHeader[] = [
                {
                    id: 'bar',
                    title: 'Attribute Bar',
                    uri: ATTRIBUTE_DISPLAY_FORM_URI,
                    type: 'attrLabel'
                }
            ];

            expect(toVisObj(bar, afm, transformation, resultHeaders)).toEqual({
                buckets: {
                    categories: [{
                        category: {
                            collection: 'attribute',
                            displayForm: ATTRIBUTE_DISPLAY_FORM_URI,
                            type: 'attribute'
                        }
                    }],
                    filters: [],
                    measures: [{
                        measure: {
                            measureFilters: [],
                            objectUri: 'foo',
                            showInPercent: false,
                            showPoP: false,
                            title: 'm1',
                            type: 'metric'
                        }
                    }]
                },
                type: 'bar'
            });
        });

        it('should convert measure with show in percent with date', () => {
            expect(toAFM(charts.bar.showInPercentWithDate, attributesMap)).toEqual({
                ...showInPercentWithDate,
                type: 'bar'
            });
        });

        it('should convert measure with sorting', () => {
            expect(toAFM(charts.bar.measureWithSorting, attributesMap)).toEqual({
                ...measureWithSorting,
                type: 'bar'
            });
        });

        it('should convert pop measure', () => {
            expect(toAFM(charts.bar.popMeasure, attributesMap)).toEqual({
                ...popMeasure,
                type: 'bar'
            });
        });

        it('should convert pop measure with sorting', () => {
            expect(toAFM(charts.bar.popMeasureWithSorting, attributesMap)).toEqual({
                ...popMeasureWithSorting,
                type: 'bar'
            });
        });

        it('should convert category with sorting', () => {
            expect(toAFM(charts.bar.categoryWithSorting, attributesMap)).toEqual({
                ...categoryWithSorting,
                type: 'bar'
            });
        });

        it('should convert attribute filter', () => {
            expect(toAFM(charts.bar.attributeFilter, attributesMap)).toEqual({
                ...attributeFilter,
                type: 'bar'
            });
        });

        it('should convert date filter', () => {
            expect(toAFM(charts.bar.dateFilter, attributesMap)).toEqual({
                ...dateFilter,
                type: 'bar'
            });
        });

        it('should convert stacking attribute', () => {
            expect(toAFM(charts.bar.stackingAttribute, attributesMap)).toEqual({
                ...stackingAttribute,
                type: 'bar'
            });
        });
    });
});
