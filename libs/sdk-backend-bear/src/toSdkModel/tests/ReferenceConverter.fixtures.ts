// (C) 2019 GoodData Corporation
import { GdcVisualizationObject } from "@gooddata/gd-bear-model";

// tslint:disable:max-line-length

const createFixture = (
    properties: string,
    references?: GdcVisualizationObject.IReferenceItems,
): GdcVisualizationObject.IVisualizationObject => {
    const referenceProp = references ? { references } : undefined;
    return {
        content: {
            buckets: [],
            visualizationClass: {
                uri: "/gdc/md/foo_project/obj/8705",
            },
            properties,
            ...referenceProp,
        },
        meta: {
            title: "Foo",
        },
    };
};

// ColorMapping fixtures

export const colorMappingWithUrisAndExistingReferences = createFixture(
    '{"controls":{"colorMapping":[{"color":{"type":"guid","value":"guid2"},"id":"/gdc/md/foo_project/obj/2210/elements?id=4436534"},{"color":{"type":"guid","value":"guid2"},"id":"/gdc/md/foo_project/obj/2210/elements?id=6340112"}],"zzCanary":true}}',
    {
        "5b7eff1441b24a40bce96d5698b009d3": "/gdc/md/foo_project/obj/2210/elements?id=4436534",
        "761e07c106d04474a0a509721f9a7fb5": "/gdc/md/foo_project/obj/2210/elements?id=6340112",
    },
);

export const colorMappingWithUrisAndSurplusReferences = createFixture(
    '{"controls":{"colorMapping":[{"id":"/gdc/md/foo_project/obj/2210/elements?id=4436534","color":{"type":"guid","value":"guid2"}},{"id":"/gdc/md/foo_project/obj/2210/elements?id=6340112","color":{"type":"guid","value":"guid2"}}],"zzCanary":true}}',
    {
        "5b7eff1441b24a40bce96d5698b009d3": "/gdc/md/foo_project/obj/2210/elements?id=4436534",
        "761e07c106d04474a0a509721f9a7fb5": "/gdc/md/foo_project/obj/2210/elements?id=6340112",
        unused: "/gdc/md/unused",
    },
);

export const colorMappingWithUrisAndNoReferences = createFixture(
    '{"controls":{"colorMapping":[{"id":"/gdc/md/foo_project/obj/2210/elements?id=4436534","color":{"type":"guid","value":"guid2"}},{"id":"/gdc/md/foo_project/obj/2210/elements?id=6340112","color":{"type":"guid","value":"guid2"}}],"zzCanary":true}}',
);

export const colorMappingWithReferencesAndExistingReferences = createFixture(
    '{"controls":{"colorMapping":[{"color":{"type":"guid","value":"guid2"},"id":"5b7eff1441b24a40bce96d5698b009d3"},{"color":{"type":"guid","value":"guid2"},"id":"761e07c106d04474a0a509721f9a7fb5"}],"zzCanary":true}}',
    {
        "5b7eff1441b24a40bce96d5698b009d3": "/gdc/md/foo_project/obj/2210/elements?id=4436534",
        "761e07c106d04474a0a509721f9a7fb5": "/gdc/md/foo_project/obj/2210/elements?id=6340112",
    },
);

export const colorMappingWithReferencesAndNewReferences = createFixture(
    '{"controls":{"colorMapping":[{"color":{"type":"guid","value":"guid2"},"id":"id_0"},{"color":{"type":"guid","value":"guid2"},"id":"id_1"}],"zzCanary":true}}',
    {
        id_0: "/gdc/md/foo_project/obj/2210/elements?id=4436534",
        id_1: "/gdc/md/foo_project/obj/2210/elements?id=6340112",
    },
);

export const colorMappingWithReferencesAndEmptyReferences = createFixture(
    '{"controls":{"colorMapping":[{"color":{"type":"guid","value":"guid2"},"id":"measureId1"},{"color":{"type":"guid","value":"guid2"},"id":"measureId2"}],"zzCanary":true}}',
    {},
);

export const colorMappingWithReferencesAndNoReferences = createFixture(
    '{"controls":{"colorMapping":[{"color":{"type":"guid","value":"guid2"},"id":"measureId1"},{"color":{"type":"guid","value":"guid2"},"id":"measureId2"}],"zzCanary":true}}',
);

export const colorMappingWithReferencesAndMismatchingReferences = createFixture(
    '{"controls":{"colorMapping":[{"color":{"type":"guid","value":"guid2"},"id":"id_0"},{"color":{"type":"guid","value":"guid2"},"id":"id_1"}],"zzCanary":true}}',
    {
        invalid: "/gdc/md/foo_project/obj/2210/elements?id=4436534",
        id_1: "/gdc/md/foo_project/obj/2210/elements?id=6340112",
    },
);

// Sorting fixtures

export const sortLocatorsWithUrisAndNoReferences = createFixture(
    '{"sortItems":[{"measureSortItem":{"direction":"desc","locators":[{"attributeLocatorItem":{"attributeIdentifier":"d9f598def1e34c7aa1696f50eada43c4","element":"/gdc/md/foo_project/obj/2187/elements?id=6338473"}},{"measureLocatorItem":{"measureIdentifier":"82d062156ee74757a2f820a05744452c"}}]}}]}',
);

export const sortLocatorsWithUrisAndExistingReferences = createFixture(
    '{"sortItems":[{"measureSortItem":{"direction":"desc","locators":[{"attributeLocatorItem":{"attributeIdentifier":"d9f598def1e34c7aa1696f50eada43c4","element":"/gdc/md/foo_project/obj/2187/elements?id=6338473"}},{"measureLocatorItem":{"measureIdentifier":"82d062156ee74757a2f820a05744452c"}}]}}]}',
    {
        id_0: "/gdc/md/foo_project/obj/2187/elements?id=6338473",
    },
);

export const sortLocatorsWithReferencesAndNewReferences = createFixture(
    '{"sortItems":[{"measureSortItem":{"direction":"desc","locators":[{"attributeLocatorItem":{"attributeIdentifier":"d9f598def1e34c7aa1696f50eada43c4","element":"id_0"}},{"measureLocatorItem":{"measureIdentifier":"82d062156ee74757a2f820a05744452c"}}]}}]}',
    {
        id_0: "/gdc/md/foo_project/obj/2187/elements?id=6338473",
    },
);
