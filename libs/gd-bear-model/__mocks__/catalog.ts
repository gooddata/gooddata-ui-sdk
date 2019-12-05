// (C) 2019 GoodData Corporation
import { GdcCatalog } from "../src";

export const catalogAttribute: GdcCatalog.ICatalogAttribute = {
    identifier: "attr",
    type: "attribute",
    title: "Attribute",
    summary: "",
    groups: [],
    production: true,
    links: {
        defaultDisplayForm: "/gdc/md/project/obj/1",
        self: "/gdc/md/project/obj/0",
    },
};

export const catalogMetric: GdcCatalog.ICatalogMetric = {
    identifier: "measure",
    type: "metric",
    title: "Measure",
    summary: "",
    groups: [],
    production: true,
    expression: "SELECT SUM([/gdc/md/project/obj/4])",
    format: "#,##",
    links: {
        self: "/gdc/md/project/obj/2",
    },
};

export const catalogFact: GdcCatalog.ICatalogFact = {
    identifier: "fact",
    type: "fact",
    title: "Fact",
    summary: "",
    groups: [],
    production: true,
    links: {
        self: "/gdc/md/project/obj/3",
    },
};
