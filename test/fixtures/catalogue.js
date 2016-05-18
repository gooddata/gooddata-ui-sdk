export const optionsForEmptySelection = {
        'types': [
            'metric',
            'attribute',
            'fact'
        ],
        'paging': {
            'offset': 0,
            'limit': 100
        },
        'bucketItems': {
            'type': 'column',
            'buckets': {
                'measures': [],
                'categories': [],
                'filters': []
            }
        }
};

export const requestForEmptySelection = {
    catalogRequest: {
        'types': [
            'metric',
            'attribute',
            'fact'
        ],
        'paging': {
            'offset': 0,
            'limit': 100
        },
        'bucketItems': []
    }
};

export const optionsForMeasureTypeFactWithFilter = {
  'types': [
    'metric',
    'attribute',
    'fact'
  ],
  'paging': {
    'offset': 0,
    'limit': 100
  },
  'bucketItems': {
    'type': 'column',
    'buckets': {
      'measures': [
        {
          'measure': {
            'type': 'fact',
            'aggregation': 'sum',
            'objectUri': '/gdc/md/FoodMartDemo/obj/1',
            'title': 'Sum of Accounting Amount',
            'format': '#,##0.00',
            'measureFilters': [
              {
                'listAttributeFilter': {
                  'attribute': '/gdc/md/FoodMartDemo/obj/58',
                  'displayForm': '/gdc/md/FoodMartDemo/obj/124',
                  'default': {
                    'negativeSelection': false,
                    'attributeElements': [
                      '/gdc/md/FoodMartDemo/obj/58/elements?id=1000'
                    ]
                  }
                }
              }
            ],
            'showInPercent': false,
            'showPoP': false
          }
        }
      ],
      'categories': [],
      'filters': []
    }
  }
};

export const requestForMeasureTypeFactWithFilter = {
    catalogRequest: {
        'types': [
            'metric',
            'attribute',
            'fact'
        ],
        'paging': {
            'offset': 0,
            'limit': 100
        },
        'bucketItems': [
            'SELECT SUM([/gdc/md/FoodMartDemo/obj/1]) WHERE [/gdc/md/FoodMartDemo/obj/58] IN ([/gdc/md/FoodMartDemo/obj/58/elements?id=1000])'
        ]
    }
};

export const optionsForMeasureWithFilterAndCategory = {
  'types': [
    'metric',
    'attribute',
    'fact'
  ],
  'paging': {
    'offset': 0,
    'limit': 100
  },
  'bucketItems': {
    'type': 'column',
    'buckets': {
      'measures': [
        {
          'measure': {
            'type': 'fact',
            'aggregation': 'sum',
            'objectUri': '/gdc/md/FoodMartDemo/obj/1',
            'title': 'Sum of Accounting Amount',
            'format': '#,##0.00',
            'measureFilters': [
              {
                'listAttributeFilter': {
                  'attribute': '/gdc/md/FoodMartDemo/obj/58',
                  'displayForm': '/gdc/md/FoodMartDemo/obj/124',
                  'default': {
                    'negativeSelection': false,
                    'attributeElements': [
                      '/gdc/md/FoodMartDemo/obj/58/elements?id=1000'
                    ]
                  }
                }
              }
            ],
            'showInPercent': false,
            'showPoP': false
          }
        }
      ],
      'categories': [
        {
          'category': {
            'type': 'attribute',
            'collection': 'view',
            'attribute': '/gdc/md/FoodMartDemo/obj/54',
            'displayForm': '/gdc/md/FoodMartDemo/obj/117'
          }
        }
      ],
      'filters': []
    }
  }
};

export const requestForMeasureWithFilterAndCategory = {
    catalogRequest: {
        'types': [
            'metric',
            'attribute',
            'fact'
        ],
        'paging': {
            'offset': 0,
            'limit': 100
        },
        'bucketItems': [
            '/gdc/md/FoodMartDemo/obj/54',
            'SELECT SUM([/gdc/md/FoodMartDemo/obj/1]) WHERE [/gdc/md/FoodMartDemo/obj/58] IN ([/gdc/md/FoodMartDemo/obj/58/elements?id=1000])'
        ]
    }
};

export const optionsForMeasureWithShowInPercent = {
    'types': [
        'metric',
        'attribute',
        'fact'
    ],
    'paging': {
        'offset': 0,
        'limit': 100
    },
    'bucketItems': {
        'type': 'column',
        'buckets': {
            'measures': [
                {
                    'measure': {
                        'type': 'fact',
                        'aggregation': 'sum',
                        'objectUri': '/gdc/md/FoodMartDemo/obj/1',
                        'title': '% Sum of Accounting Amount',
                        'format': '#,##0.00',
                        'measureFilters': [
                            {
                                'listAttributeFilter': {
                                    'attribute': '/gdc/md/FoodMartDemo/obj/58',
                                    'displayForm': '/gdc/md/FoodMartDemo/obj/124',
                                    'default': {
                                        'negativeSelection': false,
                                        'attributeElements': [
                                            '/gdc/md/FoodMartDemo/obj/58/elements?id=1000'
                                        ]
                                    }
                                }
                            }
                        ],
                        'showInPercent': true,
                        'showPoP': false
                    }
                }
            ],
            'categories': [
                {
                    'category': {
                        'type': 'attribute',
                        'collection': 'view',
                        'attribute': '/gdc/md/FoodMartDemo/obj/54',
                        'displayForm': '/gdc/md/FoodMartDemo/obj/117'
                    }
                }
            ],
            'filters': []
        }
    }
};

export const requestForMeasureWithShowInPercent = {
    catalogRequest: {
        'types': [
            'metric',
            'attribute',
            'fact'
        ],
        'paging': {
            'offset': 0,
            'limit': 100
        },
        'bucketItems': [
            '/gdc/md/FoodMartDemo/obj/54',
            'SELECT (SELECT SUM([/gdc/md/FoodMartDemo/obj/1]) WHERE [/gdc/md/FoodMartDemo/obj/58] IN ([/gdc/md/FoodMartDemo/obj/58/elements?id=1000])) / (SELECT SUM([/gdc/md/FoodMartDemo/obj/1]) WHERE [/gdc/md/FoodMartDemo/obj/58] IN ([/gdc/md/FoodMartDemo/obj/58/elements?id=1000]) BY ALL [/gdc/md/FoodMartDemo/obj/54])'
        ]
    }
};

export const optionsForTwoMeasuresFactAndAtrribute = {
    'types': [
        'metric',
        'attribute',
        'fact'
    ],
    'paging': {
        'offset': 0,
        'limit': 100
    },
    'bucketItems': {
        'type': 'column',
        'buckets': {
            'measures': [
                {
                    'measure': {
                        'type': 'fact',
                        'aggregation': 'sum',
                        'objectUri': '/gdc/md/FoodMartDemo/obj/1',
                        'title': 'Sum of Accounting Amount',
                        'format': '#,##0.00',
                        'measureFilters': [
                            {
                                'listAttributeFilter': {
                                    'attribute': '/gdc/md/FoodMartDemo/obj/58',
                                    'displayForm': '/gdc/md/FoodMartDemo/obj/124',
                                    'default': {
                                        'negativeSelection': false,
                                        'attributeElements': [
                                            '/gdc/md/FoodMartDemo/obj/58/elements?id=1000'
                                        ]
                                    }
                                }
                            }
                        ],
                        'showInPercent': false,
                        'showPoP': false
                    }
                },
                {
                    'measure': {
                        'type': 'attribute',
                        'aggregation': 'count',
                        'objectUri': '/gdc/md/FoodMartDemo/obj/40',
                        'title': 'Count of Brand',
                        'format': '#,##0.00',
                        'measureFilters': [],
                        'showInPercent': false,
                        'showPoP': false
                    }
                }
            ],
            'categories': [],
            'filters': []
        }
    }
};

export const requestForTwoMeasureFactAndAttribute = {
    catalogRequest: {
        'types': [
            'metric',
            'attribute',
            'fact'
        ],
        'paging': {
            'offset': 0,
            'limit': 100
        },
        'bucketItems': [
            'SELECT SUM([/gdc/md/FoodMartDemo/obj/1]) WHERE [/gdc/md/FoodMartDemo/obj/58] IN ([/gdc/md/FoodMartDemo/obj/58/elements?id=1000])',
            'SELECT COUNT([/gdc/md/FoodMartDemo/obj/40])'
        ]
    }
};

export const optionsForMetric = {
    'types': [
        'metric',
        'attribute',
        'fact'
    ],
    'paging': {
        'offset': 0,
        'limit': 100
    },
    'bucketItems': {
        'type': 'column',
        'buckets': {
            'measures': [
                {
                    'measure': {
                        'type': 'metric',
                        'objectUri': '/gdc/md/FoodMartDemo/obj/8349',
                        'title': '+My metric',
                        'format': '#,##0.00',
                        'measureFilters': [],
                        'showInPercent': false,
                        'showPoP': false
                    }
                }
            ],
            'categories': [],
            'filters': []
        }
    }
};

export const requestForMetric = {
    catalogRequest: {
        'types': [
            'metric',
            'attribute',
            'fact'
        ],
        'paging': {
            'offset': 0,
            'limit': 100
        },
        'bucketItems': [
            '/gdc/md/FoodMartDemo/obj/8349'
        ]
    }
};

export const loadCatalogResponse = {
    'paging': {
        'count': 4,
        'offset': 0
    },
    'totals': {
       'available': 4,
       'unavailable': 0
   },
   catalog: [
       {
           'metric': {
               'content': {
                   'format': '#,##0.00',
                   'tree': {
                       'content': [
                           {
                               'content': [
                                   {
                                       'value': 'SUM',
                                       'content': [
                                           {
                                               'value': '/gdc/md/FoodMartDemo/obj/4',
                                               'position': {
                                                   'column': 12,
                                                   'line': 2
                                               },
                                               'type': 'fact object'
                                           }
                                       ],
                                       'position': {
                                           'column': 8,
                                           'line': 2
                                       },
                                       'type': 'function'
                                   }
                               ],
                               'position': {
                                   'column': 8,
                                   'line': 2
                               },
                               'type': 'expression'
                           }
                       ],
                       'position': {
                           'column': 1,
                           'line': 2
                       },
                       'type': 'metric'
                   },
                   'expression': 'SELECT SUM([/gdc/md/FoodMartDemo/obj/4])'
               },
               'meta': {
                   'author': '/gdc/account/profile/876ec68f5630b38de65852ed5d6236ff',
                   'uri': '/gdc/md/FoodMartDemo/obj/8336',
                   'tags': '',
                   'created': '2016-04-26 15:49:49',
                   'identifier': 'aaeEnkckePID',
                   'deprecated': '0',
                   'summary': '',
                   'isProduction': 1,
                   'unlisted': 1,
                   'title': '!!!!!!!!!!!Sale Units [Sum]',
                   'category': 'metric',
                   'updated': '2016-04-26 15:50:03',
                   'contributor': '/gdc/account/profile/876ec68f5630b38de65852ed5d6236ff'
               }
           }
       },
       {
            'fact': {
                'content': {
                    'expr': [
                        {
                            'data': '/gdc/md/FoodMartDemo/obj/3450',
                            'type': 'col'
                        }
                    ]
                },
                'meta': {
                    'author': '/gdc/account/profile/876ec68f5630b38de65852ed5d6236ff',
                    'uri': '/gdc/md/FoodMartDemo/obj/1',
                    'tags': 'accounting amount',
                    'created': '2008-06-27 11: 10: 22',
                    'identifier': 'aiUoIYHjgESv',
                    'deprecated': '0',
                    'summary': 'Accounting Amount',
                    'isProduction': 1,
                    'title': 'Accounting Amount',
                    'category': 'fact',
                    'updated': '2009-10-08 23:05: 17',
                    'contributor': '/gdc/account/profile/876ec68f5630b38de65852ed5d6236ff'
                }
            }
        },
        {
            'attribute': {
                'content': {
                    'drillDownStepAttributeDF': '/gdc/md/FoodMartDemo/obj/105',
                    'pk': [
                        {
                            'data': '/gdc/md/FoodMartDemo/obj/3256',
                            'type': 'col'
                        }
                    ],
                    'dimension': '/gdc/md/FoodMartDemo/obj/20',
                    'displayForms': [
                        {
                            'content': {
                                'formOf': '/gdc/md/FoodMartDemo/obj/69',
                                'expression': '[/gdc/md/FoodMartDemo/obj/3410]'
                            },
                            'links': {
                                'elements': '/gdc/md/FoodMartDemo/obj/137/elements'
                            },
                            'meta': {
                                'author': '/gdc/account/profile/876ec68f5630b38de65852ed5d6236ff',
                                'uri': '/gdc/md/FoodMartDemo/obj/137',
                                'tags': '',
                                'created': '2008-06-27 11: 10: 26',
                                'identifier': 'alboIYHjgESv',
                                'deprecated': '0',
                                'summary': '',
                                'isProduction': 1,
                                'title': 'Management Role',
                                'category': 'attributeDisplayForm',
                                'updated': '2009-10-08 22:37: 29',
                                'contributor': '/gdc/account/profile/876ec68f5630b38de65852ed5d6236ff'
                            }
                        }
                    ],
                    'fk': [
                        {
                            'data': '/gdc/md/FoodMartDemo/obj/3257',
                            'type': 'col'
                        }
                    ]
                },
                'meta': {
                    'author': '/gdc/account/profile/876ec68f5630b38de65852ed5d6236ff',
                    'uri': '/gdc/md/FoodMartDemo/obj/69',
                    'tags': 'employee hr management role',
                    'created': '2008-06-27 11: 10: 25',
                    'identifier': 'ahwoIYHjgESv',
                    'deprecated': '0',
                    'summary': 'Management Role',
                    'isProduction': 1,
                    'title': 'Management Role',
                    'category': 'attribute',
                    'updated': '2009-10-08 22:37: 29',
                    'contributor': '/gdc/account/profile/876ec68f5630b38de65852ed5d6236ff'
                }
            }
        },
        {
            'metric': {
                'content': {
                    'format': '#,##0.00',
                    'tree': {
                        'content': [
                            {
                                'content': [
                                    {
                                        'value': 'SUM',
                                        'content': [
                                            {
                                                'value': '/gdc/md/FoodMartDemo/obj/4',
                                                'position': {
                                                    'column': 12,
                                                    'line': 2
                                                },
                                                'type': 'fact object'
                                            }
                                        ],
                                        'position': {
                                            'column': 8,
                                            'line': 2
                                        },
                                        'type': 'function'
                                    }
                                ],
                                'position': {
                                    'column': 8,
                                    'line': 2
                                },
                                'type': 'expression'
                            }
                        ],
                        'position': {
                            'column': 1,
                            'line': 2
                        },
                        'type': 'metric'
                    },
                    'expression': 'SELECT SUM([/gdc/md/FoodMartDemo/obj/4])'
                },
                'meta': {
                    'author': '/gdc/account/profile/876ec68f5630b38de65852ed5d6236ff',
                    'uri': '/gdc/md/FoodMartDemo/obj/8342',
                    'tags': '',
                    'created': '2016-04-27 16:57: 26',
                    'identifier': 'aabKv6ZZgEoS',
                    'deprecated': '0',
                    'summary': '',
                    'isProduction': 1,
                    'unlisted': 1,
                    'title': 'Sale Units [Sum]',
                    'category': 'metric',
                    'updated': '2016-04-27 16:57: 26',
                    'contributor': '/gdc/account/profile/876ec68f5630b38de65852ed5d6236ff'
                }
            }
        }
   ]
};
