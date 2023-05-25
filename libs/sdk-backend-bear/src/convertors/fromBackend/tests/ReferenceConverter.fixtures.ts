// (C) 2019 GoodData Corporation
import { IConversionData } from "../ReferenceConverter.js";

// ColorMapping fixtures

export const colorMappingWithUrisAndExistingReferences: IConversionData = {
    properties: {
        controls: {
            colorMapping: [
                {
                    color: { type: "guid", value: "guid2" },
                    id: "/gdc/md/foo_project/obj/2210/elements?id=4436534",
                },
                {
                    color: { type: "guid", value: "guid2" },
                    id: "/gdc/md/foo_project/obj/2210/elements?id=6340112",
                },
            ],
            zzCanary: true,
        },
    },
    references: {
        "5b7eff1441b24a40bce96d5698b009d3": "/gdc/md/foo_project/obj/2210/elements?id=4436534",
        "761e07c106d04474a0a509721f9a7fb5": "/gdc/md/foo_project/obj/2210/elements?id=6340112",
    },
};

export const colorMappingWithUrisAndSurplusReferences: IConversionData = {
    properties: {
        controls: {
            colorMapping: [
                {
                    id: "/gdc/md/foo_project/obj/2210/elements?id=4436534",
                    color: { type: "guid", value: "guid2" },
                },
                {
                    id: "/gdc/md/foo_project/obj/2210/elements?id=6340112",
                    color: { type: "guid", value: "guid2" },
                },
            ],
            zzCanary: true,
        },
    },
    references: {
        "5b7eff1441b24a40bce96d5698b009d3": "/gdc/md/foo_project/obj/2210/elements?id=4436534",
        "761e07c106d04474a0a509721f9a7fb5": "/gdc/md/foo_project/obj/2210/elements?id=6340112",
        unused: "/gdc/md/unused",
    },
};

export const colorMappingWithUrisAndNoReferences: IConversionData = {
    properties: {
        controls: {
            colorMapping: [
                {
                    id: "/gdc/md/foo_project/obj/2210/elements?id=4436534",
                    color: { type: "guid", value: "guid2" },
                },
                {
                    id: "/gdc/md/foo_project/obj/2210/elements?id=6340112",
                    color: { type: "guid", value: "guid2" },
                },
            ],
            zzCanary: true,
        },
    },
    references: {},
};

export const colorMappingWithReferencesAndExistingReferences: IConversionData = {
    properties: {
        controls: {
            colorMapping: [
                { color: { type: "guid", value: "guid2" }, id: "5b7eff1441b24a40bce96d5698b009d3" },
                { color: { type: "guid", value: "guid2" }, id: "761e07c106d04474a0a509721f9a7fb5" },
            ],
            zzCanary: true,
        },
    },
    references: {
        "5b7eff1441b24a40bce96d5698b009d3": "/gdc/md/foo_project/obj/2210/elements?id=4436534",
        "761e07c106d04474a0a509721f9a7fb5": "/gdc/md/foo_project/obj/2210/elements?id=6340112",
    },
};

export const colorMappingWithReferencesAndNewReferences: IConversionData = {
    properties: {
        controls: {
            colorMapping: [
                { color: { type: "guid", value: "guid2" }, id: "id_0" },
                { color: { type: "guid", value: "guid2" }, id: "id_1" },
            ],
            zzCanary: true,
        },
    },
    references: {
        id_0: "/gdc/md/foo_project/obj/2210/elements?id=4436534",
        id_1: "/gdc/md/foo_project/obj/2210/elements?id=6340112",
    },
};

export const colorMappingWithReferencesAndEmptyReferences: IConversionData = {
    properties: {
        controls: {
            colorMapping: [
                { color: { type: "guid", value: "guid2" }, id: "measureId1" },
                { color: { type: "guid", value: "guid2" }, id: "measureId2" },
            ],
            zzCanary: true,
        },
    },
    references: {},
};

export const colorMappingWithReferencesAndNoReferences: IConversionData = {
    properties: {
        controls: {
            colorMapping: [
                { color: { type: "guid", value: "guid2" }, id: "measureId1" },
                { color: { type: "guid", value: "guid2" }, id: "measureId2" },
            ],
            zzCanary: true,
        },
    },
    references: {},
};

export const colorMappingWithReferencesAndMismatchingReferences: IConversionData = {
    properties: {
        controls: {
            colorMapping: [
                { color: { type: "guid", value: "guid2" }, id: "id_0" },
                { color: { type: "guid", value: "guid2" }, id: "id_1" },
            ],
            zzCanary: true,
        },
    },
    references: {
        invalid: "/gdc/md/foo_project/obj/2210/elements?id=4436534",
        id_1: "/gdc/md/foo_project/obj/2210/elements?id=6340112",
    },
};

// Sorting fixtures

export const sortLocatorsWithUrisAndNoReferences: IConversionData = {
    properties: {
        sortItems: [
            {
                measureSortItem: {
                    direction: "desc",
                    locators: [
                        {
                            attributeLocatorItem: {
                                attributeIdentifier: "d9f598def1e34c7aa1696f50eada43c4",
                                element: "/gdc/md/foo_project/obj/2187/elements?id=6338473",
                            },
                        },
                        { measureLocatorItem: { measureIdentifier: "82d062156ee74757a2f820a05744452c" } },
                    ],
                },
            },
        ],
    },
    references: {},
};

export const sortLocatorsWithUrisAndExistingReferences: IConversionData = {
    properties: {
        sortItems: [
            {
                measureSortItem: {
                    direction: "desc",
                    locators: [
                        {
                            attributeLocatorItem: {
                                attributeIdentifier: "d9f598def1e34c7aa1696f50eada43c4",
                                element: "/gdc/md/foo_project/obj/2187/elements?id=6338473",
                            },
                        },
                        { measureLocatorItem: { measureIdentifier: "82d062156ee74757a2f820a05744452c" } },
                    ],
                },
            },
        ],
    },
    references: {
        id_0: "/gdc/md/foo_project/obj/2187/elements?id=6338473",
    },
};

export const sortLocatorsWithReferencesAndNewReferences: IConversionData = {
    properties: {
        sortItems: [
            {
                measureSortItem: {
                    direction: "desc",
                    locators: [
                        {
                            attributeLocatorItem: {
                                attributeIdentifier: "d9f598def1e34c7aa1696f50eada43c4",
                                element: "id_0",
                            },
                        },
                        { measureLocatorItem: { measureIdentifier: "82d062156ee74757a2f820a05744452c" } },
                    ],
                },
            },
        ],
    },
    references: {
        id_0: "/gdc/md/foo_project/obj/2187/elements?id=6338473",
    },
};
