// (C) 2007-2020 GoodData Corporation
import {
    getIdsFromUri,
    sanitizeField,
    getRowNodeId,
    getGridIndex,
    indexOfTreeNode,
    getTreeLeaves,
    getSubtotalStyles,
    cellRenderer,
    getParsedFields,
} from "../agGridUtils";
import cloneDeep = require("lodash/cloneDeep");
import identity = require("lodash/identity");
import { IDimension } from "@gooddata/sdk-model";

describe("getIdsFromUri", () => {
    it("should return array of attribute id and attribute value id", () => {
        expect(getIdsFromUri("/gdc/md/storybook/obj/123/elements?id=456")).toEqual(["123", "456"]);
    });
    it("should return null as attribute value id if supplied with attribute uri", () => {
        expect(getIdsFromUri("/gdc/md/storybook/obj/123")).toEqual(["123", null]);
    });
    it("should work with non standard ids and sanitize them", () => {
        expect(getIdsFromUri("/gdc/md/storybook/obj/123_ABC.DEF/elements?id=456_GHI.789")).toEqual([
            "123UNDERSCOREABCDOTDEF",
            "456UNDERSCOREGHIDOT789",
        ]);
    });
    it("should return unsanitized ids if sanitize: false", () => {
        expect(getIdsFromUri("/gdc/md/storybook/obj/123_ABC.DEF/elements?id=456_GHI.789", false)).toEqual([
            "123_ABC.DEF",
            "456_GHI.789",
        ]);
    });
});

describe("sanitizeField", () => {
    it("should replace [.], [_] and [-] characters with placeholders", () => {
        expect(sanitizeField("field.with-replacement_")).toBe("fieldDOTwithDASHreplacementUNDERSCORE");
    });
});

describe("getRowNodeId", () => {
    it("should return correct id for row item", () => {
        const item = {
            headerItemMap: {
                a_1027: {
                    attributeHeaderItem: {
                        name: "Direct Sales",
                        uri: "/gdc/md/ux8xk21n3al4qr1akoz7j6xkl5dt1dqj/obj/1026/elements?id=1226",
                    },
                },
                a_1094: { totalHeaderItem: { name: "nat", type: "nat" } },
                a_64727: {
                    attributeHeaderItem: {
                        name: "Exclude",
                        uri: "/gdc/md/ux8xk21n3al4qr1akoz7j6xkl5dt1dqj/obj/64726/elements?id=966650",
                    },
                },
            },
        };

        expect(getRowNodeId(item)).toEqual("a_1027_1226-a_1094_nat-a_64727_966650");
    });
});

describe("getGridIndex", () => {
    const gridDistance = 20;

    it.each([
        ["100", 100, 5],
        ["110", 110, 5],
        ["99", 99, 4],
    ])(
        "should return correct row index when scrolltop is %s",
        (_: string, scrollTop: number, expectedRowIndex: number) => {
            expect(getGridIndex(scrollTop, gridDistance)).toEqual(expectedRowIndex);
        },
    );
});

describe("cellRenderer", () => {
    it("should escape value", () => {
        const fakeParams: any = {
            formatValue: identity,
            value: "<button>xss</button>",
            node: {
                rowPinned: false,
            },
        };

        const value = cellRenderer(fakeParams);

        expect(value).toEqual('<span class="s-value">&lt;button&gt;xss&lt;/button&gt;</span>');
    });
});

describe("getSubtotalStyles", () => {
    it("should return empty array if no totals are present", () => {
        const dimension: IDimension = {
            itemIdentifiers: ["a1", "a2", "a3"],
        };
        const resultSubtotalStyles = getSubtotalStyles(dimension);
        expect(resultSubtotalStyles).toEqual([]);
    });
    it("should return null on first attribute", () => {
        const dimension: IDimension = {
            itemIdentifiers: ["a1", "a2"],
            totals: [
                {
                    attributeIdentifier: "a1",
                    type: "sum",
                    measureIdentifier: "m1",
                },
                {
                    attributeIdentifier: "a2",
                    type: "sum",
                    measureIdentifier: "m1",
                },
            ],
        };
        const resultSubtotalStyles = getSubtotalStyles(dimension);
        expect(resultSubtotalStyles).toEqual([null, "even"]);
    });
    it("should alternate subtotal style", () => {
        const dimension: IDimension = {
            itemIdentifiers: ["a1", "a2", "a3", "a4", "a5"],
            totals: [
                {
                    attributeIdentifier: "a2",
                    type: "sum",
                    measureIdentifier: "m1",
                },
                {
                    attributeIdentifier: "a4",
                    type: "sum",
                    measureIdentifier: "m1",
                },
                {
                    attributeIdentifier: "a5",
                    type: "sum",
                    measureIdentifier: "m1",
                },
            ],
        };
        const resultSubtotalStyles = getSubtotalStyles(dimension);
        expect(resultSubtotalStyles).toEqual([null, "even", null, "odd", "even"]);
    });
});

const tree: any = {
    name: "A",
    children: [
        {
            name: "A.A",
        },
        {
            name: "A.B",
            children: [
                {
                    name: "A.B.A",
                },
                {
                    name: "A.B.B",
                },
                {
                    name: "A.B.C",
                },
            ],
        },
        {
            name: "A.C",
        },
    ],
};

describe("getTreeleaves", () => {
    it("should return tree nodes that have no children", () => {
        expect(getTreeLeaves(tree)).toEqual([
            {
                name: "A.A",
            },
            {
                name: "A.C",
            },
            {
                name: "A.B.A",
            },
            {
                name: "A.B.B",
            },
            {
                name: "A.B.C",
            },
        ]);
    });
});

describe("indexOfTreeNode", () => {
    it("should return an array of indexes that define a matiching node in a tree structure", () => {
        const node: any = tree.children[1].children[2];
        expect(indexOfTreeNode(node, tree)).toEqual([0, 1, 2]);
    });
    it("should return indexes with custom matchNode function", () => {
        const clonedTree: any = cloneDeep(tree);
        const node: any = tree.children[1].children[2];
        expect(
            indexOfTreeNode(node, clonedTree, (nodeA, nodeB) => nodeA.name && nodeA.name === nodeB.name),
        ).toEqual([0, 1, 2]);
    });
    it("should return return null if the node is not found", () => {
        const node = {};
        expect(indexOfTreeNode(node, tree)).toEqual(null);
    });
});

describe("getParsedFields", () => {
    it("should return last parsed field from colId", () => {
        expect(getParsedFields("a_2009")).toEqual([["a", "2009"]]);
        expect(getParsedFields("a_2009_4-a_2071_12")).toEqual([
            ["a", "2009", "4"],
            ["a", "2071", "12"],
        ]);
        expect(getParsedFields("a_2009_4-a_2071_12-m_3")).toEqual([
            ["a", "2009", "4"],
            ["a", "2071", "12"],
            ["m", "3"],
        ]);
    });
});
