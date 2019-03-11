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
                'readySelector': '.screenshot-wrapper div:nth-child(8) .highcharts-container'
            },
            'with different legend positions': {
                'readySelector': '.screenshot-wrapper div:nth-child(10) .highcharts-container'
            }
        },
        'Core components/BubbleChart': {
            'data labels config': {
                'readySelector': '.screenshot-wrapper div:nth-child(8) .highcharts-container'
            },
            'with different legend positions': {
                'readySelector': '.screenshot-wrapper div:nth-child(10) .highcharts-container'
            }
        },
        'Core components/ColumnChart': {
            'with different legend positions': {
                'readySelector': '.screenshot-wrapper div:nth-child(10) .highcharts-container'
            }
        },
        'Core components/BarChart': {
            'with different legend positions': {
                'readySelector': '.screenshot-wrapper div:nth-child(10) .highcharts-container'
            }
        },
        'Core components/DonutChart': {
            'data labels config': {
                'readySelector': '.screenshot-wrapper div:nth-child(8) .highcharts-container'
            },
            'with different legend positions': {
                'readySelector': '.screenshot-wrapper div:nth-child(10) .highcharts-container'
            }
        },
        'Core components/Heatmap': {
            'data labels config': {
                'readySelector': '.screenshot-wrapper div:nth-child(8) .highcharts-container'
            },
            'with different legend positions': {
                'readySelector': '.screenshot-wrapper div:nth-child(10) .highcharts-container'
            }
        },
        'Core components/LineChart': {
            'data labels config': {
                'readySelector': '.screenshot-wrapper div:nth-child(8) .highcharts-container'
            },
            'with different legend positions': {
                'readySelector': '.screenshot-wrapper div:nth-child(10) .highcharts-container'
            }
        },
        'Core components/ScatterPlot': {
            'data labels config': {
                'readySelector': '.screenshot-wrapper div:nth-child(8) .highcharts-container'
            }
        },
        'Core components/Treemap': {
            'data labels config': {
                'readySelector': '.screenshot-wrapper div:nth-child(8) .highcharts-container'
            },
            'with different legend positions': {
                'readySelector': '.screenshot-wrapper div:nth-child(10) .highcharts-container'
            }
        }
    }
};

module.exports = configuration;
