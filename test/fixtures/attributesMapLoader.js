export const displayForms = [
    {
        attributeDisplayForm: {
            content: {
                formOf: '/gdc/md/mockProject/obj/1027'
            },
            meta: {
                uri: '/gdc/md/mockProject/obj/1028'
            }
        }
    },
    {
        attributeDisplayForm: {
            content: {
                formOf: '/gdc/md/mockProject/obj/42'
            },
            meta: {
                uri: '/gdc/md/mockProject/obj/43'
            }
        }
    }
];

export const attributeObjects = [
    {
        attribute: {
            content: {},
            meta: {
                uri: '/gdc/md/mockProject/obj/1027'
            }
        }
    },
    {
        attribute: {
            content: {},
            meta: {
                uri: '/gdc/md/mockProject/obj/42'
            }
        }
    }
];

export const expectedResult = {
    '/gdc/md/mockProject/obj/1028': {
        attribute: {
            content: {},
            meta: { uri: '/gdc/md/mockProject/obj/1027' }
        }
    },
    '/gdc/md/mockProject/obj/43': {
        attribute: {
            content: {},
            meta: { uri: '/gdc/md/mockProject/obj/42' }
        }
    }
};
