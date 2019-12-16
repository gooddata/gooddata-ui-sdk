// (C) 2019 GoodData Corporation
export const barOnDrillExtendedParams = `{
    "executionContext": {
        "measures": [
            {
                "localIdentifier": "m1",
                "definition": {
                    "measure": {
                        "item": {
                            "identifier": "aa7ulGyKhIE5"
                        }
                    }
                },
                "alias": "$ Total Sales",
                "format": "#,##0"
            }
        ],
        "attributes": [
            {
                "displayForm": {
                    "identifier": "label.restaurantlocation.locationresort"
                },
                "localIdentifier": "a1"
            }
        ]
    },
    "drillContext": {
        "type": "bar",
        "element": "bar",
        "intersection": [
            {
                "header": {
                    "measureHeaderItem": {
                        "name": "$ Total Sales",
                        "format": "#,##0",
                        "localIdentifier": "m1",
                        "uri": "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2352",
                        "identifier": "aa7ulGyKhIE5"
                    }
                }
            },
            {
                "header": {
                    "attributeHeaderItem": {
                        "name": "Hayward",
                        "uri": "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2206/elements?id=6340119"
                    },
                    "attributeHeader": {
                        "name": "Location Resort",
                        "localIdentifier": "a1",
                        "uri": "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2207",
                        "identifier": "label.restaurantlocation.locationresort",
                        "formOf": {
                            "name": "Location Resort",
                            "uri": "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2206",
                            "identifier": "attr.restaurantlocation.locationresort"
                        }
                    }
                }
            }
        ],
        "x": 4,
        "y": 8287671.44
    }
}`;

export const headlineOnDrillExtendedParams = `{
    "executionContext": {
        "measures": [
            {
                "localIdentifier": "m1",
                "definition": {
                    "measure": {
                        "item": {
                            "identifier": "aaEGaXAEgB7U"
                        }
                    }
                },
                "format": "#,##0"
            },
            {
                "localIdentifier": "m2",
                "definition": {
                    "measure": {
                        "item": {
                            "identifier": "aabHeqImaK0d"
                        }
                    }
                },
                "format": "#,##0"
            }
        ]
    },
    "drillContext": {
        "type": "headline",
        "element": "primaryValue",
        "value": "4214352.77185",
        "intersection": [
            {
                "header": {
                    "measureHeaderItem": {
                        "name": "$ Franchise Fees",
                        "format": "#,##0",
                        "localIdentifier": "m1",
                        "uri": "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/6685",
                        "identifier": "aaEGaXAEgB7U"
                    }
                }
            }
        ]
    }
}`;

export const visualizationOnDrillExtendedParams = `{
    "executionContext": {
        "measures": [
            {
                "localIdentifier": "adD3vGZzp774",
                "definition": {
                    "measure": {
                        "item": {
                            "uri": "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2352"
                        }
                    }
                },
                "alias": "$ Total Sales"
            }
        ],
        "attributes": [
            {
                "displayForm": {
                    "uri": "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2142"
                },
                "localIdentifier": "adE3vGZzp774"
            }
        ],
        "filters": [
            {
                "absoluteDateFilter": {
                    "dataSet": {
                        "uri": "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2180"
                    },
                    "from": "2016-01-01",
                    "to": "2016-03-31"
                }
            }
        ]
    },
    "drillContext": {
        "type": "column",
        "element": "bar",
        "intersection": [
            {
                "header": {
                    "measureHeaderItem": {
                        "name": "$ Total Sales",
                        "format": "[>=0]$#,##0;[<0]-$#,##0",
                        "localIdentifier": "adD3vGZzp774",
                        "uri": "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2352",
                        "identifier": "aa7ulGyKhIE5"
                    }
                }
            },
            {
                "header": {
                    "attributeHeaderItem": {
                        "name": "Jan 2016",
                        "uri": "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2140/elements?id=24193"
                    },
                    "attributeHeader": {
                        "name": "Short (Jan 2010) (Date)",
                        "localIdentifier": "adE3vGZzp774",
                        "uri": "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2142",
                        "identifier": "date.act81lMifn6q",
                        "formOf": {
                            "name": "Month/Year (Date)",
                            "uri": "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2140",
                            "identifier": "date.month"
                        }
                    }
                }
            }
        ],
        "x": 0,
        "y": 2707183.77
    }
}`;
