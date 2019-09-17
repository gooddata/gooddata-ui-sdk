import { IMeasure, IAttribute } from "@gooddata/sdk-model";

export const workspace = "tpch";

export const CountryName: IAttribute = {
    attribute: {
        displayForm: {
            identifier: "label.cn_name",
        },
        localIdentifier: "country_name",
    },
};

export const ExtendedPriceSum: IMeasure = {
    measure: {
        localIdentifier: "extended_price_sum",
        definition: {
            measureDefinition: {
                item: {
                    identifier: "fact.l_extendedprice",
                },
                aggregation: "sum",
            },
        },
    },
};
