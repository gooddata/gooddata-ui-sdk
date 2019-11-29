// (C) 2019 GoodData Corporation
import {
    CatalogItemType,
    CatalogItem,
    ICatalogAttribute,
    ICatalogMeasure,
    ICatalogFact,
} from "@gooddata/sdk-model";
import { GdcCatalog } from "@gooddata/gd-bear-model";

const bearItemTypeByCatalogItemType: {
    [spiItemType in CatalogItemType]: GdcCatalog.CatalogItemType;
} = {
    attribute: "attribute",
    fact: "fact",
    measure: "metric",
};

export const convertCatalogItemTypeToBearItemType = (type: CatalogItemType): GdcCatalog.CatalogItemType => {
    const bearItemType = bearItemTypeByCatalogItemType[type];
    return bearItemType;
};

export const convertBearCatalogItemToCatalogItem = (item: GdcCatalog.CatalogItem): CatalogItem => {
    const { identifier, title, summary, production, groups = [] } = item;
    const itemBase = {
        identifier,
        title,
        summary,
        production,
        groups,
    };

    switch (item.type) {
        case "attribute": {
            const spiAttribute: ICatalogAttribute = {
                type: "attribute",
                defaultDisplayForm: item.links.defaultDisplayForm,
                ...itemBase,
            };
            return spiAttribute;
        }
        case "metric": {
            const spiMeasure: ICatalogMeasure = {
                type: "measure",
                expression: item.expression,
                format: item.format,
                ...itemBase,
            };
            return spiMeasure;
        }
        case "fact": {
            const spiFact: ICatalogFact = {
                type: "fact",
                ...itemBase,
            };
            return spiFact;
        }
    }
};
