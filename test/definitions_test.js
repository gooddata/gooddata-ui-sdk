import { sortDefinitions } from '../src/utils/definitions';

describe('sortDefinitions', () => {
    it('returns empty array for no definition', () => {
        expect(sortDefinitions([])).to.eql([]);
    });

    context('derived metric with contribution', () => {
        it('should be sorted correctly', () => {
            const definitions = [
                {
                    metricDefinition: {
                        identifier: 'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.sum.7537800b1daf7582198e84ca6205d600',
                        expression: 'SELECT SUM([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1144])',
                        title: 'Sum of Amount',
                        format: '#,##0.00'
                    }
                },
                {
                    metricDefinition: {
                        title: '% Sum of Amount',
                        identifier: 'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.percent.7abc1f3bf5c8130d11493f0cc5780ae2',
                        expression: 'SELECT (SELECT {fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.sum.7537800b1daf7582198e84ca6205d600}) / (SELECT {fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.sum.7537800b1daf7582198e84ca6205d600} BY ALL [/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1027])',
                        format: '#,##0.00%'
                    }
                }
            ];

            const expected = [
                {
                    metricDefinition: {
                        identifier: 'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.sum.7537800b1daf7582198e84ca6205d600',
                        expression: 'SELECT SUM([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1144])',
                        title: 'Sum of Amount',
                        format: '#,##0.00'
                    }
                },
                {
                    metricDefinition: {
                        title: '% Sum of Amount',
                        identifier: 'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.percent.7abc1f3bf5c8130d11493f0cc5780ae2',
                        expression: 'SELECT (SELECT {fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.sum.7537800b1daf7582198e84ca6205d600}) / (SELECT {fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.sum.7537800b1daf7582198e84ca6205d600} BY ALL [/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1027])',
                        format: '#,##0.00%'
                    }
                }
            ];

            expect(sortDefinitions(definitions)).to.eql(expected);
        });
    });

    context('derived metric with contribution and pop', () => {
        it('should be sorted correctly', () => {
            const definitions = [
                {
                    metricDefinition: {
                        title: '% Sum of Amount - previous year',
                        identifier: 'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.pop.8802950f69a83c21a5ae38f306148a02',
                        expression: 'SELECT (SELECT {fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.percent.49a4394f29b465c3d494ead9ef09732d}) FOR PREVIOUS ([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1233])',
                        format: '#,##0.00%'
                    }
                },
                {
                    metricDefinition: {
                        title: 'Sum of Amount',
                        identifier: 'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.sum.7537800b1daf7582198e84ca6205d600',
                        expression: 'SELECT SUM([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1144])',
                        format: '#,##0.00'
                    }
                },
                {
                    metricDefinition: {
                        title: '% Sum of Amount',
                        identifier: 'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.percent.49a4394f29b465c3d494ead9ef09732d',
                        expression: 'SELECT (SELECT {fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.sum.7537800b1daf7582198e84ca6205d600}) / (SELECT {fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.sum.7537800b1daf7582198e84ca6205d600} BY ALL [/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1233])',
                        format: '#,##0.00%'
                    }
                }
            ];

            const expected = [
                {
                    metricDefinition: {
                        title: 'Sum of Amount',
                        identifier: 'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.sum.7537800b1daf7582198e84ca6205d600',
                        expression: 'SELECT SUM([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1144])',
                        format: '#,##0.00'
                    }
                },
                {
                    metricDefinition: {
                        title: '% Sum of Amount',
                        identifier: 'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.percent.49a4394f29b465c3d494ead9ef09732d',
                        expression: 'SELECT (SELECT {fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.sum.7537800b1daf7582198e84ca6205d600}) / (SELECT {fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.sum.7537800b1daf7582198e84ca6205d600} BY ALL [/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1233])',
                        format: '#,##0.00%'
                    }
                },
                {
                    metricDefinition: {
                        title: '% Sum of Amount - previous year',
                        identifier: 'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.pop.8802950f69a83c21a5ae38f306148a02',
                        expression: 'SELECT (SELECT {fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.percent.49a4394f29b465c3d494ead9ef09732d}) FOR PREVIOUS ([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1233])',
                        format: '#,##0.00%'
                    }
                }
            ];

            expect(sortDefinitions(definitions)).to.eql(expected);
        });
    });

    context('unresolvable dependencies', () => {
        it('should be sorted correctly', () => {
            const definitions = [
                {
                    metricDefinition: {
                        title: '% Sum of Amount - previous year',
                        identifier: 'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.pop.8802950f69a83c21a5ae38f306148a02',
                        expression: 'SELECT (SELECT {metric-that-does-not-exist}) FOR PREVIOUS ([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1233])',
                        format: '#,##0.00%'
                    }
                },
                {
                    metricDefinition: {
                        title: 'Sum of Amount',
                        identifier: 'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.sum.7537800b1daf7582198e84ca6205d600',
                        expression: 'SELECT SUM([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1144])',
                        format: '#,##0.00'
                    }
                },
                {
                    metricDefinition: {
                        title: '% Sum of Amount',
                        identifier: 'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.percent.49a4394f29b465c3d494ead9ef09732d',
                        expression: 'SELECT (SELECT {fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.sum.7537800b1daf7582198e84ca6205d600}) / (SELECT {fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.sum.7537800b1daf7582198e84ca6205d600} BY ALL [/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1233])',
                        format: '#,##0.00%'
                    }
                }
            ];

            expect(() => sortDefinitions(definitions)).to.throwError();
        });
    });
});
