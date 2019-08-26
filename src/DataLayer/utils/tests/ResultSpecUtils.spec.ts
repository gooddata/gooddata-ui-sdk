// (C) 2007-2018 GoodData Corporation
import { AFM } from "@gooddata/typings";

import { isSortValid, applySorting } from "../ResultSpecUtils";

describe("applySorting", () => {
    const resultSpec: AFM.IResultSpec = {
        sorts: [
            {
                attributeSortItem: {
                    attributeIdentifier: "a1",
                    direction: "desc",
                },
            },
            {
                attributeSortItem: {
                    attributeIdentifier: "a2",
                    direction: "desc",
                },
            },
        ],
    };

    it("should not change resultSpec if sortItems are empty", () => {
        expect(applySorting(resultSpec, [])).toEqual(resultSpec);
    });

    it("should override existing sorting", () => {
        const sortItems: AFM.SortItem[] = [
            {
                attributeSortItem: {
                    attributeIdentifier: "a3",
                    direction: "desc",
                },
            },
        ];

        const expectedResultSpec: AFM.IResultSpec = {
            sorts: [
                {
                    attributeSortItem: {
                        attributeIdentifier: "a3",
                        direction: "desc",
                    },
                },
            ],
        };

        expect(applySorting(resultSpec, sortItems)).toEqual(expectedResultSpec);
    });
});

describe("isSortValid", () => {
    it("should return false for invalid attribute sort", () => {
        const afm: AFM.IAfm = {
            attributes: [
                {
                    localIdentifier: "a1",
                    displayForm: {
                        identifier: "ident_a",
                    },
                },
            ],
        };
        const sortItem: AFM.IAttributeSortItem = {
            attributeSortItem: {
                direction: "desc",
                attributeIdentifier: "a2",
            },
        };
        expect(isSortValid(afm, sortItem)).toEqual(false);
    });

    it("should return false for invalid measure sort", () => {
        const afm: AFM.IAfm = {
            attributes: [
                {
                    localIdentifier: "a1",
                    displayForm: {
                        identifier: "ident_a",
                    },
                },
            ],
        };
        const sortItem: AFM.IMeasureSortItem = {
            measureSortItem: {
                direction: "desc",
                locators: [
                    {
                        measureLocatorItem: {
                            measureIdentifier: "m2",
                        },
                    },
                ],
            },
        };
        expect(isSortValid(afm, sortItem)).toEqual(false);
    });

    it("should detect valid attribute sort", () => {
        const afm: AFM.IAfm = {
            attributes: [
                {
                    localIdentifier: "a1",
                    displayForm: {
                        identifier: "ident_a",
                    },
                },
            ],
        };
        const sortItem: AFM.IAttributeSortItem = {
            attributeSortItem: {
                direction: "desc",
                attributeIdentifier: "a1",
            },
        };
        expect(isSortValid(afm, sortItem)).toEqual(true);
    });

    it("should detect valid measure sort", () => {
        const afm: AFM.IAfm = {
            measures: [
                {
                    localIdentifier: "m1",
                    definition: {
                        measure: {
                            item: {
                                identifier: "ident_m",
                            },
                        },
                    },
                },
            ],
        };
        const sortItem: AFM.IMeasureSortItem = {
            measureSortItem: {
                direction: "desc",
                locators: [
                    {
                        measureLocatorItem: {
                            measureIdentifier: "m1",
                        },
                    },
                ],
            },
        };
        expect(isSortValid(afm, sortItem)).toEqual(true);
    });

    it("should return true for no sortItem", () => {
        const afm: AFM.IAfm = {
            measures: [
                {
                    localIdentifier: "m1",
                    definition: {
                        measure: {
                            item: {
                                identifier: "ident_m",
                            },
                        },
                    },
                },
            ],
        };
        expect(isSortValid(afm)).toEqual(true);
    });
});
