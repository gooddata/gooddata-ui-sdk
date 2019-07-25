const configuration = {
    sections: {
        _defaults: {
            'readySelector': '.screenshot-target, .screenshot-wrapper .highcharts-container, ' +
                '.screenshot-wrapper .s-headline-value, .screenshot-wrapper .viz-table-wrap, ' +
                '.screenshot-wrapper .gdc-kpi, .screenshot-wrapper .gdc-kpi-error, ' +
                '.screenshot-wrapper .s-error, .screenshot-wrapper .s-pivot-table .s-loading-done'
        },
        'Core components/AreaChart': {
            'data labels config': {
                readySelector: '.screenshot-ready-wrapper-done'
            },
            'with different legend positions': {
                readySelector: '.screenshot-ready-wrapper-done'
            }
        },
        'Core components/BubbleChart': {
            'data labels config': {
                readySelector: '.screenshot-ready-wrapper-done'
            },
            'with different legend positions': {
                readySelector: '.screenshot-ready-wrapper-done'
            }
        },
        'Core components/ComboChart': {
            'dual axis with multiple primary measures, one secondary measure and NO attribute': {
                readySelector: '.screenshot-ready-wrapper-done'
            },
            'dual axis with different chart type and NO attribute': {
                readySelector: '.screenshot-ready-wrapper-done'
            },
            'dual axis with same chart type and NO attribute': {
                readySelector: '.screenshot-ready-wrapper-done'
            },
            'dual axis with same chart type and one attribute': {
                readySelector: '.screenshot-ready-wrapper-done'
            },
            'should override primaryMeasures & secondaryMeasures': {
                readySelector: '.screenshot-ready-wrapper-done'
            },
            'stack primary measures with different chart type': {
                readySelector: '.screenshot-ready-wrapper-done'
            },
            'stack primary measures with same chart type': {
                readySelector: '.screenshot-ready-wrapper-done'
            },
            'stack primary measures to percent': {
                readySelector: '.screenshot-ready-wrapper-done'
            },
            'discard stacking measures for line chart and all measures on secondary axis': {
                readySelector: '.screenshot-ready-wrapper-done'
            },
            'empty primary measure & discard stacking': {
                readySelector: '.screenshot-ready-wrapper-done'
            }
        },
        'Core components/ColumnChart': {
            'with different legend positions': {
                readySelector: '.screenshot-ready-wrapper-done'
            }
        },
        'Core components/BarChart': {
            'with different legend positions': {
                readySelector: '.screenshot-ready-wrapper-done'
            }
        },
        'Core components/DonutChart': {
            'data labels config': {
                readySelector: '.screenshot-ready-wrapper-done'
            },
            'with different legend positions': {
                readySelector: '.screenshot-ready-wrapper-done'
            }
        },
        'Core components/Heatmap': {
            'data labels config': {
                readySelector: '.screenshot-ready-wrapper-done'
            },
            'with different legend positions': {
                readySelector: '.screenshot-ready-wrapper-done'
            }
        },
        'Core components/LineChart': {
            'data labels config': {
                readySelector: '.screenshot-ready-wrapper-done'
            },
            'with different legend positions': {
                readySelector: '.screenshot-ready-wrapper-done'
            }
        },
        'Core components/ScatterPlot': {
            'data labels config': {
                readySelector: '.screenshot-ready-wrapper-done'
            }
        },
        'Core components/Treemap': {
            'data labels config': {
                readySelector: '.screenshot-ready-wrapper-done'
            },
            'with different legend positions': {
                readySelector: '.screenshot-ready-wrapper-done'
            }
        },
        'Core components/PieChart': {
            'data labels config': {
                readySelector: '.screenshot-ready-wrapper-done'
            },
            'with different legend positions': {
                readySelector: '.screenshot-ready-wrapper-done'
            }
        },
        'Core components/Table': {
            'with supplied height of container': {
                readySelector: '.screenshot-ready-wrapper-done'
            },
            'with table totals and supplied height of container': {
                readySelector: '.screenshot-ready-wrapper-done'
            }
        },
        'Internal/Drilldown': {
            'Combo chart with onFiredDrillEvent': {
                readySelector: '.screenshot-ready-wrapper-done'
            }
        }
    }
};

module.exports = configuration;
