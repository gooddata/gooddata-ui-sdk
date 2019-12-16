// (C) 2007-2019 GoodData Corporation
export const measuresDrillParams = `{
    "executionContext": {
        "measures": [
            {
                "localIdentifier": "aaEGaXAEgB7U",
                "definition": {
                    "measure": {
                        "item": {
                            "identifier": "aaEGaXAEgB7U"
                        }
                    }
                }
            },
            {
                "localIdentifier": "aabHeqImaK0d",
                "definition": {
                    "measure": {
                        "item": {
                            "identifier": "aabHeqImaK0d"
                        }
                    }
                }
            }
        ]
    },
    "drillContext": {
        "type": "table",
        "element": "cell",
        "columnIndex": 0,
        "rowIndex": 0,
        "row": [
            "4214352.77185",
            "1718851.14135"
        ],
        "intersection": [
            {
                "id": "aaEGaXAEgB7U",
                "title": "$ Franchise Fees",
                "header": {
                    "uri": "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/6685",
                    "identifier": "aaEGaXAEgB7U"
                }
            }
        ]
    }
}`;

export const rowAttributesDrillParams = `{
    "executionContext": {
        "attributes": [
            {
                "displayForm": {
                    "identifier": "label.restaurantlocation.locationstate"
                },
                "localIdentifier": "label.restaurantlocation.locationstate"
            },
            {
                "displayForm": {
                    "identifier": "label.restaurantlocation.locationname"
                },
                "localIdentifier": "label.restaurantlocation.locationname"
            },
            {
                "displayForm": {
                    "identifier": "label.menuitem.menucategory"
                },
                "localIdentifier": "label.menuitem.menucategory"
            }
        ]
    },
    "drillContext": {
        "type": "table",
        "element": "cell",
        "columnIndex": 2,
        "rowIndex": 0,
        "row": [
            {
                "id": "6340109",
                "name": "Alabama"
            },
            {
                "id": "6340107",
                "name": "Montgomery"
            },
            {
                "id": "6338473",
                "name": "Alcoholic Beverages"
            }
        ],
        "intersection": [
            {
                "id": "label.menuitem.menucategory",
                "title": "Menu Category",
                "header": {
                    "uri": "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2188",
                    "identifier": "label.menuitem.menucategory"
                }
            },
            {
                "id": "6338473",
                "title": "Alcoholic Beverages",
                "header": {
                    "uri": "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2187/elements?id=6338473",
                    "identifier": ""
                }
            }
        ]
    }
}`;

export const columnAndRowAttributesDrillParams = `{
    "executionContext": {
        "attributes": [
            {
                "displayForm": {
                    "identifier": "label.restaurantlocation.locationstate"
                },
                "localIdentifier": "label.restaurantlocation.locationstate"
            },
            {
                "displayForm": {
                    "identifier": "label.restaurantlocation.locationname"
                },
                "localIdentifier": "label.restaurantlocation.locationname"
            },
            {
                "displayForm": {
                    "identifier": "label.menuitem.menucategory"
                },
                "localIdentifier": "label.menuitem.menucategory"
            },
            {
                "displayForm": {
                    "identifier": "date.aam81lMifn6q"
                },
                "localIdentifier": "date.aam81lMifn6q"
            },
            {
                "displayForm": {
                    "identifier": "date.abm81lMifn6q"
                },
                "localIdentifier": "date.abm81lMifn6q"
            }
        ]
    },
    "drillContext": {
        "type": "table",
        "element": "cell",
        "columnIndex": 0,
        "rowIndex": 5,
        "row": [
            {
                "id": "6340116",
                "name": "California"
            },
            {
                "id": "6340114",
                "name": "Daly City"
            },
            {
                "id": "6338473",
                "name": "Alcoholic Beverages"
            }
        ],
        "intersection": [
            {
                "id": "label.restaurantlocation.locationstate",
                "title": "Location State",
                "header": {
                    "uri": "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2211",
                    "identifier": "label.restaurantlocation.locationstate"
                }
            },
            {
                "id": "6340116",
                "title": "California",
                "header": {
                    "uri": "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2210/elements?id=6340116",
                    "identifier": ""
                }
            }
        ]
    }
}`;

export const measuresColumnAndRowAttributesDrillParams = `{
    "executionContext": {
        "measures": [
            {
                "localIdentifier": "aaEGaXAEgB7U",
                "definition": {
                    "measure": {
                        "item": {
                            "identifier": "aaEGaXAEgB7U"
                        }
                    }
                }
            },
            {
                "localIdentifier": "aabHeqImaK0d",
                "definition": {
                    "measure": {
                        "item": {
                            "identifier": "aabHeqImaK0d"
                        }
                    }
                }
            }
        ],
        "attributes": [
            {
                "displayForm": {
                    "identifier": "label.restaurantlocation.locationstate"
                },
                "localIdentifier": "label.restaurantlocation.locationstate"
            },
            {
                "displayForm": {
                    "identifier": "label.restaurantlocation.locationname"
                },
                "localIdentifier": "label.restaurantlocation.locationname"
            },
            {
                "displayForm": {
                    "identifier": "label.menuitem.menucategory"
                },
                "localIdentifier": "label.menuitem.menucategory"
            },
            {
                "displayForm": {
                    "identifier": "date.aam81lMifn6q"
                },
                "localIdentifier": "date.aam81lMifn6q"
            },
            {
                "displayForm": {
                    "identifier": "date.abm81lMifn6q"
                },
                "localIdentifier": "date.abm81lMifn6q"
            }
        ]
    },
    "drillContext": {
        "type": "table",
        "element": "cell",
        "columnIndex": 3,
        "rowIndex": 0,
        "row": [
            {
                "id": "6340109",
                "name": "Alabama"
            },
            {
                "id": "6340107",
                "name": "Montgomery"
            },
            {
                "id": "6338473",
                "name": "Alcoholic Beverages"
            },
            "71475.721",
            "12960.591",
            "70335.1315",
            "12490.9365",
            "69797.40025",
            "12269.51775",
            "70856.38975",
            "12705.57225",
            "69517.6525",
            "12154.3275",
            "71090.32675",
            "12801.89925",
            "70836.72925",
            "12697.47675",
            "67720.9735",
            "11414.5185",
            "70967.18725",
            "12751.19475",
            "70537.984",
            "12574.464",
            "70519.38175",
            "12566.80425",
            "63811.19025",
            "9804.60775"
        ],
        "intersection": [
            {
                "id": "1",
                "title": "Q1",
                "header": {
                    "uri": "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2009/elements?id=1",
                    "identifier": ""
                }
            },
            {
                "id": "date.aam81lMifn6q",
                "title": "Quarter (Date)",
                "header": {
                    "uri": "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2011",
                    "identifier": "date.aam81lMifn6q"
                }
            },
            {
                "id": "1",
                "title": "Jan",
                "header": {
                    "uri": "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2071/elements?id=1",
                    "identifier": ""
                }
            },
            {
                "id": "date.abm81lMifn6q",
                "title": "Month (Date)",
                "header": {
                    "uri": "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2073",
                    "identifier": "date.abm81lMifn6q"
                }
            },
            {
                "id": "aaEGaXAEgB7U",
                "title": "$ Franchise Fees",
                "header": {
                    "uri": "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/6685",
                    "identifier": "aaEGaXAEgB7U"
                }
            }
        ]
    }
}`;

export const measuresAndColumnAttributesDrillParams = `{
    "executionContext": {
        "measures": [
            {
                "localIdentifier": "aaEGaXAEgB7U",
                "definition": {
                    "measure": {
                        "item": {
                            "identifier": "aaEGaXAEgB7U"
                        }
                    }
                }
            },
            {
                "localIdentifier": "aabHeqImaK0d",
                "definition": {
                    "measure": {
                        "item": {
                            "identifier": "aabHeqImaK0d"
                        }
                    }
                }
            }
        ],
        "attributes": [
            {
                "displayForm": {
                    "identifier": "date.aam81lMifn6q"
                },
                "localIdentifier": "date.aam81lMifn6q"
            },
            {
                "displayForm": {
                    "identifier": "date.abm81lMifn6q"
                },
                "localIdentifier": "date.abm81lMifn6q"
            }
        ]
    },
    "drillContext": {
        "type": "table",
        "element": "cell",
        "columnIndex": 1,
        "rowIndex": 0,
        "row": [
            "406006.57195",
            "150708.58845",
            "395682.95305",
            "146457.68655",
            "388771.3336",
            "143611.7256",
            "403377.8356",
            "149626.1676",
            "384490.2151",
            "141848.9121",
            "402776.8822",
            "149378.7162",
            "399076.77865",
            "147855.14415",
            "366945.56485",
            "134624.64435",
            "399730.40485",
            "148124.28435",
            "394810.0141",
            "146098.2411",
            "396026.614",
            "146599.194",
            "316657.6039",
            "113917.8369"
        ],
        "intersection": [
            {
                "id": "1",
                "title": "Q1",
                "header": {
                    "uri": "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2009/elements?id=1",
                    "identifier": ""
                }
            },
            {
                "id": "date.aam81lMifn6q",
                "title": "Quarter (Date)",
                "header": {
                    "uri": "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2011",
                    "identifier": "date.aam81lMifn6q"
                }
            },
            {
                "id": "1",
                "title": "Jan",
                "header": {
                    "uri": "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2071/elements?id=1",
                    "identifier": ""
                }
            },
            {
                "id": "date.abm81lMifn6q",
                "title": "Month (Date)",
                "header": {
                    "uri": "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2073",
                    "identifier": "date.abm81lMifn6q"
                }
            },
            {
                "id": "aabHeqImaK0d",
                "title": "$ Franchise Fees (Ad Royalty)",
                "header": {
                    "uri": "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/6694",
                    "identifier": "aabHeqImaK0d"
                }
            }
        ]
    }
}`;

export const measuresAndRowAttributesDrillParams = `{
    "executionContext": {
        "measures": [
            {
                "localIdentifier": "aaEGaXAEgB7U",
                "definition": {
                    "measure": {
                        "item": {
                            "identifier": "aaEGaXAEgB7U"
                        }
                    }
                }
            },
            {
                "localIdentifier": "aabHeqImaK0d",
                "definition": {
                    "measure": {
                        "item": {
                            "identifier": "aabHeqImaK0d"
                        }
                    }
                }
            }
        ],
        "attributes": [
            {
                "displayForm": {
                    "identifier": "label.restaurantlocation.locationstate"
                },
                "localIdentifier": "label.restaurantlocation.locationstate"
            },
            {
                "displayForm": {
                    "identifier": "label.restaurantlocation.locationname"
                },
                "localIdentifier": "label.restaurantlocation.locationname"
            },
            {
                "displayForm": {
                    "identifier": "label.menuitem.menucategory"
                },
                "localIdentifier": "label.menuitem.menucategory"
            }
        ]
    },
    "drillContext": {
        "type": "table",
        "element": "cell",
        "columnIndex": 0,
        "rowIndex": 5,
        "row": [
            {
                "id": "6340116",
                "name": "California"
            },
            {
                "id": "6340121",
                "name": "Highland Village"
            },
            {
                "id": "6338473",
                "name": "Alcoholic Beverages"
            },
            "176265.71085",
            "56109.41035"
        ],
        "intersection": [
            {
                "id": "label.restaurantlocation.locationstate",
                "title": "Location State",
                "header": {
                    "uri": "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2211",
                    "identifier": "label.restaurantlocation.locationstate"
                }
            },
            {
                "id": "6340116",
                "title": "California",
                "header": {
                    "uri": "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2210/elements?id=6340116",
                    "identifier": ""
                }
            }
        ]
    }
}`;

export const metricOnDrillExtendedParams = `{
    "executionContext": {
        "measures": [
            {
                "localIdentifier": "aaEGaXAEgB7U",
                "definition": {
                    "measure": {
                        "item": {
                            "identifier": "aaEGaXAEgB7U"
                        }
                    }
                }
            },
            {
                "localIdentifier": "aabHeqImaK0d",
                "definition": {
                    "measure": {
                        "item": {
                            "identifier": "aabHeqImaK0d"
                        }
                    }
                }
            }
        ],
        "attributes": [
            {
                "displayForm": {
                    "identifier": "label.restaurantlocation.locationstate"
                },
                "localIdentifier": "label.restaurantlocation.locationstate"
            },
            {
                "displayForm": {
                    "identifier": "label.restaurantlocation.locationname"
                },
                "localIdentifier": "label.restaurantlocation.locationname"
            },
            {
                "displayForm": {
                    "identifier": "label.menuitem.menucategory"
                },
                "localIdentifier": "label.menuitem.menucategory"
            }
        ]
    },
    "drillContext": {
        "type": "table",
        "element": "cell",
        "columnIndex": 3,
        "rowIndex": 0,
        "row": [
            {
                "id": "6340109",
                "name": "Alabama"
            },
            {
                "id": "6340107",
                "name": "Montgomery"
            },
            {
                "id": "6338473",
                "name": "Alcoholic Beverages"
            },
            "397466.06775",
            "147191.91025"
        ],
        "intersection": [
            {
                "header": {
                    "measureHeaderItem": {
                        "name": "$ Franchise Fees",
                        "format": "[>=0]$#,##0;[<0]-$#,##0",
                        "localIdentifier": "aaEGaXAEgB7U",
                        "uri": "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/6685",
                        "identifier": "aaEGaXAEgB7U"
                    }
                }
            },
            {
                "header": {
                    "attributeHeaderItem": {
                        "name": "Alabama",
                        "uri": "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2210/elements?id=6340109"
                    },
                    "attributeHeader": {
                        "name": "Location State",
                        "localIdentifier": "label.restaurantlocation.locationstate",
                        "uri": "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2211",
                        "identifier": "label.restaurantlocation.locationstate",
                        "formOf": {
                            "name": "Location State",
                            "uri": "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2210",
                            "identifier": "attr.restaurantlocation.locationstate"
                        }
                    }
                }
            },
            {
                "header": {
                    "attributeHeaderItem": {
                        "name": "Montgomery",
                        "uri": "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2204/elements?id=6340107"
                    },
                    "attributeHeader": {
                        "name": "Location Name",
                        "localIdentifier": "label.restaurantlocation.locationname",
                        "uri": "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2205",
                        "identifier": "label.restaurantlocation.locationname",
                        "formOf": {
                            "name": "Location Name",
                            "uri": "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2204",
                            "identifier": "attr.restaurantlocation.locationname"
                        }
                    }
                }
            },
            {
                "header": {
                    "attributeHeaderItem": {
                        "name": "Alcoholic Beverages",
                        "uri": "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2187/elements?id=6338473"
                    },
                    "attributeHeader": {
                        "name": "Menu Category",
                        "localIdentifier": "label.menuitem.menucategory",
                        "uri": "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2188",
                        "identifier": "label.menuitem.menucategory",
                        "formOf": {
                            "name": "Menu Category",
                            "uri": "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2187",
                            "identifier": "attr.menuitem.menucategory"
                        }
                    }
                }
            }
        ]
    }
}`;

export const attributeOnDrillExtendedParams = `{
    "executionContext": {
        "measures": [
            {
                "localIdentifier": "aaEGaXAEgB7U",
                "definition": {
                    "measure": {
                        "item": {
                            "identifier": "aaEGaXAEgB7U"
                        }
                    }
                }
            },
            {
                "localIdentifier": "aabHeqImaK0d",
                "definition": {
                    "measure": {
                        "item": {
                            "identifier": "aabHeqImaK0d"
                        }
                    }
                }
            }
        ],
        "attributes": [
            {
                "displayForm": {
                    "identifier": "label.restaurantlocation.locationstate"
                },
                "localIdentifier": "label.restaurantlocation.locationstate"
            },
            {
                "displayForm": {
                    "identifier": "label.restaurantlocation.locationname"
                },
                "localIdentifier": "label.restaurantlocation.locationname"
            },
            {
                "displayForm": {
                    "identifier": "label.menuitem.menucategory"
                },
                "localIdentifier": "label.menuitem.menucategory"
            }
        ]
    },
    "drillContext": {
        "type": "table",
        "element": "cell",
        "columnIndex": 2,
        "rowIndex": 0,
        "row": [
            {
                "id": "6340109",
                "name": "Alabama"
            },
            {
                "id": "6340107",
                "name": "Montgomery"
            },
            {
                "id": "6338473",
                "name": "Alcoholic Beverages"
            },
            "397466.06775",
            "147191.91025"
        ],
        "intersection": [
            {
                "header": {
                    "attributeHeaderItem": {
                        "name": "Alcoholic Beverages",
                        "uri": "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2187/elements?id=6338473"
                    },
                    "attributeHeader": {
                        "name": "Menu Category",
                        "localIdentifier": "label.menuitem.menucategory",
                        "uri": "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2188",
                        "identifier": "label.menuitem.menucategory",
                        "formOf": {
                            "name": "Menu Category",
                            "uri": "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2187",
                            "identifier": "attr.menuitem.menucategory"
                        }
                    }
                }
            }
        ]
    }
}`;
