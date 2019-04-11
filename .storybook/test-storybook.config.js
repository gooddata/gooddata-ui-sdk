const configuration = {
    sections: {
        _defaults: {
            'readySelector': '.screenshot-target, .screenshot-wrapper .highcharts-container, ' +
                '.screenshot-wrapper .s-headline-value, .screenshot-wrapper .viz-table-wrap, ' +
                '.screenshot-wrapper .gdc-kpi, .screenshot-wrapper .gdc-kpi-error, ' +
                '.screenshot-wrapper .s-error, .screenshot-wrapper .s-pivot-table .ag-body-container .s-value'
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
            'should override primaryMeasures & secondaryMeasures': {
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
