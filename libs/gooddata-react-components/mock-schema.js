// (C) 2007-2019 GoodData Corporation

const heatmapAfmExecutions = [{
        execution: require('./stories/test_data/heat_map_with_58_rows_mock_request.json'),
        executionResult: require('./stories/test_data/heat_map_with_58_rows_mock_result.json')
    }, {
        execution: require('./stories/test_data/heat_map_with_60_rows_mock_request.json'),
        executionResult: require('./stories/test_data/heat_map_with_60_rows_mock_result.json')
    }, {
        execution: require('./stories/test_data/heat_map_with_empty_cells_request.json'),
        executionResult: require('./stories/test_data/heat_map_with_empty_cells_result.json')
    }];

const pivotTableAfmExecutions = [
    {
        execution: require("./stories/test_data/pivot_table_with_subtotals_request.json"),
        executionResponse: require("./stories/test_data/pivot_table_with_subtotals_response.json"),
        executionResult: require("./stories/test_data/pivot_table_with_subtotals_result.json"),
    }];

const pivotTableSubtotalsAfmExecutions = [
    {
        execution: require("./stories/test_data/pivot_table_with_subtotals_2_measures_request.json"),
        executionResponse: require("./stories/test_data/pivot_table_with_subtotals_2_measures_response.json"),
        executionResult: require("./stories/test_data/pivot_table_with_subtotals_2_measures_result.json"),
    }];

const pivotTableGrandtotalSubtotalAfmExecutions = [
    {
        execution: require("./stories/test_data/pivot_table_with_grandtotal_subtotal_2_measures_request.json"),
        executionResponse: require("./stories/test_data/pivot_table_with_grandtotal_subtotal_2_measures_response.json"),
        executionResult: require("./stories/test_data/pivot_table_with_grandtotal_subtotal_2_measures_result.json"),
    }];

const getBaseProjectSchema = (title, identifier) => {
    return {
        project: {
            title,
            identifier
        },
        groups: [{
            metrics: [{
                    identifier: '1',
                    title: 'Amount'
                },
                {
                    identifier: '2',
                    title: 'Bigger Amount'
                },
                {
                    identifier: '3',
                    title: 'Sum of Sales'
                },
                {
                    identifier: '4',
                    title: '% of Goal',
                    format: '#,##0.00%'
                },
                {
                    identifier: 'aagV61RmaPTt',
                    title: 'Amount [BOP]'
                },
                {
                    identifier: '9',
                    title: 'Saved null'
                }
            ],
            attributes: [{
                    identifier: '3',
                    title: 'Country',
                    elements: ['Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burma (Myanmar)', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo, Democratic Republic of the', 'Congo, Republic of', 'Costa Rica', 'Côte d\'Ivoire', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'East Timor', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Korea, North', 'Korea, South', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Macedonia', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Nigeria', 'Northern Ireland', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Palestinian State (proposed)', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Samoa', 'San Marino', 'São Tomé and Príncipe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'Spain', 'Sri Lanka', 'St. Kitts and Nevis', 'St. Lucia', 'St. Vincent and the Grenadines', 'Sudan', 'Suriname', 'Swaziland', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City (Holy See)', 'Venezuela', 'Vietnam', 'Western Sahara (proposed state)', 'Yemen', 'Zaire', 'Zambia', 'Zimbabwe']
                },
                {
                    identifier: '4',
                    title: 'Colours',
                    elements: [
                        'Pink',
                        'Red',
                        'Purple',
                        'Salmon'
                    ]
                },
                {
                    identifier: '5',
                    title: 'Popularity',
                    elements: [
                        'low',
                        'medium',
                        'high'
                    ]
                }, {
                    identifier: '6',
                    title: 'Sales Rep',
                    elements: [
                        'rep1',
                        'rep2',
                        'rep3',
                        'rep4',
                        'rep5',
                        'rep6',
                        'rep7',
                        'rep8',
                        'rep9',
                        'rep10',
                        'rep11',
                        'rep12',
                        'rep13',
                        'rep14',
                        'rep15',
                        'rep16',
                        'rep17',
                        'rep18',
                        'rep19',
                        'rep20'
                    ]
                }
            ],
            dateDataSets: [{
                title: 'Activity',
                tags: 'sales'
            }, {
                title: 'Opportunity'
            }, {
                title: 'Closed'
            }]
        }],
        afmExecutions: [{
                _description: 'KPI / saved execution with no data',
                execution: {
                    execution: {
                        afm: {
                            measures: [{
                                localIdentifier: 'm1',
                                definition: {
                                    measure: {
                                        item: {
                                            uri: `/gdc/md/${identifier}/obj/9`
                                        }
                                    }
                                }
                            }],
                            filters: []
                        },
                        resultSpec: {
                            dimensions: [{
                                itemIdentifiers: ['measureGroup']
                            }]
                        }
                    }
                },
                executionResult: {
                    executionResult: {
                        data: [],
                        paging: {
                            count: [0],
                            offset: [0],
                            total: [0]
                        }
                    }
                }
            },
            {
                _description: 'PivotTable / two measures, 2 column attributes',
                execution: {
                    execution: {
                        afm: {
                            measures: [{
                                    localIdentifier: 'm1',
                                    definition: {
                                        measure: {
                                            item: {
                                                uri: `/gdc/md/${identifier}/obj/1`
                                            }
                                        }
                                    }
                                },
                                {
                                    localIdentifier: 'm2',
                                    definition: {
                                        measure: {
                                            item: {
                                                uri: `/gdc/md/${identifier}/obj/2`
                                            }
                                        }
                                    }
                                }
                            ],
                            attributes: [{
                                    displayForm: {
                                        uri: `/gdc/md/${identifier}/obj/4.df`
                                    },
                                    localIdentifier: 'a1'
                                },
                                {
                                    displayForm: {
                                        uri: `/gdc/md/${identifier}/obj/5.df`
                                    },
                                    localIdentifier: 'a2'
                                }
                            ]
                        },
                        resultSpec: {
                            dimensions: [{
                                    itemIdentifiers: []
                                },
                                {
                                    itemIdentifiers: ['a1', 'a2', 'measureGroup']
                                }
                            ]
                        }
                    }
                },
                executionResult: {
                    executionResult: {
                        data: [
                            ['1000678', '907', '958', '525', '928', '824', '201', '482', '47', '788', '864', '82', '613', '243', '37', '864', '416', '471', '253', '24', '897', '324', '278', '267']
                        ],
                        headerItems: [
                            [],
                            [
                                [{
                                    attributeHeaderItem: {
                                        uri: `/gdc/md/${identifier}/obj/4/elements?id=1`,
                                        name: 'Pink'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: `/gdc/md/${identifier}/obj/4/elements?id=1`,
                                        name: 'Pink'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: `/gdc/md/${identifier}/obj/4/elements?id=1`,
                                        name: 'Pink'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: `/gdc/md/${identifier}/obj/4/elements?id=1`,
                                        name: 'Pink'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: `/gdc/md/${identifier}/obj/4/elements?id=1`,
                                        name: 'Pink'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: `/gdc/md/${identifier}/obj/4/elements?id=1`,
                                        name: 'Pink'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: `/gdc/md/${identifier}/obj/4/elements?id=2`,
                                        name: 'Red'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: `/gdc/md/${identifier}/obj/4/elements?id=2`,
                                        name: 'Red'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: `/gdc/md/${identifier}/obj/4/elements?id=2`,
                                        name: 'Red'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: `/gdc/md/${identifier}/obj/4/elements?id=2`,
                                        name: 'Red'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: `/gdc/md/${identifier}/obj/4/elements?id=2`,
                                        name: 'Red'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: `/gdc/md/${identifier}/obj/4/elements?id=2`,
                                        name: 'Red'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: `/gdc/md/${identifier}/obj/4/elements?id=3`,
                                        name: 'Purple'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: `/gdc/md/${identifier}/obj/4/elements?id=3`,
                                        name: 'Purple'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: `/gdc/md/${identifier}/obj/4/elements?id=3`,
                                        name: 'Purple'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: `/gdc/md/${identifier}/obj/4/elements?id=3`,
                                        name: 'Purple'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: `/gdc/md/${identifier}/obj/4/elements?id=3`,
                                        name: 'Purple'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: `/gdc/md/${identifier}/obj/4/elements?id=3`,
                                        name: 'Purple'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: `/gdc/md/${identifier}/obj/4/elements?id=4`,
                                        name: 'Salmon'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: `/gdc/md/${identifier}/obj/4/elements?id=4`,
                                        name: 'Salmon'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: `/gdc/md/${identifier}/obj/4/elements?id=4`,
                                        name: 'Salmon'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: `/gdc/md/${identifier}/obj/4/elements?id=4`,
                                        name: 'Salmon'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: `/gdc/md/${identifier}/obj/4/elements?id=4`,
                                        name: 'Salmon'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: `/gdc/md/${identifier}/obj/4/elements?id=4`,
                                        name: 'Salmon'
                                    }
                                }],
                                [{
                                    attributeHeaderItem: {
                                        uri: `/gdc/md/${identifier}/obj/5/elements?id=1`,
                                        name: 'low'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: `/gdc/md/${identifier}/obj/5/elements?id=1`,
                                        name: 'low'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: `/gdc/md/${identifier}/obj/5/elements?id=2`,
                                        name: 'medium'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: `/gdc/md/${identifier}/obj/5/elements?id=2`,
                                        name: 'medium'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: `/gdc/md/${identifier}/obj/5/elements?id=3`,
                                        name: 'high'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: `/gdc/md/${identifier}/obj/5/elements?id=3`,
                                        name: 'high'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: `/gdc/md/${identifier}/obj/5/elements?id=1`,
                                        name: 'low'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: `/gdc/md/${identifier}/obj/5/elements?id=1`,
                                        name: 'low'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: `/gdc/md/${identifier}/obj/5/elements?id=2`,
                                        name: 'medium'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: `/gdc/md/${identifier}/obj/5/elements?id=2`,
                                        name: 'medium'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: `/gdc/md/${identifier}/obj/5/elements?id=3`,
                                        name: 'high'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: `/gdc/md/${identifier}/obj/5/elements?id=3`,
                                        name: 'high'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: `/gdc/md/${identifier}/obj/5/elements?id=1`,
                                        name: 'low'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: `/gdc/md/${identifier}/obj/5/elements?id=1`,
                                        name: 'low'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: `/gdc/md/${identifier}/obj/5/elements?id=2`,
                                        name: 'medium'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: `/gdc/md/${identifier}/obj/5/elements?id=2`,
                                        name: 'medium'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: `/gdc/md/${identifier}/obj/5/elements?id=3`,
                                        name: 'high'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: `/gdc/md/${identifier}/obj/5/elements?id=3`,
                                        name: 'high'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: `/gdc/md/${identifier}/obj/5/elements?id=1`,
                                        name: 'low'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: `/gdc/md/${identifier}/obj/5/elements?id=1`,
                                        name: 'low'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: `/gdc/md/${identifier}/obj/5/elements?id=2`,
                                        name: 'medium'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: `/gdc/md/${identifier}/obj/5/elements?id=2`,
                                        name: 'medium'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: `/gdc/md/${identifier}/obj/5/elements?id=3`,
                                        name: 'high'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: `/gdc/md/${identifier}/obj/5/elements?id=3`,
                                        name: 'high'
                                    }
                                }],
                                [{
                                    measureHeaderItem: {
                                        name: 'Amount',
                                        order: 0
                                    }
                                }, {
                                    measureHeaderItem: {
                                        name: 'Bigger Amount',
                                        order: 1
                                    }
                                }, {
                                    measureHeaderItem: {
                                        name: 'Amount',
                                        order: 0
                                    }
                                }, {
                                    measureHeaderItem: {
                                        name: 'Bigger Amount',
                                        order: 1
                                    }
                                }, {
                                    measureHeaderItem: {
                                        name: 'Amount',
                                        order: 0
                                    }
                                }, {
                                    measureHeaderItem: {
                                        name: 'Bigger Amount',
                                        order: 1
                                    }
                                }, {
                                    measureHeaderItem: {
                                        name: 'Amount',
                                        order: 0
                                    }
                                }, {
                                    measureHeaderItem: {
                                        name: 'Bigger Amount',
                                        order: 1
                                    }
                                }, {
                                    measureHeaderItem: {
                                        name: 'Amount',
                                        order: 0
                                    }
                                }, {
                                    measureHeaderItem: {
                                        name: 'Bigger Amount',
                                        order: 1
                                    }
                                }, {
                                    measureHeaderItem: {
                                        name: 'Amount',
                                        order: 0
                                    }
                                }, {
                                    measureHeaderItem: {
                                        name: 'Bigger Amount',
                                        order: 1
                                    }
                                }, {
                                    measureHeaderItem: {
                                        name: 'Amount',
                                        order: 0
                                    }
                                }, {
                                    measureHeaderItem: {
                                        name: 'Bigger Amount',
                                        order: 1
                                    }
                                }, {
                                    measureHeaderItem: {
                                        name: 'Amount',
                                        order: 0
                                    }
                                }, {
                                    measureHeaderItem: {
                                        name: 'Bigger Amount',
                                        order: 1
                                    }
                                }, {
                                    measureHeaderItem: {
                                        name: 'Amount',
                                        order: 0
                                    }
                                }, {
                                    measureHeaderItem: {
                                        name: 'Bigger Amount',
                                        order: 1
                                    }
                                }, {
                                    measureHeaderItem: {
                                        name: 'Amount',
                                        order: 0
                                    }
                                }, {
                                    measureHeaderItem: {
                                        name: 'Bigger Amount',
                                        order: 1
                                    }
                                }, {
                                    measureHeaderItem: {
                                        name: 'Amount',
                                        order: 0
                                    }
                                }, {
                                    measureHeaderItem: {
                                        name: 'Bigger Amount',
                                        order: 1
                                    }
                                }, {
                                    measureHeaderItem: {
                                        name: 'Amount',
                                        order: 0
                                    }
                                }, {
                                    measureHeaderItem: {
                                        name: 'Bigger Amount',
                                        order: 1
                                    }
                                }]
                            ]
                        ],
                        paging: {
                            count: [1, 24],
                            offset: [0, 0],
                            total: [1, 24]
                        }
                    }
                }
            },
            {
                _description: 'Area chart with missing values',
                execution: {
                    execution: {
                        afm: {
                            measures: [{
                                localIdentifier: 'm1',
                                definition: {
                                    measure: {
                                        item: {
                                            uri: `/gdc/md/${identifier}/obj/1`
                                        }
                                    }
                                }
                            }, {
                                localIdentifier: 'm4',
                                definition: {
                                    measure: {
                                        item: {
                                            uri: `/gdc/md/${identifier}/obj/9`
                                        }
                                    }
                                }
                            }],
                            attributes: [{
                                localIdentifier: 'a1',
                                displayForm: {
                                    uri: `/gdc/md/${identifier}/obj/4.df`
                                }
                            }]
                        },
                        resultSpec: {
                            dimensions: [{
                                itemIdentifiers: ['measureGroup']
                            }, {
                                itemIdentifiers: ['a1']
                            }]
                        }
                    }
                },
                executionResult: {
                    executionResult: {
                        data: [
                            ['600', '250', '80', '100'],
                            ['300', null, '50', '80']
                        ],
                        headerItems: [
                            [
                                [{
                                    measureHeaderItem: {
                                        name: 'Saved null',
                                        order: 0
                                    }
                                }, {
                                    measureHeaderItem: {
                                        name: 'Amount',
                                        order: 1
                                    }
                                }]
                            ],
                            [
                                [{
                                        attributeHeaderItem: {
                                            uri: '/gdc/md/mockproject/obj/4/elements?id=1',
                                            name: 'Pink'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: '/gdc/md/mockproject/obj/4/elements?id=2',
                                            name: 'Red'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: '/gdc/md/mockproject/obj/4/elements?id=3',
                                            name: 'Purple'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: '/gdc/md/mockproject/obj/4/elements?id=4',
                                            name: 'Salmon'
                                        }
                                    }
                                ]
                            ]
                        ],
                        paging: {
                            count: [2, 4],
                            offset: [0, 0],
                            total: [2, 4]
                        }
                    }
                }
            },
            {
                _description: 'Table with empty values',
                execution: {
                    execution: {
                        afm: {
                            measures: [{
                                localIdentifier: 'm1',
                                definition: {
                                    measure: {
                                        item: {
                                            uri: `/gdc/md/${identifier}/obj/1`
                                        }
                                    }
                                }
                            }, {
                                localIdentifier: 'm4',
                                definition: {
                                    measure: {
                                        item: {
                                            uri: `/gdc/md/${identifier}/obj/9`
                                        }
                                    }
                                }
                            }],
                            attributes: [{
                                localIdentifier: 'a1',
                                displayForm: {
                                    uri: `/gdc/md/${identifier}/obj/4.df`
                                }
                            }]
                        },
                        resultSpec: {
                            dimensions: [
                                {
                                    itemIdentifiers: ['a1']
                                },
                                {
                                    itemIdentifiers: ['measureGroup']
                                }
                            ]
                        }
                    }
                },
                executionResult: {
                    executionResult: {
                        data: [
                            ['1', '2'],
                            ['3', null],
                            ['5', '6'],
                            ['7', null]
                        ],
                        headerItems: [
                            [
                                [
                                    {
                                        attributeHeaderItem: {
                                            uri: '/gdc/md/mockproject/obj/4/elements?id=1',
                                            name: 'Pink'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: '/gdc/md/mockproject/obj/4/elements?id=2',
                                            name: 'Red'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: '/gdc/md/mockproject/obj/4/elements?id=3',
                                            name: 'Purple'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: '/gdc/md/mockproject/obj/4/elements?id=4',
                                            name: 'Salmon'
                                        }
                                    }
                                ]
                            ],
                            [
                                [
                                    {
                                        measureHeaderItem: {
                                            name: 'Saved null',
                                            order: 0
                                        }
                                    },
                                    {
                                        measureHeaderItem: {
                                            name: 'Amount',
                                            order: 1
                                        }
                                    }
                                ]
                            ]
                        ],
                        paging: {
                            count: [4, 2],
                            offset: [0, 0],
                            total: [4, 2]
                        }
                    }
                }
            },
            {
                _description: 'Treemap with sorted values', // once mock-js will support multi-sorting this can be removed
                execution: {
                    execution: {
                        afm: {
                            measures: [{
                                localIdentifier: 'm1',
                                definition: {
                                    measure: {
                                        item: {
                                            uri: `/gdc/md/${identifier}/obj/1`
                                        }
                                    }
                                }
                            }],
                            attributes: [{
                                localIdentifier: 'a1',
                                displayForm: {
                                    uri: `/gdc/md/${identifier}/obj/4.df`
                                }
                            }, {
                                localIdentifier: 'a2',
                                displayForm: {
                                    uri: `/gdc/md/${identifier}/obj/5.df`
                                }
                            }]
                        },
                        resultSpec: {
                            dimensions: [{
                                itemIdentifiers: ['a1', 'a2']
                            }, {
                                itemIdentifiers: ['measureGroup']
                            }],
                            sorts: [{
                                    attributeSortItem: {
                                        attributeIdentifier: 'a1',
                                        direction: 'asc'
                                    }
                                },
                                {
                                    measureSortItem: {
                                        direction: 'desc',
                                        locators: [{
                                            measureLocatorItem: {
                                                measureIdentifier: 'm1'
                                            }
                                        }]
                                    }
                                }
                            ]
                        }
                    }
                },
                executionResult: {
                    executionResult: {
                        data: [
                            ['666'],
                            ['356'],
                            ['110'],
                            ['435'],
                            ['260'],
                            ['120'],
                            ['956'],
                            ['530'],
                            ['314'],
                            ['236'],
                            ['180'],
                            ['60']
                        ],
                        headerItems: [
                            [
                                [{
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/4/elements?id=1`,
                                            name: 'Pink'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/4/elements?id=1`,
                                            name: 'Pink'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/4/elements?id=1`,
                                            name: 'Pink'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/4/elements?id=3`,
                                            name: 'Purple'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/4/elements?id=3`,
                                            name: 'Purple'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/4/elements?id=3`,
                                            name: 'Purple'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/4/elements?id=2`,
                                            name: 'Red'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/4/elements?id=2`,
                                            name: 'Red'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/4/elements?id=2`,
                                            name: 'Red'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/4/elements?id=4`,
                                            name: 'Salmon'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/4/elements?id=4`,
                                            name: 'Salmon'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/4/elements?id=4`,
                                            name: 'Salmon'
                                        }
                                    }
                                ],
                                [{
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=1`,
                                            name: 'low'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=2`,
                                            name: 'medium'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=3`,
                                            name: 'high'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=1`,
                                            name: 'low'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=2`,
                                            name: 'medium'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=3`,
                                            name: 'high'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=1`,
                                            name: 'low'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=2`,
                                            name: 'medium'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=3`,
                                            name: 'high'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=1`,
                                            name: 'low'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=2`,
                                            name: 'medium'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=3`,
                                            name: 'high'
                                        }
                                    }
                                ]
                            ],
                            [
                                [{
                                    measureHeaderItem: {
                                        name: 'Amount',
                                        order: 0
                                    }
                                }]
                            ]
                        ],
                        paging: {
                            count: [12, 1],
                            offset: [0, 0],
                            total: [12, 1]
                        }
                    }
                }
            },
            {
                _description: 'Treemap with 20 view by attributes with sorted values', // once mock-js will support multi-sorting this can be removed
                execution: {
                    execution: {
                        afm: {
                            measures: [{
                                localIdentifier: 'm1',
                                definition: {
                                    measure: {
                                        item: {
                                            uri: `/gdc/md/${identifier}/obj/1`
                                        }
                                    }
                                }
                            }],
                            attributes: [{
                                localIdentifier: 'a3',
                                displayForm: {
                                    uri: `/gdc/md/${identifier}/obj/6.df`
                                }
                            }, {
                                localIdentifier: 'a2',
                                displayForm: {
                                    uri: `/gdc/md/${identifier}/obj/5.df`
                                }
                            }]
                        },
                        resultSpec: {
                            dimensions: [{
                                itemIdentifiers: ['a3', 'a2']
                            }, {
                                itemIdentifiers: ['measureGroup']
                            }],
                            sorts: [{
                                    attributeSortItem: {
                                        attributeIdentifier: 'a3',
                                        direction: 'asc'
                                    }
                                },
                                {
                                    measureSortItem: {
                                        direction: 'desc',
                                        locators: [{
                                            measureLocatorItem: {
                                                measureIdentifier: 'm1'
                                            }
                                        }]
                                    }
                                }
                            ]
                        }
                    }
                },
                executionResult: {
                    executionResult: {
                        data: [
                            ['666'], ['356'], ['110'],
                            ['666'], ['356'], ['110'],
                            ['666'], ['356'], ['110'],
                            ['666'], ['356'], ['110'],
                            ['666'], ['356'], ['110'],
                            ['666'], ['356'], ['110'],
                            ['666'], ['356'], ['110'],
                            ['666'], ['356'], ['110'],
                            ['666'], ['356'], ['110'],
                            ['666'], ['356'], ['110'],
                            ['666'], ['356'], ['110'],
                            ['666'], ['356'], ['110'],
                            ['666'], ['356'], ['110'],
                            ['666'], ['356'], ['110'],
                            ['666'], ['356'], ['110'],
                            ['666'], ['356'], ['110'],
                            ['666'], ['356'], ['110'],
                            ['666'], ['356'], ['110'],
                            ['666'], ['356'], ['110'],
                            ['666'], ['356'], ['110']
                        ],
                        headerItems: [
                            [
                                [
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=1`,
                                            name: 'rep1'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=1`,
                                            name: 'rep1'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=1`,
                                            name: 'rep1'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=3`,
                                            name: 'rep3'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=3`,
                                            name: 'rep3'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=3`,
                                            name: 'rep3'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=2`,
                                            name: 'rep2'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=2`,
                                            name: 'rep2'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=2`,
                                            name: 'rep2'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=4`,
                                            name: 'rep4'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=4`,
                                            name: 'rep4'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=4`,
                                            name: 'rep4'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=6`,
                                            name: 'rep6'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=6`,
                                            name: 'rep6'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=6`,
                                            name: 'rep6'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=5`,
                                            name: 'rep5'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=5`,
                                            name: 'rep5'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=5`,
                                            name: 'rep5'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=8`,
                                            name: 'rep8'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=8`,
                                            name: 'rep8'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=8`,
                                            name: 'rep8'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=7`,
                                            name: 'rep7'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=7`,
                                            name: 'rep7'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=7`,
                                            name: 'rep7'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=9`,
                                            name: 'rep9'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=9`,
                                            name: 'rep9'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=9`,
                                            name: 'rep9'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=12`,
                                            name: 'rep12'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=12`,
                                            name: 'rep12'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=12`,
                                            name: 'rep12'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=11`,
                                            name: 'rep11'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=11`,
                                            name: 'rep11'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=11`,
                                            name: 'rep11'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=10`,
                                            name: 'rep10'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=10`,
                                            name: 'rep10'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=10`,
                                            name: 'rep10'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=13`,
                                            name: 'rep13'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=13`,
                                            name: 'rep13'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=13`,
                                            name: 'rep13'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=14`,
                                            name: 'rep14'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=14`,
                                            name: 'rep14'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=14`,
                                            name: 'rep14'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=16`,
                                            name: 'rep16'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=16`,
                                            name: 'rep16'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=16`,
                                            name: 'rep16'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=15`,
                                            name: 'rep15'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=15`,
                                            name: 'rep15'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=15`,
                                            name: 'rep15'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=17`,
                                            name: 'rep17'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=17`,
                                            name: 'rep17'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=17`,
                                            name: 'rep17'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=18`,
                                            name: 'rep18'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=18`,
                                            name: 'rep18'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=18`,
                                            name: 'rep18'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=19`,
                                            name: 'rep19'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=19`,
                                            name: 'rep19'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=19`,
                                            name: 'rep19'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=20`,
                                            name: 'rep20'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=20`,
                                            name: 'rep20'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/6/elements?id=20`,
                                            name: 'rep20'
                                        }
                                    }
                                ],
                                [
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=1`,
                                            name: 'low'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=2`,
                                            name: 'medium'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=3`,
                                            name: 'high'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=1`,
                                            name: 'low'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=2`,
                                            name: 'medium'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=3`,
                                            name: 'high'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=1`,
                                            name: 'low'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=2`,
                                            name: 'medium'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=3`,
                                            name: 'high'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=1`,
                                            name: 'low'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=2`,
                                            name: 'medium'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=3`,
                                            name: 'high'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=1`,
                                            name: 'low'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=2`,
                                            name: 'medium'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=3`,
                                            name: 'high'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=1`,
                                            name: 'low'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=2`,
                                            name: 'medium'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=3`,
                                            name: 'high'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=1`,
                                            name: 'low'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=2`,
                                            name: 'medium'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=3`,
                                            name: 'high'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=1`,
                                            name: 'low'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=2`,
                                            name: 'medium'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=3`,
                                            name: 'high'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=1`,
                                            name: 'low'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=2`,
                                            name: 'medium'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=3`,
                                            name: 'high'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=1`,
                                            name: 'low'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=2`,
                                            name: 'medium'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=3`,
                                            name: 'high'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=1`,
                                            name: 'low'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=2`,
                                            name: 'medium'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=3`,
                                            name: 'high'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=1`,
                                            name: 'low'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=2`,
                                            name: 'medium'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=3`,
                                            name: 'high'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=1`,
                                            name: 'low'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=2`,
                                            name: 'medium'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=3`,
                                            name: 'high'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=1`,
                                            name: 'low'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=2`,
                                            name: 'medium'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=3`,
                                            name: 'high'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=1`,
                                            name: 'low'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=2`,
                                            name: 'medium'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=3`,
                                            name: 'high'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=1`,
                                            name: 'low'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=2`,
                                            name: 'medium'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=3`,
                                            name: 'high'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=1`,
                                            name: 'low'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=2`,
                                            name: 'medium'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=3`,
                                            name: 'high'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=1`,
                                            name: 'low'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=2`,
                                            name: 'medium'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=3`,
                                            name: 'high'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=1`,
                                            name: 'low'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=2`,
                                            name: 'medium'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=3`,
                                            name: 'high'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=1`,
                                            name: 'low'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=2`,
                                            name: 'medium'
                                        }
                                    }, {
                                        attributeHeaderItem: {
                                            uri: `/gdc/md/${identifier}/obj/5/elements?id=3`,
                                            name: 'high'
                                        }
                                    }
                                ]
                            ],
                            [
                                [{
                                    measureHeaderItem: {
                                        name: 'Amount',
                                        order: 0
                                    }
                                }]
                            ]
                        ],
                        paging: {
                            count: [60, 1],
                            offset: [0, 0],
                            total: [60, 1]
                        }
                    }
                }
            },
            {
                _description: 'totals - column and row attributes with menu enabled',
                execution: {
                    execution: {
                        afm: {
                            measures: [
                                {
                                    localIdentifier: 'm1',
                                    definition: {
                                        measure: {
                                            item: {
                                                uri: '/gdc/md/storybook/obj/1'
                                            }
                                        }
                                    },
                                    alias: '_Close [BOP]'
                                },
                                {
                                    localIdentifier: 'm2',
                                    definition: {
                                        measure: {
                                            item: {
                                                uri: '/gdc/md/storybook/obj/2'
                                            }
                                        }
                                    },
                                    alias: '_Close [EOP]'
                                }
                            ],
                            attributes: [
                                {
                                    displayForm: {
                                        uri: '/gdc/md/storybook/obj/4.df'
                                    },
                                    localIdentifier: 'a1'
                                },
                                {
                                    displayForm: {
                                        uri: '/gdc/md/storybook/obj/5.df'
                                    },
                                    localIdentifier: 'a2'
                                },
                                {
                                    displayForm: {
                                        uri: '/gdc/md/storybook/obj/6.df'
                                    },
                                    localIdentifier: 'a3'
                                }
                            ]
                        },
                        resultSpec: {
                            dimensions: [
                                {
                                    itemIdentifiers: [
                                        'a1',
                                        'a2'
                                    ],
                                    totals: [
                                        {
                                            measureIdentifier: 'm1',
                                            type: 'sum',
                                            attributeIdentifier: 'a1'
                                        },
                                        {
                                            measureIdentifier: 'm2',
                                            type: 'sum',
                                            attributeIdentifier: 'a1'
                                        },
                                        {
                                            measureIdentifier: 'm1',
                                            type: 'min',
                                            attributeIdentifier: 'a2'
                                        },
                                        {
                                            measureIdentifier: 'm1',
                                            type: 'max',
                                            attributeIdentifier: 'a2'
                                        },
                                        {
                                            measureIdentifier: 'm2',
                                            type: 'max',
                                            attributeIdentifier: 'a2'
                                        }
                                    ]
                                },
                                {
                                    itemIdentifiers: [
                                        'a3',
                                        'measureGroup'
                                    ]
                                }
                            ]
                        }
                    }
                },
                executionResponse: {
                    executionResponse: {
                        dimensions: [
                            {
                                headers: [
                                    {
                                        attributeHeader: {
                                            name: 'Region',
                                            localIdentifier: 'a1',
                                            uri: '/gdc/md/storybook/obj/4.df',
                                            identifier: '3.df',
                                            formOf: {
                                                name: 'Region',
                                                uri: '/gdc/md/storybook/obj/4',
                                                identifier: '3'
                                            },
                                            totalItems: [
                                                {
                                                    totalHeaderItem: {
                                                        name: 'sum'
                                                    }
                                                }
                                            ]
                                        }
                                    },
                                    {
                                        attributeHeader: {
                                            name: 'Department',
                                            localIdentifier: 'a2',
                                            uri: '/gdc/md/storybook/obj/5.df',
                                            identifier: '4.df',
                                            formOf: {
                                                name: 'Department',
                                                uri: '/gdc/md/storybook/obj/5',
                                                identifier: '4'
                                            },
                                            totalItems: [
                                                {
                                                    totalHeaderItem: {
                                                        name: 'max'
                                                    }
                                                },
                                                {
                                                    totalHeaderItem: {
                                                        name: 'min'
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                ]
                            },
                            {
                                headers: [
                                    {
                                        attributeHeader: {
                                            name: 'Is Won?',
                                            localIdentifier: 'a3',
                                            uri: '/gdc/md/storybook/obj/6.df',
                                            identifier: '5.df',
                                            formOf: {
                                                name: 'Is Won?',
                                                uri: '/gdc/md/storybook/obj/6',
                                                identifier: '5'
                                            }
                                        }
                                    },
                                    {
                                        measureGroupHeader: {
                                            items: [
                                                {
                                                    measureHeaderItem: {
                                                        name: '_Close [BOP]',
                                                        format: '#,##0.00',
                                                        localIdentifier: 'm1',
                                                        uri: '/gdc/md/storybook/obj/1',
                                                        identifier: '1'
                                                    }
                                                },
                                                {
                                                    measureHeaderItem: {
                                                        name: '_Close [EOP]',
                                                        format: '#,##0.00',
                                                        localIdentifier: 'm2',
                                                        uri: '/gdc/md/storybook/obj/2',
                                                        identifier: '2'
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                ]
                            }
                        ],
                        links: {
                            executionResult: '/gdc/app/projects/storybook/executionResults/7191568985292372992?q=eAGtk19LwzAUxb%2FKyF6L%2FadbO5CBOqUvKsPhQymSLtmsNE1MUucc%2Fe7erGxSsQ%2B1eyr35vbk3B8n%0AOySp4FLfY0bRBC0KnemcEmShJc9LVig0iXcIay2ztNT0yZzCXKQGz7yYwpgqGcNyCz0oSKZEjre3%0AXLKIQMtek6XNiK03F2LN%2BIc%2FZiMeuO5GpqoUq%2B3rF3HeA5HaPH2zXSd0QCPFis5yymihF%2FOou0gQ%0A2rT%2BXU0zcgmK%2B5Uapo%2F7%2FMdlEBpNrnFu4MSJFSdJZSFGgdHyTvJSoORQ1vhWwANrcDC0hkPnzDFr%0ANrgdHL5c51zRQXz18JjATC3Z3WPouS6qrB3qfPGs78WOjyrYXvJNS3LmdJ3x4jeAnsHxzkGwb3A8%0Avy04R8%2B9cuP5YPInNyYBEJS4%2FkKC%2FnhmN1Rgqc1TODWw8SmAjdqANXz3gzZqQmP4ExosK%2FboTAWP%0AL6m%2BAZp5loc%3D%0A&c=9c130fe602b1856e1f6e90f17d5f837f&offset=0%2C0&limit=1000%2C1000&dimensions=2&totals=1%2C0'
                        }
                    }
                },
                executionResult: {
                    executionResult: {
                        data: [
                            [
                                '40652',
                                '42613',
                                '40331',
                                '41053'
                            ],
                            [
                                '40630',
                                '41380',
                                null,
                                '41056'
                            ],
                            [
                                '40652',
                                '42613',
                                '40331',
                                '41056'
                            ],
                            [
                                '40630',
                                null,
                                '40331',
                                null
                            ],
                            [
                                '41013',
                                '41515',
                                null,
                                '41056'
                            ],
                            [
                                '40633',
                                '42794',
                                null,
                                '41052'
                            ],
                            [
                                '41013',
                                '42794',
                                null,
                                '41056'
                            ],
                            [
                                '40633',
                                null,
                                null,
                                null
                            ]
                        ],
                        paging: {
                            count: [
                                8,
                                4
                            ],
                            offset: [
                                0,
                                0
                            ],
                            total: [
                                8,
                                4
                            ]
                        },
                        headerItems: [
                            [
                                [
                                    {
                                        attributeHeaderItem: {
                                            name: 'East Coast',
                                            uri: '/gdc/md/storybook/obj/4/elements?id=1'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            name: 'East Coast',
                                            uri: '/gdc/md/storybook/obj/4/elements?id=1'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            name: 'East Coast',
                                            uri: '/gdc/md/storybook/obj/4/elements?id=1'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            name: 'East Coast',
                                            uri: '/gdc/md/storybook/obj/4/elements?id=1'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            name: 'West Coast',
                                            uri: '/gdc/md/storybook/obj/4/elements?id=2'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            name: 'West Coast',
                                            uri: '/gdc/md/storybook/obj/4/elements?id=2'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            name: 'West Coast',
                                            uri: '/gdc/md/storybook/obj/4/elements?id=2'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            name: 'West Coast',
                                            uri: '/gdc/md/storybook/obj/4/elements?id=2'
                                        }
                                    },
                                    {
                                        totalHeaderItem: {
                                            name: 'sum',
                                            type: 'sum'
                                        }
                                    }
                                ],
                                [
                                    {
                                        attributeHeaderItem: {
                                            name: 'Direct Sales',
                                            uri: '/gdc/md/storybook/obj/5/elements?id=1'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            name: 'Inside Sales',
                                            uri: '/gdc/md/storybook/obj/5/elements?id=2'
                                        }
                                    },
                                    {
                                        totalHeaderItem: {
                                            name: 'max',
                                            type: 'max'
                                        }
                                    },
                                    {
                                        totalHeaderItem: {
                                            name: 'min',
                                            type: 'min'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            name: 'Direct Sales',
                                            uri: '/gdc/md/storybook/obj/5/elements?id=1'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            name: 'Inside Sales',
                                            uri: '/gdc/md/storybook/obj/5/elements?id=2'
                                        }
                                    },
                                    {
                                        totalHeaderItem: {
                                            name: 'max',
                                            type: 'max'
                                        }
                                    },
                                    {
                                        totalHeaderItem: {
                                            name: 'min',
                                            type: 'min'
                                        }
                                    },
                                    {
                                        totalHeaderItem: {
                                            name: 'sum',
                                            type: 'sum'
                                        }
                                    }
                                ]
                            ],
                            [
                                [
                                    {
                                        attributeHeaderItem: {
                                            name: 'false',
                                            uri: '/gdc/md/storybook/obj/6/elements?id=1'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            name: 'false',
                                            uri: '/gdc/md/storybook/obj/6/elements?id=1'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            name: 'true',
                                            uri: '/gdc/md/storybook/obj/6/elements?id=2'
                                        }
                                    },
                                    {
                                        attributeHeaderItem: {
                                            name: 'true',
                                            uri: '/gdc/md/storybook/obj/6/elements?id=2'
                                        }
                                    }
                                ],
                                [
                                    {
                                        measureHeaderItem: {
                                            name: '_Close [BOP]',
                                            order: 0
                                        }
                                    },
                                    {
                                        measureHeaderItem: {
                                            name: '_Close [EOP]',
                                            order: 1
                                        }
                                    },
                                    {
                                        measureHeaderItem: {
                                            name: '_Close [BOP]',
                                            order: 0
                                        }
                                    },
                                    {
                                        measureHeaderItem: {
                                            name: '_Close [EOP]',
                                            order: 1
                                        }
                                    }
                                ]
                            ]
                        ],
                        totals: [
                            [
                                [
                                    '162928',
                                    '168302',
                                    '40331',
                                    '164217'
                                ]
                            ],
                            []
                        ]
                    }
                }
            },
            ...heatmapAfmExecutions,
            ...pivotTableAfmExecutions,
            ...pivotTableSubtotalsAfmExecutions,
            ...pivotTableGrandtotalSubtotalAfmExecutions,
        ],
        visualizationClasses: [{
            title: 'Table',
            url: 'local:table'
        }, {
            title: 'Column',
            url: 'local:column'
        }, {
            title: 'Bar',
            url: 'local:bar'
        }, {
            title: 'Line',
            url: 'local:line'
        }, {
            title: 'Combo',
            url: 'local:combo2'
        }, {
            title: 'Pie',
            url: 'local:pie'
        }, {
            title: 'Headline',
            url: 'local:headline'
        }],
        visualizationObjects: [{
                identifier: '1001',
                title: 'Table',
                type: 'local:table',
                buckets: [{
                    localIdentifier: 'measures',
                    items: [{
                        localIdentifier: '1',
                        identifier: '1',
                        alias: 'Amount'
                    }, {
                        localIdentifier: '2',
                        identifier: '1',
                        alias: 'Amount'
                    }]
                }, {
                    localIdentifier: 'attribute',
                    items: [{
                        localIdentifier: '3',
                        displayForm: '3.df'
                    }]
                }]
            },
            {
                identifier: '1002',
                title: 'Pie chart',
                type: 'local:pie',
                buckets: [{
                    localIdentifier: 'measures',
                    items: [{
                        localIdentifier: 'm1',
                        identifier: '1',
                        alias: 'Amount'
                    }, {
                        localIdentifier: 'm2',
                        identifier: '2',
                        alias: 'Amount 2'
                    }]
                }]
            },
            {
                title: 'Chart with PoP measures',
                identifier: '1003',
                type: 'local:bar',
                filters: [],
                buckets: [{
                    localIdentifier: 'measures',
                    items: [{
                        localIdentifier: 'm1_pop',
                        filters: [],
                        identifier: '1',
                        isDerived: true,
                        measureIdentifier: 'm1',
                        popAttribute: 'attr.closed.year'
                    }, {
                        localIdentifier: 'm1',
                        filters: [],
                        identifier: '1',
                        alias: 'Amount'
                    }, {
                        localIdentifier: 'm2',
                        filters: [],
                        identifier: '2',
                        alias: 'Value'
                    }, {
                        localIdentifier: 'm2_pop',
                        filters: [],
                        identifier: '2',
                        isDerived: true,
                        measureIdentifier: 'm2',
                        popAttribute: 'attr.closed.year'
                    }]
                }, {
                    localIdentifier: 'view',
                    items: [{
                        localIdentifier: 'a1',
                        displayForm: 'attr.closed.year.df',
                        alias: 'Date'
                    }]
                }]
            },
            {
                identifier: '1004',
                title: 'Headline',
                type: 'local:headline',
                buckets: [{
                    localIdentifier: 'measures',
                    items: [{
                        localIdentifier: '1',
                        identifier: '1',
                        alias: 'Amount'
                    }]
                }]
            },
            {
                title: 'Chart with arithmetic measures',
                identifier: '1008',
                type: 'local:bar',
                filters: [],
                buckets: [{
                    localIdentifier: 'measures',
                    items: [{
                        localIdentifier: 'm4',
                        filters: [],
                        identifier: '4',
                        isArithmetic: true,
                        measureIdentifiers: ['m3', 'm2'],
                        operator: 'sum'
                    }, {
                        localIdentifier: 'm1',
                        filters: [],
                        identifier: '1',
                        title: 'Amount',
                        alias: 'Renamed Amount'
                    },{
                        localIdentifier: 'm3',
                        filters: [],
                        identifier: '3',
                        isArithmetic: true,
                        measureIdentifiers: ['m1', 'm2'],
                        operator: 'sum',
                        alias: 'Arithmetic using simple'
                    }, {
                        localIdentifier: 'm2',
                        filters: [],
                        identifier: '2',
                        title: 'A measure with long title'
                    }]
                }, {
                    localIdentifier: 'view',
                    items: [{
                        localIdentifier: 'a1',
                        displayForm: 'attr.closed.year.df',
                        title: 'Date'
                    }]
                }]
            },
            {
                title: 'Chart with previous period measures',
                identifier: '1006',
                type: 'local:bar',
                filters: [],
                buckets: [{
                    localIdentifier: 'measures',
                    items: [{
                        localIdentifier: 'm1_previous_period',
                        filters: [],
                        identifier: '1',
                        isDerived: true,
                        measureIdentifier: 'm1',
                        previousPeriod: {
                            dateDataSets: [{
                                dataSet: 'attr.closed',
                                periodsAgo: 1
                            }]
                        }
                    }, {
                        localIdentifier: 'm1',
                        filters: [],
                        identifier: '1',
                        alias: 'Amount'
                    }, {
                        localIdentifier: 'm2',
                        filters: [],
                        identifier: '2',
                        alias: 'Value'
                    }, {
                        localIdentifier: 'm2_previous_period',
                        filters: [],
                        identifier: '2',
                        isDerived: true,
                        measureIdentifier: 'm2',
                        previousPeriod: {
                            dateDataSets: [{
                                dataSet: 'attr.closed',
                                periodsAgo: 1
                            }]
                        }
                    }]
                }, {
                    localIdentifier: 'view',
                    items: [{
                        localIdentifier: 'a1',
                        displayForm: 'attr.closed.year.df',
                        alias: 'Date'
                    }]
                }]
            },
            {
                title: 'Chart with disabled gridline',
                identifier: '1007',
                type: 'local:bar',
                filters: [],
                buckets: [{
                    localIdentifier: 'measures',
                    items: [{
                        localIdentifier: 'm1',
                        filters: [],
                        identifier: '1',
                        alias: 'Amount'
                    }, {
                        localIdentifier: 'm2',
                        filters: [],
                        identifier: '2',
                        alias: 'Value'
                    }]
                }, {
                    localIdentifier: 'view',
                    items: [{
                        localIdentifier: 'a1',
                        displayForm: 'attr.closed.year.df',
                        alias: 'Date'
                    }]
                }],
                properties: "{\"controls\":{\"grid\":{\"enabled\":false}}}"
            },
            {
                identifier: '1010',
                title: 'Table',
                type: 'local:table',
                buckets: [{
                    localIdentifier: 'measures',
                    items: [{
                        localIdentifier: '1',
                        identifier: '1'
                    }, {
                        localIdentifier: '2',
                        identifier: '2'
                    }]
                }, {
                    localIdentifier: 'attribute',
                    items: [{
                        localIdentifier: 'a1',
                        displayForm: '4.df'
                    }, {
                        localIdentifier: 'a2',
                        displayForm: '5.df'
                    }]
                }]
            },
            {
                title: 'Combo chart',
                identifier: '1011',
                type: 'local:combo2',
                buckets: [{
                    localIdentifier: 'measures',
                    items: [{
                        localIdentifier: 'm1',
                        identifier: '1'
                    }]
                }, {
                    localIdentifier: 'secondary_measures',
                    items: [{
                        localIdentifier: 'm2',
                        identifier: '2'
                    }]
                }, {
                    localIdentifier: 'view',
                    items: [{
                        localIdentifier: 'a1',
                        displayForm: 'attr.closed.year.df',
                        title: 'Date'
                    }]
                }],
                properties: "{\"controls\":{\"secondary_yaxis\":{\"measures\":[\"2\"]},\"primaryChartType\":\"column\",\"secondaryChartType\":\"line\"}}"
            },
        ]
    }
};

module.exports = [
    getBaseProjectSchema('Storybook project v1', 'storybook'),
    { ...getBaseProjectSchema('Storybook custom color palette project', 'colorstorybook'),
        styleSettings: {
            chartPalette: [
                {
                    guid: 'red',
                    fill: {
                        r: 255,
                        g: 0,
                        b: 0
                    }
                }, {
                    guid: 'green',
                    fill: {
                        r: 0,
                        g: 255,
                        b: 0
                    }
                }, {
                    guid: 'blue',
                    fill: {
                        r: 0,
                        g: 0,
                        b: 255
                    }
                }
            ]
        },
    },
];
