// (C) 2007-2018 GoodData Corporation
import { AFM, Execution } from '@gooddata/typings';
import { IMappingHeader } from '../../interfaces/MappingHeader';

export const afmWithDerived: AFM.IAfm = {
    measures: [
        {
            definition: {
                measure: {
                    item: {
                        uri: '/measureHeaderItem.uri',
                        identifier: 'measureHeaderItem.identifier'
                    }
                }
            },
            localIdentifier: 'measureHeaderItem.localIdentifier',
            format: '#,##0.00',
            alias: 'measureHeaderItem.alias'
        },
        {
            localIdentifier: 'measureHeaderItem.PP.localIdentifier',
            definition: {
                previousPeriodMeasure: {
                    measureIdentifier: 'measureHeaderItem.localIdentifier',
                    dateDataSets: [{
                        dataSet: {
                            uri: '/datasetUri'
                        },
                        periodsAgo: 1
                    }]
                }
            }
        },
        {
            localIdentifier: 'measureHeaderItem.SP.localIdentifier',
            definition: {
                popMeasure: {
                    measureIdentifier: 'measureHeaderItem.localIdentifier',
                    popAttribute: {
                        uri: '/measureHeaderItem.uri'
                    }
                }
            }
        }
    ]
};

export const measureHeaderItem: IMappingHeader = {
    measureHeaderItem: {
        uri: '/measureHeaderItem.uri',
        localIdentifier: 'measureHeaderItem.localIdentifier',
        identifier: 'measureHeaderItem.identifier',
        name: 'measureHeaderItem.name',
        format: '#,##0.00'
    }
};

export const measureHeaderItemWithoutUriAndIndentifier: IMappingHeader = {
    measureHeaderItem: {
        localIdentifier: 'measureHeaderItem.localIdentifier',
        name: 'measureHeaderItem.name',
        format: '#,##0.00'
    }
};

export const measureHeaderItemPP: IMappingHeader = {
    measureHeaderItem: {
        uri: '/measureHeaderItem.PP.uri',
        localIdentifier: 'measureHeaderItem.PP.localIdentifier',
        name: 'measureHeaderItem.PP.name',
        format: '#,##0.00'
    }
};

export const measureHeaderItemSP: IMappingHeader = {
    measureHeaderItem: {
        uri: '/measureHeaderItem.SP.uri',
        localIdentifier: 'measureHeaderItem.SP.localIdentifier',
        name: 'measureHeaderItem.SP.name',
        format: '#,##0.00'
    }
};

export const attributeHeader: IMappingHeader = {
    attributeHeader: {
        uri: '/attributeHeader.uri',
        identifier: 'attributeHeader.identifier',
        localIdentifier: 'attributeHeader.localIdentifier',
        name: 'attributeHeader.name',
        format: '',
        formOf: {
            uri: '/attributeHeader.element.uri',
            identifier: 'attributeHeader.element.identifier',
            name: 'attributeHeader.element.name'
        }
    }
};

export const attributeHeaderItem: Execution.IResultAttributeHeaderItem = {
    attributeHeaderItem: {
        uri: '/attributeHeaderItem.uri',
        name: 'attributeHeaderItem.name'
    }
};

export const afmWithAmMeasures: AFM.IAfm = {
    measures: [
        {
            definition: {
                measure: {
                    item: {
                        uri: '/m1.uri',
                        identifier: 'm1.identifier'
                    }
                }
            },
            localIdentifier: 'm1'
        },
        {
            definition: {
                measure: {
                    item: {
                        uri: '/m2.uri',
                        identifier: 'm2.identifier'
                    }
                }
            },
            localIdentifier: 'm2'
        },
        {
            definition: {
                arithmeticMeasure: {
                    measureIdentifiers: ['m1', 'm2'],
                    operator: 'sum'
                }
            },
            localIdentifier: 'am1'
        },
        {
            definition: {
                arithmeticMeasure: {
                    measureIdentifiers: ['m1', 'm1'],
                    operator: 'multiplication'
                }
            },
            localIdentifier: 'am2'
        },
        {
            definition: {
                arithmeticMeasure: {
                    measureIdentifiers: ['am1', 'am2'],
                    operator: 'sum'
                }
            },
            localIdentifier: 'am3'
        }
    ]
};

export const amMeasureHeaderItems = {
    m1: {
        measureHeaderItem: {
            localIdentifier: 'm1',
            name: 'M1',
            format: '#,##0.00'
        }
    },
    m2: {
        measureHeaderItem: {
            localIdentifier: 'm2',
            name: 'M2',
            format: '#,##0.00'
        }
    },
    am1: {
        measureHeaderItem: {
            localIdentifier: 'am1',
            name: 'AM1',
            format: '#,##0.00'
        }
    },
    am2: {
        measureHeaderItem: {
            localIdentifier: 'am2',
            name: 'AM2',
            format: '#,##0.00'
        }
    },
    am3: {
        measureHeaderItem: {
            localIdentifier: 'am3',
            name: 'AM3',
            format: '#,##0.00'
        }
    }
};
