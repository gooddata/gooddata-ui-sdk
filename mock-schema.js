module.exports = {
    project: {
        title: 'Storybook project v1',
        identifier: 'storybook'
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
                                        uri: '/gdc/md/storybook/obj/9'
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
                                            uri: '/gdc/md/storybook/obj/1'
                                        }
                                    }
                                }
                            },
                            {
                                localIdentifier: 'm2',
                                definition: {
                                    measure: {
                                        item: {
                                            uri: '/gdc/md/storybook/obj/2'
                                        }
                                    }
                                }
                            }
                        ],
                        attributes: [{
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
                                    uri: '/gdc/md/storybook/obj/4/elements?id=1',
                                    name: 'Pink'
                                }
                            }, {
                                attributeHeaderItem: {
                                    uri: '/gdc/md/storybook/obj/4/elements?id=1',
                                    name: 'Pink'
                                }
                            }, {
                                attributeHeaderItem: {
                                    uri: '/gdc/md/storybook/obj/4/elements?id=1',
                                    name: 'Pink'
                                }
                            }, {
                                attributeHeaderItem: {
                                    uri: '/gdc/md/storybook/obj/4/elements?id=1',
                                    name: 'Pink'
                                }
                            }, {
                                attributeHeaderItem: {
                                    uri: '/gdc/md/storybook/obj/4/elements?id=1',
                                    name: 'Pink'
                                }
                            }, {
                                attributeHeaderItem: {
                                    uri: '/gdc/md/storybook/obj/4/elements?id=1',
                                    name: 'Pink'
                                }
                            }, {
                                attributeHeaderItem: {
                                    uri: '/gdc/md/storybook/obj/4/elements?id=2',
                                    name: 'Red'
                                }
                            }, {
                                attributeHeaderItem: {
                                    uri: '/gdc/md/storybook/obj/4/elements?id=2',
                                    name: 'Red'
                                }
                            }, {
                                attributeHeaderItem: {
                                    uri: '/gdc/md/storybook/obj/4/elements?id=2',
                                    name: 'Red'
                                }
                            }, {
                                attributeHeaderItem: {
                                    uri: '/gdc/md/storybook/obj/4/elements?id=2',
                                    name: 'Red'
                                }
                            }, {
                                attributeHeaderItem: {
                                    uri: '/gdc/md/storybook/obj/4/elements?id=2',
                                    name: 'Red'
                                }
                            }, {
                                attributeHeaderItem: {
                                    uri: '/gdc/md/storybook/obj/4/elements?id=2',
                                    name: 'Red'
                                }
                            }, {
                                attributeHeaderItem: {
                                    uri: '/gdc/md/storybook/obj/4/elements?id=3',
                                    name: 'Purple'
                                }
                            }, {
                                attributeHeaderItem: {
                                    uri: '/gdc/md/storybook/obj/4/elements?id=3',
                                    name: 'Purple'
                                }
                            }, {
                                attributeHeaderItem: {
                                    uri: '/gdc/md/storybook/obj/4/elements?id=3',
                                    name: 'Purple'
                                }
                            }, {
                                attributeHeaderItem: {
                                    uri: '/gdc/md/storybook/obj/4/elements?id=3',
                                    name: 'Purple'
                                }
                            }, {
                                attributeHeaderItem: {
                                    uri: '/gdc/md/storybook/obj/4/elements?id=3',
                                    name: 'Purple'
                                }
                            }, {
                                attributeHeaderItem: {
                                    uri: '/gdc/md/storybook/obj/4/elements?id=3',
                                    name: 'Purple'
                                }
                            }, {
                                attributeHeaderItem: {
                                    uri: '/gdc/md/storybook/obj/4/elements?id=4',
                                    name: 'Salmon'
                                }
                            }, {
                                attributeHeaderItem: {
                                    uri: '/gdc/md/storybook/obj/4/elements?id=4',
                                    name: 'Salmon'
                                }
                            }, {
                                attributeHeaderItem: {
                                    uri: '/gdc/md/storybook/obj/4/elements?id=4',
                                    name: 'Salmon'
                                }
                            }, {
                                attributeHeaderItem: {
                                    uri: '/gdc/md/storybook/obj/4/elements?id=4',
                                    name: 'Salmon'
                                }
                            }, {
                                attributeHeaderItem: {
                                    uri: '/gdc/md/storybook/obj/4/elements?id=4',
                                    name: 'Salmon'
                                }
                            }, {
                                attributeHeaderItem: {
                                    uri: '/gdc/md/storybook/obj/4/elements?id=4',
                                    name: 'Salmon'
                                }
                            }],
                            [{
                                attributeHeaderItem: {
                                    uri: '/gdc/md/storybook/obj/5/elements?id=1',
                                    name: 'low'
                                }
                            }, {
                                attributeHeaderItem: {
                                    uri: '/gdc/md/storybook/obj/5/elements?id=1',
                                    name: 'low'
                                }
                            }, {
                                attributeHeaderItem: {
                                    uri: '/gdc/md/storybook/obj/5/elements?id=2',
                                    name: 'medium'
                                }
                            }, {
                                attributeHeaderItem: {
                                    uri: '/gdc/md/storybook/obj/5/elements?id=2',
                                    name: 'medium'
                                }
                            }, {
                                attributeHeaderItem: {
                                    uri: '/gdc/md/storybook/obj/5/elements?id=3',
                                    name: 'high'
                                }
                            }, {
                                attributeHeaderItem: {
                                    uri: '/gdc/md/storybook/obj/5/elements?id=3',
                                    name: 'high'
                                }
                            }, {
                                attributeHeaderItem: {
                                    uri: '/gdc/md/storybook/obj/5/elements?id=1',
                                    name: 'low'
                                }
                            }, {
                                attributeHeaderItem: {
                                    uri: '/gdc/md/storybook/obj/5/elements?id=1',
                                    name: 'low'
                                }
                            }, {
                                attributeHeaderItem: {
                                    uri: '/gdc/md/storybook/obj/5/elements?id=2',
                                    name: 'medium'
                                }
                            }, {
                                attributeHeaderItem: {
                                    uri: '/gdc/md/storybook/obj/5/elements?id=2',
                                    name: 'medium'
                                }
                            }, {
                                attributeHeaderItem: {
                                    uri: '/gdc/md/storybook/obj/5/elements?id=3',
                                    name: 'high'
                                }
                            }, {
                                attributeHeaderItem: {
                                    uri: '/gdc/md/storybook/obj/5/elements?id=3',
                                    name: 'high'
                                }
                            }, {
                                attributeHeaderItem: {
                                    uri: '/gdc/md/storybook/obj/5/elements?id=1',
                                    name: 'low'
                                }
                            }, {
                                attributeHeaderItem: {
                                    uri: '/gdc/md/storybook/obj/5/elements?id=1',
                                    name: 'low'
                                }
                            }, {
                                attributeHeaderItem: {
                                    uri: '/gdc/md/storybook/obj/5/elements?id=2',
                                    name: 'medium'
                                }
                            }, {
                                attributeHeaderItem: {
                                    uri: '/gdc/md/storybook/obj/5/elements?id=2',
                                    name: 'medium'
                                }
                            }, {
                                attributeHeaderItem: {
                                    uri: '/gdc/md/storybook/obj/5/elements?id=3',
                                    name: 'high'
                                }
                            }, {
                                attributeHeaderItem: {
                                    uri: '/gdc/md/storybook/obj/5/elements?id=3',
                                    name: 'high'
                                }
                            }, {
                                attributeHeaderItem: {
                                    uri: '/gdc/md/storybook/obj/5/elements?id=1',
                                    name: 'low'
                                }
                            }, {
                                attributeHeaderItem: {
                                    uri: '/gdc/md/storybook/obj/5/elements?id=1',
                                    name: 'low'
                                }
                            }, {
                                attributeHeaderItem: {
                                    uri: '/gdc/md/storybook/obj/5/elements?id=2',
                                    name: 'medium'
                                }
                            }, {
                                attributeHeaderItem: {
                                    uri: '/gdc/md/storybook/obj/5/elements?id=2',
                                    name: 'medium'
                                }
                            }, {
                                attributeHeaderItem: {
                                    uri: '/gdc/md/storybook/obj/5/elements?id=3',
                                    name: 'high'
                                }
                            }, {
                                attributeHeaderItem: {
                                    uri: '/gdc/md/storybook/obj/5/elements?id=3',
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
                                        uri: '/gdc/md/storybook/obj/1'
                                    }
                                }
                            }
                        }, {
                            localIdentifier: 'm4',
                            definition: {
                                measure: {
                                    item: {
                                        uri: '/gdc/md/storybook/obj/9'
                                    }
                                }
                            }
                        }],
                        attributes: [{
                            localIdentifier: 'a1',
                            displayForm: {
                                uri: '/gdc/md/storybook/obj/4.df'
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
            _description: 'Treemap with sorted values', // once mock-js will support multi-sorting this can be removed
            execution: {
                execution: {
                    afm: {
                        measures: [{
                            localIdentifier: 'm1',
                            definition: {
                                measure: {
                                    item: {
                                        uri: '/gdc/md/storybook/obj/1'
                                    }
                                }
                            }
                        }],
                        attributes: [{
                            localIdentifier: 'a1',
                            displayForm: {
                                uri: '/gdc/md/storybook/obj/4.df'
                            }
                        }, {
                            localIdentifier: 'a2',
                            displayForm: {
                                uri: '/gdc/md/storybook/obj/5.df'
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
                                        uri: '/gdc/md/storybook/obj/4/elements?id=1',
                                        name: 'Pink'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/4/elements?id=1',
                                        name: 'Pink'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/4/elements?id=1',
                                        name: 'Pink'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/4/elements?id=3',
                                        name: 'Purple'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/4/elements?id=3',
                                        name: 'Purple'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/4/elements?id=3',
                                        name: 'Purple'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/4/elements?id=2',
                                        name: 'Red'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/4/elements?id=2',
                                        name: 'Red'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/4/elements?id=2',
                                        name: 'Red'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/4/elements?id=4',
                                        name: 'Salmon'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/4/elements?id=4',
                                        name: 'Salmon'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/4/elements?id=4',
                                        name: 'Salmon'
                                    }
                                }
                            ],
                            [{
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=1',
                                        name: 'low'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=2',
                                        name: 'medium'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=3',
                                        name: 'high'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=1',
                                        name: 'low'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=2',
                                        name: 'medium'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=3',
                                        name: 'high'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=1',
                                        name: 'low'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=2',
                                        name: 'medium'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=3',
                                        name: 'high'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=1',
                                        name: 'low'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=2',
                                        name: 'medium'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=3',
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
                                        uri: '/gdc/md/storybook/obj/1'
                                    }
                                }
                            }
                        }],
                        attributes: [{
                            localIdentifier: 'a3',
                            displayForm: {
                                uri: '/gdc/md/storybook/obj/6.df'
                            }
                        }, {
                            localIdentifier: 'a2',
                            displayForm: {
                                uri: '/gdc/md/storybook/obj/5.df'
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
                                        uri: '/gdc/md/storybook/obj/6/elements?id=1',
                                        name: 'rep1'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=1',
                                        name: 'rep1'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=1',
                                        name: 'rep1'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=3',
                                        name: 'rep3'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=3',
                                        name: 'rep3'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=3',
                                        name: 'rep3'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=2',
                                        name: 'rep2'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=2',
                                        name: 'rep2'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=2',
                                        name: 'rep2'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=4',
                                        name: 'rep4'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=4',
                                        name: 'rep4'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=4',
                                        name: 'rep4'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=6',
                                        name: 'rep6'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=6',
                                        name: 'rep6'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=6',
                                        name: 'rep6'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=5',
                                        name: 'rep5'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=5',
                                        name: 'rep5'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=5',
                                        name: 'rep5'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=8',
                                        name: 'rep8'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=8',
                                        name: 'rep8'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=8',
                                        name: 'rep8'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=7',
                                        name: 'rep7'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=7',
                                        name: 'rep7'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=7',
                                        name: 'rep7'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=9',
                                        name: 'rep9'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=9',
                                        name: 'rep9'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=9',
                                        name: 'rep9'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=12',
                                        name: 'rep12'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=12',
                                        name: 'rep12'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=12',
                                        name: 'rep12'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=11',
                                        name: 'rep11'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=11',
                                        name: 'rep11'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=11',
                                        name: 'rep11'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=10',
                                        name: 'rep10'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=10',
                                        name: 'rep10'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=10',
                                        name: 'rep10'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=13',
                                        name: 'rep13'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=13',
                                        name: 'rep13'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=13',
                                        name: 'rep13'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=14',
                                        name: 'rep14'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=14',
                                        name: 'rep14'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=14',
                                        name: 'rep14'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=16',
                                        name: 'rep16'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=16',
                                        name: 'rep16'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=16',
                                        name: 'rep16'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=15',
                                        name: 'rep15'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=15',
                                        name: 'rep15'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=15',
                                        name: 'rep15'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=17',
                                        name: 'rep17'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=17',
                                        name: 'rep17'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=17',
                                        name: 'rep17'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=18',
                                        name: 'rep18'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=18',
                                        name: 'rep18'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=18',
                                        name: 'rep18'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=19',
                                        name: 'rep19'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=19',
                                        name: 'rep19'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=19',
                                        name: 'rep19'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=20',
                                        name: 'rep20'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=20',
                                        name: 'rep20'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/6/elements?id=20',
                                        name: 'rep20'
                                    }
                                }
                            ],
                            [
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=1',
                                        name: 'low'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=2',
                                        name: 'medium'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=3',
                                        name: 'high'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=1',
                                        name: 'low'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=2',
                                        name: 'medium'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=3',
                                        name: 'high'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=1',
                                        name: 'low'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=2',
                                        name: 'medium'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=3',
                                        name: 'high'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=1',
                                        name: 'low'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=2',
                                        name: 'medium'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=3',
                                        name: 'high'
                                    }
                                },
                                {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=1',
                                        name: 'low'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=2',
                                        name: 'medium'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=3',
                                        name: 'high'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=1',
                                        name: 'low'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=2',
                                        name: 'medium'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=3',
                                        name: 'high'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=1',
                                        name: 'low'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=2',
                                        name: 'medium'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=3',
                                        name: 'high'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=1',
                                        name: 'low'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=2',
                                        name: 'medium'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=3',
                                        name: 'high'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=1',
                                        name: 'low'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=2',
                                        name: 'medium'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=3',
                                        name: 'high'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=1',
                                        name: 'low'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=2',
                                        name: 'medium'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=3',
                                        name: 'high'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=1',
                                        name: 'low'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=2',
                                        name: 'medium'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=3',
                                        name: 'high'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=1',
                                        name: 'low'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=2',
                                        name: 'medium'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=3',
                                        name: 'high'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=1',
                                        name: 'low'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=2',
                                        name: 'medium'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=3',
                                        name: 'high'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=1',
                                        name: 'low'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=2',
                                        name: 'medium'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=3',
                                        name: 'high'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=1',
                                        name: 'low'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=2',
                                        name: 'medium'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=3',
                                        name: 'high'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=1',
                                        name: 'low'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=2',
                                        name: 'medium'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=3',
                                        name: 'high'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=1',
                                        name: 'low'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=2',
                                        name: 'medium'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=3',
                                        name: 'high'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=1',
                                        name: 'low'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=2',
                                        name: 'medium'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=3',
                                        name: 'high'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=1',
                                        name: 'low'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=2',
                                        name: 'medium'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=3',
                                        name: 'high'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=1',
                                        name: 'low'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=2',
                                        name: 'medium'
                                    }
                                }, {
                                    attributeHeaderItem: {
                                        uri: '/gdc/md/storybook/obj/5/elements?id=3',
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
                    showPoP: 'true',
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
                    showPoP: 'true',
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
                    showPoP: 'true',
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
                    showPoP: 'true',
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
        }
    ]
};
