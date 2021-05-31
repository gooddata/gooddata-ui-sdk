// (C) 2019 GoodData Corporation

import { idRef } from "@gooddata/sdk-model";
import { ICatalogAttribute } from "../src/workspace/fromModel/ldm/catalog/attribute";
import { ICatalogMeasure } from "../src/workspace/fromModel/ldm/catalog/measure";
import { ICatalogFact } from "../src/workspace/fromModel/ldm/catalog/fact";
import { ICatalogDateDataset } from "../src/workspace/fromModel/ldm/catalog/dateDataset";
import { IAttributeDisplayFormMetadataObject } from "../src/workspace/fromModel/ldm/metadata/attributeDisplayForm";

const catalogDisplayForm: IAttributeDisplayFormMetadataObject = {
    type: "displayForm",
    title: "Display Form",
    description: "mock displayForm",
    uri: "/some/displayForm",
    id: "displayForm",
    ref: idRef("displayForm"),
    production: true,
    deprecated: false,
    unlisted: false,
    isDefault: true,
    attribute: {
        type: "attribute",
        identifier: "attribute",
    },
};

export const catalogAttribute: ICatalogAttribute = {
    type: "attribute",
    attribute: {
        type: "attribute",
        title: "Attribute",
        description: "mock attribute",
        uri: "/some/attribute",
        id: "attribute",
        ref: idRef("attribute"),
        production: true,
        deprecated: false,
        unlisted: false,
        displayForms: [catalogDisplayForm],
    },
    defaultDisplayForm: catalogDisplayForm,
    displayForms: [catalogDisplayForm],
    geoPinDisplayForms: [],
    groups: [],
};

export const catalogMeasure: ICatalogMeasure = {
    type: "measure",
    measure: {
        type: "measure",
        description: "mock measure",
        uri: "/some/measure",
        id: "measure",
        ref: idRef("measure"),
        title: "Measure",
        expression: "SELECT SUM([/attributes/attr])",
        format: "#,##",
        production: true,
        deprecated: false,
        unlisted: false,
    },
    groups: [],
};

export const catalogFact: ICatalogFact = {
    type: "fact",
    fact: {
        type: "fact",
        title: "Fact",
        description: "mock fact",
        uri: "/some/fact",
        id: "fact",
        ref: idRef("fact"),
        production: true,
        deprecated: false,
        unlisted: false,
    },
    groups: [],
};

export const catalogDateDataset: ICatalogDateDataset = {
    type: "dateDataset",
    dataSet: {
        type: "dataSet",
        description: "mock date dataset",
        uri: "/some/dateDataSet",
        id: "dateDataSet",
        ref: idRef("dateDataSet"),
        title: "Date Data Set",
        production: true,
        deprecated: false,
        unlisted: false,
    },
    dateAttributes: [],
    relevance: 0,
};
