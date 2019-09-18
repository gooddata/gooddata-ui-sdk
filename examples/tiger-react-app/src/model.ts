import { IAttribute, IMeasure } from "@gooddata/sdk-model";

export const workspace = "tpch";

export const CountryNameId = "label.cn_name";
export const CountryName: IAttribute = {
    attribute: {
        displayForm: {
            identifier: CountryNameId,
        },
        localIdentifier: CountryNameId,
    },
};

export const BrandNameId = "attribute.p_brand";

export const BrandName: IAttribute = {
    attribute: {
        displayForm: {
            identifier: BrandNameId,
        },
        localIdentifier: BrandNameId,
    },
};

//
// Simple measures
//

export const QuantityId = "fact.l_quantity";

export const QuantitySum: IMeasure = {
    measure: {
        localIdentifier: "quantity_sum",
        definition: {
            measureDefinition: {
                item: {
                    identifier: QuantityId,
                },
                aggregation: "sum",
            },
        },
    },
};

export const QuantitySumFiltered: IMeasure = {
    measure: {
        localIdentifier: "quantity_sum",
        definition: {
            measureDefinition: {
                item: {
                    identifier: QuantityId,
                },
                aggregation: "sum",
            },
        },
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

export const FilteredExtendedPriceSum: IMeasure = {
    measure: {
        localIdentifier: "extended_price_sum",
        definition: {
            measureDefinition: {
                item: {
                    identifier: "fact.l_extendedprice",
                },
                aggregation: "sum",
                filters: [
                    {
                        positiveAttributeFilter: {
                            displayForm: { identifier: BrandNameId },
                            in: { values: ["Brand#41", "Brand#42", "Brand#43"] },
                        },
                    },
                ],
            },
        },
    },
};
