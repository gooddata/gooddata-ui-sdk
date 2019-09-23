// (C) 2007-2019 GoodData Corporation

export const noAttributesTwoMeasures: any = {
    rowData: [
        {
            headerItemMap: {},
            m_0: "678",
            m_1: "907",
        },
    ],
    columnIds: [],
};

export const oneAttributeTwoMeasures = {
    rowData: [
        {
            headerItemMap: {
                a_4DOTdf: {
                    attributeHeaderItem: {
                        uri: "/gdc/md/storybook/obj/4/elements?id=1",
                        name: "Pink",
                    },
                },
            },
            a_4DOTdf: "Pink",
            m_0: "678",
            m_1: "907",
        },
        {
            headerItemMap: {
                a_4DOTdf: {
                    attributeHeaderItem: {
                        uri: "/gdc/md/storybook/obj/4/elements?id=2",
                        name: "Red",
                    },
                },
            },
            a_4DOTdf: "Red",
            m_0: "958",
            m_1: "525",
        },
        {
            headerItemMap: {
                a_4DOTdf: {
                    attributeHeaderItem: {
                        uri: "/gdc/md/storybook/obj/4/elements?id=3",
                        name: "Purple",
                    },
                },
            },
            a_4DOTdf: "Purple",
            m_0: "928",
            m_1: "824",
        },
        {
            headerItemMap: {
                a_4DOTdf: {
                    attributeHeaderItem: {
                        uri: "/gdc/md/storybook/obj/4/elements?id=4",
                        name: "Salmon",
                    },
                },
            },
            a_4DOTdf: "Salmon",
            m_0: "201",
            m_1: "482",
        },
    ],
    columnIds: ["a_4DOTdf"],
};

export const oneAttributeTwoMeasuresSameValuesDifferentURIs = {
    rowData: [
        {
            headerItemMap: {
                a_4DOTdf: {
                    attributeHeaderItem: {
                        uri: "/gdc/md/storybook/obj/4/elements?id=1",
                        name: "Pink",
                    },
                },
            },
            a_4DOTdf: "Pink",
            m_0: "678",
            m_1: "907",
        },
        {
            headerItemMap: {
                a_4DOTdf: {
                    attributeHeaderItem: {
                        uri: "/gdc/md/storybook/obj/4/elements?id=2",
                        name: "Pink",
                    },
                },
            },
            a_4DOTdf: "Pink",
            m_0: "958",
            m_1: "525",
        },
        {
            headerItemMap: {
                a_4DOTdf: {
                    attributeHeaderItem: {
                        uri: "/gdc/md/storybook/obj/4/elements?id=3",
                        name: "Pink",
                    },
                },
            },
            a_4DOTdf: "Pink",
            m_0: "928",
            m_1: "824",
        },
        {
            headerItemMap: {
                a_4DOTdf: {
                    attributeHeaderItem: {
                        uri: "/gdc/md/storybook/obj/4/elements?id=4",
                        name: "Pink",
                    },
                },
            },
            a_4DOTdf: "Pink",
            m_0: "201",
            m_1: "482",
        },
    ],
    columnIds: ["a_4DOTdf"],
};

export const oneAttributeTwoMeasuresOneGroupInFirstAttribute = {
    rowData: [
        {
            headerItemMap: {
                a_4DOTdf: {
                    attributeHeaderItem: {
                        uri: "/gdc/md/storybook/obj/4/elements?id=1",
                        name: "Pink",
                    },
                },
            },
            a_4DOTdf: "Pink",
            m_0: "678",
            m_1: "907",
        },
        {
            headerItemMap: {
                a_4DOTdf: {
                    attributeHeaderItem: {
                        uri: "/gdc/md/storybook/obj/4/elements?id=1",
                        name: "Pink",
                    },
                },
            },
            a_4DOTdf: "Pink",
            m_0: "958",
            m_1: "525",
        },
        {
            headerItemMap: {
                a_4DOTdf: {
                    attributeHeaderItem: {
                        uri: "/gdc/md/storybook/obj/4/elements?id=1",
                        name: "Pink",
                    },
                },
            },
            a_4DOTdf: "Pink",
            m_0: "958",
            m_1: "525",
        },
        {
            headerItemMap: {
                a_4DOTdf: {
                    attributeHeaderItem: {
                        uri: "/gdc/md/storybook/obj/4/elements?id=3",
                        name: "Purple",
                    },
                },
            },
            a_4DOTdf: "Purple",
            m_0: "928",
            m_1: "824",
        },
        {
            headerItemMap: {
                a_4DOTdf: {
                    attributeHeaderItem: {
                        uri: "/gdc/md/storybook/obj/4/elements?id=4",
                        name: "Salmon",
                    },
                },
            },
            a_4DOTdf: "Salmon",
            m_0: "201",
            m_1: "482",
        },
    ],
    columnIds: ["a_4DOTdf"],
};

export const twoAttributesTwoMeasuresUnEvenGroups = {
    rowData: [
        {
            headerItemMap: {
                a_4DOTdf: {
                    attributeHeaderItem: {
                        uri: "/gdc/md/storybook/obj/4/elements?id=1",
                        name: "Pink",
                    },
                },
                a_5DOTdf: {
                    attributeHeaderItem: { uri: "/gdc/md/storybook/obj/5/elements?id=1", name: "low" },
                },
            },
            a_4DOTdf: "Pink",
            a_5DOTdf: "low",
            m_0: "678",
            m_1: "907",
        },
        {
            headerItemMap: {
                a_4DOTdf: {
                    attributeHeaderItem: {
                        uri: "/gdc/md/storybook/obj/4/elements?id=1",
                        name: "Pink",
                    },
                },
                a_5DOTdf: {
                    attributeHeaderItem: { uri: "/gdc/md/storybook/obj/5/elements?id=1", name: "low" },
                },
            },
            a_4DOTdf: "Pink",
            a_5DOTdf: "low",
            m_0: "958",
            m_1: "525",
        },
        {
            headerItemMap: {
                a_4DOTdf: {
                    attributeHeaderItem: {
                        uri: "/gdc/md/storybook/obj/4/elements?id=1",
                        name: "Pink",
                    },
                },
                a_5DOTdf: {
                    attributeHeaderItem: { uri: "/gdc/md/storybook/obj/5/elements?id=1", name: "low" },
                },
            },
            a_4DOTdf: "Pink",
            a_5DOTdf: "low",
            m_0: "928",
            m_1: "824",
        },
        {
            headerItemMap: {
                a_4DOTdf: {
                    attributeHeaderItem: {
                        uri: "/gdc/md/storybook/obj/4/elements?id=2",
                        name: "Red",
                    },
                },
                a_5DOTdf: {
                    attributeHeaderItem: { uri: "/gdc/md/storybook/obj/5/elements?id=1", name: "low" },
                },
            },
            a_4DOTdf: "Red",
            a_5DOTdf: "low",
            m_0: "201",
            m_1: "482",
        },
        {
            headerItemMap: {
                a_4DOTdf: {
                    attributeHeaderItem: {
                        uri: "/gdc/md/storybook/obj/4/elements?id=2",
                        name: "Red",
                    },
                },
                a_5DOTdf: {
                    attributeHeaderItem: { uri: "/gdc/md/storybook/obj/5/elements?id=2", name: "medium" },
                },
            },
            a_4DOTdf: "Red",
            a_5DOTdf: "medium",
            m_0: "47",
            m_1: "788",
        },
        {
            headerItemMap: {
                a_4DOTdf: {
                    attributeHeaderItem: {
                        uri: "/gdc/md/storybook/obj/4/elements?id=2",
                        name: "Red",
                    },
                },
                a_5DOTdf: {
                    attributeHeaderItem: { uri: "/gdc/md/storybook/obj/5/elements?id=3", name: "high" },
                },
            },
            a_4DOTdf: "Red",
            a_5DOTdf: "high",
            m_0: "864",
            m_1: "82",
        },
        {
            headerItemMap: {
                a_4DOTdf: {
                    attributeHeaderItem: {
                        uri: "/gdc/md/storybook/obj/4/elements?id=3",
                        name: "Purple",
                    },
                },
                a_5DOTdf: {
                    attributeHeaderItem: { uri: "/gdc/md/storybook/obj/5/elements?id=1", name: "low" },
                },
            },
            a_4DOTdf: "Purple",
            a_5DOTdf: "low",
            m_0: "613",
            m_1: "243",
        },
        {
            headerItemMap: {
                a_4DOTdf: {
                    attributeHeaderItem: {
                        uri: "/gdc/md/storybook/obj/4/elements?id=3",
                        name: "Purple",
                    },
                },
                a_5DOTdf: {
                    attributeHeaderItem: { uri: "/gdc/md/storybook/obj/5/elements?id=2", name: "medium" },
                },
            },
            a_4DOTdf: "Purple",
            a_5DOTdf: "medium",
            m_0: "37",
            m_1: "864",
        },
        {
            headerItemMap: {
                a_4DOTdf: {
                    attributeHeaderItem: {
                        uri: "/gdc/md/storybook/obj/4/elements?id=3",
                        name: "Purple",
                    },
                },
                a_5DOTdf: {
                    attributeHeaderItem: { uri: "/gdc/md/storybook/obj/5/elements?id=3", name: "high" },
                },
            },
            a_4DOTdf: "Purple",
            a_5DOTdf: "high",
            m_0: "416",
            m_1: "471",
        },
        {
            headerItemMap: {
                a_4DOTdf: {
                    attributeHeaderItem: {
                        uri: "/gdc/md/storybook/obj/4/elements?id=4",
                        name: "Salmon",
                    },
                },
                a_5DOTdf: {
                    attributeHeaderItem: { uri: "/gdc/md/storybook/obj/5/elements?id=1", name: "low" },
                },
            },
            a_4DOTdf: "Salmon",
            a_5DOTdf: "low",
            m_0: "253",
            m_1: "24",
        },
        {
            headerItemMap: {
                a_4DOTdf: {
                    attributeHeaderItem: {
                        uri: "/gdc/md/storybook/obj/4/elements?id=4",
                        name: "Salmon",
                    },
                },
                a_5DOTdf: {
                    attributeHeaderItem: { uri: "/gdc/md/storybook/obj/5/elements?id=2", name: "medium" },
                },
            },
            a_4DOTdf: "Salmon",
            a_5DOTdf: "medium",
            m_0: "897",
            m_1: "324",
        },
        {
            headerItemMap: {
                a_4DOTdf: {
                    attributeHeaderItem: {
                        uri: "/gdc/md/storybook/obj/4/elements?id=4",
                        name: "Salmon",
                    },
                },
                a_5DOTdf: {
                    attributeHeaderItem: { uri: "/gdc/md/storybook/obj/5/elements?id=3", name: "high" },
                },
            },
            a_4DOTdf: "Salmon",
            a_5DOTdf: "high",
            m_0: "278",
            m_1: "267",
        },
    ],
    columnIds: ["a_4DOTdf", "a_5DOTdf"],
};

export const twoAttributesTwoMeasuresEvenGroupsFristPage = {
    rowData: [
        {
            headerItemMap: {
                a_4DOTdf: {
                    attributeHeaderItem: {
                        uri: "/gdc/md/storybook/obj/4/elements?id=1",
                        name: "Pink",
                    },
                },
                a_5DOTdf: {
                    attributeHeaderItem: { uri: "/gdc/md/storybook/obj/5/elements?id=1", name: "low" },
                },
            },
            a_4DOTdf: "Pink",
            a_5DOTdf: "low",
            m_0: "678",
            m_1: "907",
        },
        {
            headerItemMap: {
                a_4DOTdf: {
                    attributeHeaderItem: { uri: "/gdc/md/storybook/obj/4/elements?id=1", name: "Pink" },
                },
                a_5DOTdf: {
                    attributeHeaderItem: { uri: "/gdc/md/storybook/obj/5/elements?id=2", name: "medium" },
                },
            },
            a_4DOTdf: "Pink",
            a_5DOTdf: "medium",
            m_0: "958",
            m_1: "525",
        },
        {
            headerItemMap: {
                a_4DOTdf: {
                    attributeHeaderItem: { uri: "/gdc/md/storybook/obj/4/elements?id=1", name: "Pink" },
                },
                a_5DOTdf: {
                    attributeHeaderItem: { uri: "/gdc/md/storybook/obj/5/elements?id=3", name: "high" },
                },
            },
            a_4DOTdf: "Pink",
            a_5DOTdf: "high",
            m_0: "928",
            m_1: "824",
        },
        {
            headerItemMap: {
                a_4DOTdf: {
                    attributeHeaderItem: { uri: "/gdc/md/storybook/obj/4/elements?id=2", name: "Red" },
                },
                a_5DOTdf: {
                    attributeHeaderItem: { uri: "/gdc/md/storybook/obj/5/elements?id=1", name: "low" },
                },
            },
            a_4DOTdf: "Red",
            a_5DOTdf: "low",
            m_0: "201",
            m_1: "482",
        },
        {
            headerItemMap: {
                a_4DOTdf: {
                    attributeHeaderItem: { uri: "/gdc/md/storybook/obj/4/elements?id=2", name: "Red" },
                },
                a_5DOTdf: {
                    attributeHeaderItem: { uri: "/gdc/md/storybook/obj/5/elements?id=2", name: "medium" },
                },
            },
            a_4DOTdf: "Red",
            a_5DOTdf: "medium",
            m_0: "47",
            m_1: "788",
        },
    ],
    columnIds: ["a_4DOTdf", "a_5DOTdf"],
};

export const twoAttributesTwoMeasuresEvenGroupsSecondPage = {
    rowData: [
        {
            headerItemMap: {
                a_4DOTdf: {
                    attributeHeaderItem: { uri: "/gdc/md/storybook/obj/4/elements?id=2", name: "Red" },
                },
                a_5DOTdf: {
                    attributeHeaderItem: { uri: "/gdc/md/storybook/obj/5/elements?id=3", name: "high" },
                },
            },
            a_4DOTdf: "Red",
            a_5DOTdf: "high",
            m_0: "864",
            m_1: "82",
        },
        {
            headerItemMap: {
                a_4DOTdf: {
                    attributeHeaderItem: { uri: "/gdc/md/storybook/obj/4/elements?id=3", name: "Purple" },
                },
                a_5DOTdf: {
                    attributeHeaderItem: { uri: "/gdc/md/storybook/obj/5/elements?id=1", name: "low" },
                },
            },
            a_4DOTdf: "Purple",
            a_5DOTdf: "low",
            m_0: "613",
            m_1: "243",
        },
        {
            headerItemMap: {
                a_4DOTdf: {
                    attributeHeaderItem: { uri: "/gdc/md/storybook/obj/4/elements?id=3", name: "Purple" },
                },
                a_5DOTdf: {
                    attributeHeaderItem: { uri: "/gdc/md/storybook/obj/5/elements?id=2", name: "medium" },
                },
            },
            a_4DOTdf: "Purple",
            a_5DOTdf: "medium",
            m_0: "37",
            m_1: "864",
        },
        {
            headerItemMap: {
                a_4DOTdf: {
                    attributeHeaderItem: { uri: "/gdc/md/storybook/obj/4/elements?id=3", name: "Purple" },
                },
                a_5DOTdf: {
                    attributeHeaderItem: { uri: "/gdc/md/storybook/obj/5/elements?id=3", name: "high" },
                },
            },
            a_4DOTdf: "Purple",
            a_5DOTdf: "high",
            m_0: "416",
            m_1: "471",
        },
        {
            headerItemMap: {
                a_4DOTdf: {
                    attributeHeaderItem: { uri: "/gdc/md/storybook/obj/4/elements?id=4", name: "Salmon" },
                },
                a_5DOTdf: {
                    attributeHeaderItem: { uri: "/gdc/md/storybook/obj/5/elements?id=1", name: "low" },
                },
            },
            a_4DOTdf: "Salmon",
            a_5DOTdf: "low",
            m_0: "253",
            m_1: "24",
        },
        {
            headerItemMap: {
                a_4DOTdf: {
                    attributeHeaderItem: { uri: "/gdc/md/storybook/obj/4/elements?id=4", name: "Salmon" },
                },
                a_5DOTdf: {
                    attributeHeaderItem: { uri: "/gdc/md/storybook/obj/5/elements?id=2", name: "medium" },
                },
            },
            a_4DOTdf: "Salmon",
            a_5DOTdf: "medium",
            m_0: "897",
            m_1: "324",
        },
        {
            headerItemMap: {
                a_4DOTdf: {
                    attributeHeaderItem: { uri: "/gdc/md/storybook/obj/4/elements?id=4", name: "Salmon" },
                },
                a_5DOTdf: {
                    attributeHeaderItem: { uri: "/gdc/md/storybook/obj/5/elements?id=3", name: "high" },
                },
            },
            a_4DOTdf: "Salmon",
            a_5DOTdf: "high",
            m_0: "278",
            m_1: "267",
        },
    ],
    columnIds: ["a_4DOTdf", "a_5DOTdf"],
};

export const twoAttributesTwoMeasuresEvenGroups = {
    rowData: [
        ...twoAttributesTwoMeasuresEvenGroupsFristPage.rowData,
        ...twoAttributesTwoMeasuresEvenGroupsSecondPage.rowData,
    ],
    columnIds: twoAttributesTwoMeasuresEvenGroupsFristPage.columnIds,
};
