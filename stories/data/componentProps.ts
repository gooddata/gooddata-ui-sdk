// (C) 2007-2019 GoodData Corporation
import { VisualizationObject, AFM, Execution } from "@gooddata/typings";
import { IColumnTotal } from "../../src/components/core/pivotTable/AggregationsMenu";
import {
    arithmeticMeasure,
    attributeSortItem,
    measureSortItem,
    popMeasure,
    previousPeriodMeasure,
    measure,
    attribute,
} from "../../src/helpers/model";

export const MEASURE_1: VisualizationObject.IMeasure = measure("/gdc/md/storybook/obj/1").localIdentifier(
    "m1",
);

export const MEASURE_1_RATIO: VisualizationObject.IMeasure = measure("/gdc/md/storybook/obj/1")
    .localIdentifier("m1")
    .ratio();

export const MEASURE_1_WITH_LONG_NAME_AND_FORMAT: VisualizationObject.IMeasure = measure(
    "/gdc/md/storybook/obj/1",
)
    .alias("Very long name that could break layout")
    .localIdentifier("m1")
    .format(
        "[<0][red]$#'#,## Very long value that could break layout;[<10000][blue]$#'#,## Very long value that could break layout;[>=10000][green]$#'#,## Very long value that could break layout;[=null] Very long value that could break layout",
    );

export const MEASURE_2: VisualizationObject.IMeasure = measure("/gdc/md/storybook/obj/2").localIdentifier(
    "m2",
);
export const MEASURE_3: VisualizationObject.IMeasure = measure("/gdc/md/storybook/obj/3").localIdentifier(
    "m3",
);
export const MEASURE_4: VisualizationObject.IMeasure = measure("/gdc/md/storybook/obj/4").localIdentifier(
    "m4",
);

export const MEASURE_AM_1_2: VisualizationObject.IMeasure = arithmeticMeasure(["m1", "m2"], "sum")
    .localIdentifier("am1")
    .alias("M_0");

export const MEASURE_1_POP: VisualizationObject.IMeasure = popMeasure("m1", "/gdc/md/storybook/obj/3.df")
    .localIdentifier("m1_pop")
    .alias("Previous period");

export const MEASURE_1_PREVIOUS_PERIOD: VisualizationObject.IMeasure = previousPeriodMeasure("m1", [
    {
        dataSet: {
            uri: "/gdc/md/storybook/obj/3.df",
        },
        periodsAgo: 1,
    },
])
    .localIdentifier("m1_previous_period")
    .alias("Previous period");

export const MEASURE_1_WITH_ALIAS: VisualizationObject.IMeasure = {
    measure: {
        ...MEASURE_1.measure,
        alias: "My measure alias",
    },
};

export const MEASURE_WITH_FORMAT: VisualizationObject.IMeasure = measure(
    "/gdc/md/storybook/obj/4",
).localIdentifier("m3");

export const MEASURE_2_WITH_FORMAT: VisualizationObject.IMeasure = measure("/gdc/md/storybook/obj/2")
    .localIdentifier("m2")
    .format("[backgroundColor=ffff00][green]#,##0.00 €");

export const MEASURE_WITH_NULLS: VisualizationObject.IMeasure = measure(
    "/gdc/md/storybook/obj/9",
).localIdentifier("m4");

export const ARITHMETIC_MEASURE_SIMPLE_OPERANDS: VisualizationObject.IMeasure = arithmeticMeasure(
    ["m1", "m2"],
    "sum",
)
    .localIdentifier("arithmetic_measure_1")
    .alias("Sum of m1 and m2");

export const ARITHMETIC_MEASURE_USING_ARITHMETIC: VisualizationObject.IMeasure = arithmeticMeasure(
    ["arithmetic_measure_1", "m2"],
    "difference",
)
    .localIdentifier("arithmetic_measure_2")
    .alias("Difference of arithmetic_measure_1 and m2");

export const FORMATTED_ARITHMETIC_MEASURE: VisualizationObject.IMeasure = arithmeticMeasure(
    ["m1", "m2"],
    "sum",
)
    .localIdentifier("arithmetic_measure_3")
    .format("[backgroundColor=ffff00][green]#,##0.00 €")
    .alias("Formatted sum of m1 and m2");

export const ATTRIBUTE_1: VisualizationObject.IVisualizationAttribute = attribute(
    "/gdc/md/storybook/obj/4.df",
).localIdentifier("a1");

export const ATTRIBUTE_COUNTRY: VisualizationObject.IVisualizationAttribute = attribute(
    "/gdc/md/storybook/obj/3.df",
).localIdentifier("country");

export const ATTRIBUTE_POPULARITY: VisualizationObject.IVisualizationAttribute = attribute(
    "/gdc/md/storybook/obj/5.df",
).localIdentifier("Popularity");

export const ATTRIBUTE_1_WITH_ALIAS: VisualizationObject.IVisualizationAttribute = {
    visualizationAttribute: {
        ...ATTRIBUTE_1.visualizationAttribute,
        alias: "My attribute alias",
    },
};

export const ATTRIBUTE_2: VisualizationObject.IVisualizationAttribute = attribute(
    "/gdc/md/storybook/obj/5.df",
).localIdentifier("a2");

export const ATTRIBUTE_3: VisualizationObject.IVisualizationAttribute = attribute(
    "/gdc/md/storybook/obj/6.df",
).localIdentifier("a3");

export const TOTAL_M1_A1: VisualizationObject.IVisualizationTotal = {
    measureIdentifier: MEASURE_1.measure.localIdentifier,
    type: "sum",
    attributeIdentifier: ATTRIBUTE_1.visualizationAttribute.localIdentifier,
};

export const TOTAL_M1_ACOUNTRY_SUM: VisualizationObject.IVisualizationTotal = {
    measureIdentifier: MEASURE_1.measure.localIdentifier,
    type: "sum",
    attributeIdentifier: ATTRIBUTE_COUNTRY.visualizationAttribute.localIdentifier,
};

export const TOTAL_M1_ACOUNTRY_AVG: VisualizationObject.IVisualizationTotal = {
    measureIdentifier: MEASURE_1.measure.localIdentifier,
    type: "avg",
    attributeIdentifier: ATTRIBUTE_COUNTRY.visualizationAttribute.localIdentifier,
};

export const TOTAL_M2_A1: VisualizationObject.IVisualizationTotal = {
    measureIdentifier: MEASURE_2.measure.localIdentifier,
    type: "nat",
    attributeIdentifier: ATTRIBUTE_1.visualizationAttribute.localIdentifier,
};

export const ATTRIBUTE_1_SORT_ITEM: AFM.IAttributeSortItem = attributeSortItem(
    ATTRIBUTE_1.visualizationAttribute.localIdentifier,
    "asc",
);

export const MEASURE_2_SORT_ITEM: AFM.IMeasureSortItem = measureSortItem(
    MEASURE_2.measure.localIdentifier,
    "asc",
);

export const GRAND_TOTALS_WITH_SUBTOTALS: AFM.ITotalItem[] = [
    {
        type: "sum",
        attributeIdentifier: "a1",
        measureIdentifier: "m1",
    },
    {
        type: "sum",
        attributeIdentifier: "a1",
        measureIdentifier: "m2",
    },

    {
        type: "min",
        attributeIdentifier: "a2",
        measureIdentifier: "m1",
    },

    {
        type: "max",
        attributeIdentifier: "a2",
        measureIdentifier: "m1",
    },
    {
        type: "max",
        attributeIdentifier: "a2",
        measureIdentifier: "m2",
    },
];

export const GRAND_TOTAL_SUM: AFM.ITotalItem = {
    type: "sum",
    attributeIdentifier: "1st_attr_df_local_identifier",
    measureIdentifier: "1st_measure_local_identifier",
};

export const COLUMN_TOTAL_1ST_2ND_ATTR_MAX: IColumnTotal = {
    type: "max",
    attributes: ["1st_attr_df_local_identifier", "2nd_attr_df_local_identifier"],
};

export const ATTRIBUTE_HEADERS_3A_LONG_NAME: Execution.IAttributeHeader[] = [
    {
        attributeHeader: {
            formOf: {
                identifier: "1st_attr_local_identifier",
                name: "Department",
                uri: "/gdc/md/project_id/obj/1st_attr_uri_id",
            },
            identifier: "1st_attr_df_identifier",
            localIdentifier: "1st_attr_df_local_identifier",
            name: "Department Name",
            uri: "/gdc/md/project_id/obj/1st_attr_df_uri_id",
        },
    },
    {
        attributeHeader: {
            formOf: {
                identifier: "2nd_attr_local_identifier",
                name: "Region name is very long to fit the submenu so we limit characters",
                uri: "/gdc/md/project_id/obj/2nd_attr_uri_id",
            },
            identifier: "2nd_attr_df_identifier",
            localIdentifier: "2nd_attr_df_local_identifier",
            name: "Region Area",
            uri: "/gdc/md/project_id/obj/2nd_attr_df_uri_id",
        },
    },
    {
        attributeHeader: {
            formOf: {
                identifier: "3rd_attr_local_identifier",
                name: "Brand",
                uri: "/gdc/md/project_id/obj/3rd_attr_uri_id",
            },
            identifier: "3rd_attr_df_identifier",
            localIdentifier: "3rd_attr_df_local_identifier",
            name: "Brand name",
            uri: "/gdc/md/project_id/obj/3rd_attr_df_uri_id",
        },
    },
];
