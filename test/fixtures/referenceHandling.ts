// (C) 2007-2018 GoodData Corporation
import { VisualizationObject } from '@gooddata/typings';

// tslint:disable:max-line-length

const createColorMappingFixture = (
    properties: string, references?: VisualizationObject.IReferenceItems
): VisualizationObject.IVisualizationObject => {
    const referenceProp = references ? { references } : undefined;
    return {
        content: {
            buckets: [
                {
                    localIdentifier: 'measures',
                    items: [
                        {
                            measure: {
                                localIdentifier: 'efef471ca63743ebaec1f0784219344d',
                                definition: {
                                    measureDefinition: {
                                        item: {
                                            uri: '/gdc/md/kytra720hke4d84e8ozohoz7uycn53mi/obj/2341'
                                        }
                                    }
                                },
                                title: '# Checks'
                            }
                        }
                    ]
                },
                {
                    localIdentifier: 'view',
                    items: [
                        {
                            visualizationAttribute: {
                                localIdentifier: '86257fdb99d64bbfb762f3faa1c15580',
                                displayForm: {
                                    uri: '/gdc/md/kytra720hke4d84e8ozohoz7uycn53mi/obj/2209'
                                }
                            }
                        }
                    ]
                },
                {
                    localIdentifier: 'stack',
                    items: [
                        {
                            visualizationAttribute: {
                                localIdentifier: '64e5af9a21f54b0f9a87d65148a3a78d',
                                displayForm: {
                                    uri: '/gdc/md/kytra720hke4d84e8ozohoz7uycn53mi/obj/2211'
                                }
                            }
                        }
                    ]
                }
            ],
            visualizationClass: {
                uri: '/gdc/md/kytra720hke4d84e8ozohoz7uycn53mi/obj/8706'
            },
            properties,
            ...referenceProp
        },
        meta: {
            summary: '',
            identifier: 'aabiyT4CehGr',
            author: '/gdc/account/profile/4d3da5c4452c6948e790c2a1e3772dc3',
            uri: '/gdc/md/kytra720hke4d84e8ozohoz7uycn53mi/obj/8900',
            title: 'DHO_test2',
            tags: '',
            contributor: '/gdc/account/profile/4d3da5c4452c6948e790c2a1e3772dc3',
            category: 'visualizationObject'
        }
    };
};

export const colorMappingWithUrisAndExistingReferences = createColorMappingFixture(
    '{"controls":{"colorMapping":[{"color":{"type":"guid","value":"guid2"},"id":"/gdc/md/kytra720hke4d84e8ozohoz7uycn53mi/obj/2210/elements?id=4436534"},{"color":{"type":"guid","value":"guid2"},"id":"/gdc/md/kytra720hke4d84e8ozohoz7uycn53mi/obj/2210/elements?id=6340112"}],"zzCanary":true}}',
    {
        '5b7eff1441b24a40bce96d5698b009d3': '/gdc/md/kytra720hke4d84e8ozohoz7uycn53mi/obj/2210/elements?id=4436534',
        '761e07c106d04474a0a509721f9a7fb5': '/gdc/md/kytra720hke4d84e8ozohoz7uycn53mi/obj/2210/elements?id=6340112'
    }
);

export const colorMappingWithUrisAndSurplusReferences = createColorMappingFixture(
    '{"controls":{"colorMapping":[{"id":"/gdc/md/kytra720hke4d84e8ozohoz7uycn53mi/obj/2210/elements?id=4436534","color":{"type":"guid","value":"guid2"}},{"id":"/gdc/md/kytra720hke4d84e8ozohoz7uycn53mi/obj/2210/elements?id=6340112","color":{"type":"guid","value":"guid2"}}],"zzCanary":true}}',
    {
        '5b7eff1441b24a40bce96d5698b009d3': '/gdc/md/kytra720hke4d84e8ozohoz7uycn53mi/obj/2210/elements?id=4436534',
        '761e07c106d04474a0a509721f9a7fb5': '/gdc/md/kytra720hke4d84e8ozohoz7uycn53mi/obj/2210/elements?id=6340112',
        'unused': '/gdc/md/unused'
    }
);

export const colorMappingWithUrisAndNoReferences = createColorMappingFixture(
    '{"controls":{"colorMapping":[{"id":"/gdc/md/kytra720hke4d84e8ozohoz7uycn53mi/obj/2210/elements?id=4436534","color":{"type":"guid","value":"guid2"}},{"id":"/gdc/md/kytra720hke4d84e8ozohoz7uycn53mi/obj/2210/elements?id=6340112","color":{"type":"guid","value":"guid2"}}],"zzCanary":true}}'
);

export const colorMappingWithReferencesAndExistingReferences = createColorMappingFixture(
    '{"controls":{"colorMapping":[{"color":{"type":"guid","value":"guid2"},"id":"5b7eff1441b24a40bce96d5698b009d3"},{"color":{"type":"guid","value":"guid2"},"id":"761e07c106d04474a0a509721f9a7fb5"}],"zzCanary":true}}',
    {
        '5b7eff1441b24a40bce96d5698b009d3': '/gdc/md/kytra720hke4d84e8ozohoz7uycn53mi/obj/2210/elements?id=4436534',
        '761e07c106d04474a0a509721f9a7fb5': '/gdc/md/kytra720hke4d84e8ozohoz7uycn53mi/obj/2210/elements?id=6340112'
    }
);

export const colorMappingWithReferencesAndNewReferences = createColorMappingFixture(
    '{"controls":{"colorMapping":[{"color":{"type":"guid","value":"guid2"},"id":"id_0"},{"color":{"type":"guid","value":"guid2"},"id":"id_1"}],"zzCanary":true}}',
    {
        id_0: '/gdc/md/kytra720hke4d84e8ozohoz7uycn53mi/obj/2210/elements?id=4436534',
        id_1: '/gdc/md/kytra720hke4d84e8ozohoz7uycn53mi/obj/2210/elements?id=6340112'
    }
);

export const colorMappingWithReferencesAndEmptyReferences = createColorMappingFixture(
    '{"controls":{"colorMapping":[{"color":{"type":"guid","value":"guid2"},"id":"measureId1"},{"color":{"type":"guid","value":"guid2"},"id":"measureId2"}],"zzCanary":true}}',
    {}
);

export const colorMappingWithReferencesAndNoReferences = createColorMappingFixture(
    '{"controls":{"colorMapping":[{"color":{"type":"guid","value":"guid2"},"id":"measureId1"},{"color":{"type":"guid","value":"guid2"},"id":"measureId2"}],"zzCanary":true}}'
);

export const colorMappingWithReferencesAndMismatchingReferences = createColorMappingFixture(
    '{"controls":{"colorMapping":[{"color":{"type":"guid","value":"guid2"},"id":"id_0"},{"color":{"type":"guid","value":"guid2"},"id":"id_1"}],"zzCanary":true}}',
    {
        invalid: '/gdc/md/kytra720hke4d84e8ozohoz7uycn53mi/obj/2210/elements?id=4436534',
        id_1: '/gdc/md/kytra720hke4d84e8ozohoz7uycn53mi/obj/2210/elements?id=6340112'
    }
);

const createSortingFixture = (
    properties: string, references?: VisualizationObject.IReferenceItems
): VisualizationObject.IVisualizationObject => {
    const referenceProp = references ? { references } : undefined;
    return {
        content: {
            buckets: [
                {
                    localIdentifier: 'measures',
                    items: [
                        {
                            measure: {
                                localIdentifier: '0bc1908c348341cba05547fed4aa5f50',
                                title: '$ Franchise Fees',
                                definition: {
                                    measureDefinition: {
                                        item: {
                                            uri: '/gdc/md/kytra720hke4d84e8ozohoz7uycn53mi/obj/6685'
                                        }
                                    }
                                }
                            }
                        },
                        {
                            measure: {
                                localIdentifier: '82d062156ee74757a2f820a05744452c',
                                title: '# Checks',
                                definition: {
                                    measureDefinition: {
                                        item: {
                                            uri: '/gdc/md/kytra720hke4d84e8ozohoz7uycn53mi/obj/2341'
                                        }
                                    }
                                }
                            }
                        }
                    ]
                },
                {
                    localIdentifier: 'attribute',
                    items: [
                        {
                            visualizationAttribute: {
                                localIdentifier: '8ec91d5e7b3141d198b39b3c069a8d91',
                                displayForm: {
                                    uri: '/gdc/md/kytra720hke4d84e8ozohoz7uycn53mi/obj/2211'
                                }
                            }
                        }
                    ]
                },
                {
                    localIdentifier: 'columns',
                    items: [
                        {
                            visualizationAttribute: {
                                localIdentifier: 'd9f598def1e34c7aa1696f50eada43c4',
                                displayForm: {
                                    uri: '/gdc/md/kytra720hke4d84e8ozohoz7uycn53mi/obj/2188'
                                }
                            }
                        }
                    ]
                }
            ],
            filters: [
                {
                    negativeAttributeFilter: {
                        notIn: [],
                        displayForm: {
                            uri: '/gdc/md/kytra720hke4d84e8ozohoz7uycn53mi/obj/2211'
                        }
                    }
                }
            ],
            visualizationClass: {
                uri: '/gdc/md/kytra720hke4d84e8ozohoz7uycn53mi/obj/8705'
            },
            properties,
            ...referenceProp
        },
        meta: {
            category: 'visualizationObject',
            contributor: '/gdc/account/profile/4d3da5c4452c6948e790c2a1e3772dc3',
            identifier: 'aah24doLdkfQ',
            tags: '',
            title: 'DHO_test4',
            uri: '/gdc/md/kytra720hke4d84e8ozohoz7uycn53mi/obj/8937'
        }
    };
};

export const sortLocatorsWithUrisAndNoReferences = createSortingFixture(
    '{"sortItems":[{"measureSortItem":{"direction":"desc","locators":[{"attributeLocatorItem":{"attributeIdentifier":"d9f598def1e34c7aa1696f50eada43c4","element":"/gdc/md/kytra720hke4d84e8ozohoz7uycn53mi/obj/2187/elements?id=6338473"}},{"measureLocatorItem":{"measureIdentifier":"82d062156ee74757a2f820a05744452c"}}]}}]}'
);

export const sortLocatorsWithUrisAndExistingReferences = createSortingFixture(
    '{"sortItems":[{"measureSortItem":{"direction":"desc","locators":[{"attributeLocatorItem":{"attributeIdentifier":"d9f598def1e34c7aa1696f50eada43c4","element":"/gdc/md/kytra720hke4d84e8ozohoz7uycn53mi/obj/2187/elements?id=6338473"}},{"measureLocatorItem":{"measureIdentifier":"82d062156ee74757a2f820a05744452c"}}]}}]}',
    {
        id_0: '/gdc/md/kytra720hke4d84e8ozohoz7uycn53mi/obj/2187/elements?id=6338473'
    }
);

export const sortLocatorsWithReferencesAndNewReferences = createSortingFixture(
    '{"sortItems":[{"measureSortItem":{"direction":"desc","locators":[{"attributeLocatorItem":{"attributeIdentifier":"d9f598def1e34c7aa1696f50eada43c4","element":"id_0"}},{"measureLocatorItem":{"measureIdentifier":"82d062156ee74757a2f820a05744452c"}}]}}]}',
    {
        id_0: '/gdc/md/kytra720hke4d84e8ozohoz7uycn53mi/obj/2187/elements?id=6338473'
    }
);
