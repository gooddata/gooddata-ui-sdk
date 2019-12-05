// (C) 2019 GoodData Corporation
import { ICatalogAttribute, ICatalogMeasure, ICatalogFact, ICatalogDateDataset } from "../src";

export const catalogAttribute: ICatalogAttribute = {
    id: "attr",
    uri: "/attributes/attr",
    type: "attribute",
    title: "Attribute",
    description: "",
    groups: [],
    production: true,
    defaultDisplayForm: {
        id: "label.attr",
        description: "",
        production: true,
        title: "Attribute Display Form",
        uri: "/labels/label",
    },
};

export const catalogMeasure: ICatalogMeasure = {
    id: "measure",
    uri: "/measures/measure",
    type: "measure",
    title: "Measure",
    description: "",
    groups: [],
    production: true,
    expression: "SELECT SUM([/attributes/attr])",
    format: "#,##",
};

export const catalogFact: ICatalogFact = {
    id: "fact",
    uri: "/facts/fact",
    type: "fact",
    title: "Fact",
    description: "",
    groups: [],
    production: true,
};

export const catalogDateDataset: ICatalogDateDataset = {
    id: "dateDataset",
    uri: "/dateDatasets/dateDataset",
    type: "dateDataset",
    title: "Date Dataset",
    description: "",
    production: true,
    dateAttributes: [],
    relevance: 0,
};
