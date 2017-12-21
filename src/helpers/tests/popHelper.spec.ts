import { fillPoPTitlesAndAliases } from '../popHelper';
import { charts } from '../../../__mocks__/fixtures';

describe('fillPoPTitlesAndAliases', () => {
    it('should add missing title and alias for PoP measure', () => {
        const visContentWithPoP = charts.find(chart =>
            chart.visualizationObject.meta.title === 'PoP'
        ).visualizationObject.content;
        expect(fillPoPTitlesAndAliases(visContentWithPoP, ' - testing pop title').buckets[0].items).toEqual(
            [
                {
                    measure: {
                        localIdentifier: 'm1',
                        title: '# Accounts with AD Query',
                        definition: {
                            measureDefinition: {
                                item: {
                                    uri: '/gdc/md/myproject/obj/8172'
                                }
                            }
                        }
                    }
                },
                {
                    measure: {
                        localIdentifier: 'm1_pop',
                        title: '# Accounts with AD Query - testing pop title',
                        definition: {
                            popMeasureDefinition: {
                                measureIdentifier: 'm1',
                                popAttribute: {
                                    uri: '/gdc/md/myproject/obj/1514'
                                }
                            }
                        }
                    }
                }
            ]
        );
    });
});
