// (C) 2007-2025 GoodData Corporation
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { IResultAttributeHeader } from "@gooddata/sdk-model";
import { IMappingHeader } from "@gooddata/sdk-ui";
import { IColorMapping } from "@gooddata/sdk-ui-vis-commons";

const SANKEY_PREDICATE = (header: IMappingHeader, name: string) => {
    return (header as IResultAttributeHeader).attributeHeaderItem.name === name;
};

export const CHART_TYPE = "sankey";
export const DEFAULT_TOOLTIP_CONTENT_WIDTH = 320;
export const EMPTY_HEADER_TITLE_VALUE = "(empty value)";
export const COLOR_MAPPINGS: IColorMapping[] = [
    {
        predicate: (header) => SANKEY_PREDICATE(header, "WonderKid"),
        color: {
            type: "rgb",
            value: { r: 0, g: 0, b: 0 },
        },
    },
    {
        predicate: (header) => SANKEY_PREDICATE(header, "Explorer"),
        color: {
            type: "rgb",
            value: { r: 255, g: 0, b: 0 },
        },
    },
];

export const RECORDS: Array<string | any>[] = [
    [
        "1 measure and 2 attributes",
        ReferenceRecordings.Scenarios.SankeyChart.MeasureAttributeFromAndAttributeTo,
    ],
    ["1 measure and 1 attribute_from", ReferenceRecordings.Scenarios.SankeyChart.MeasureAndAttributeFrom],
    ["1 measure and 1 attribute_to", ReferenceRecordings.Scenarios.SankeyChart.MeasureAndAttributeTo],
    ["1 measure and 0 attribute", ReferenceRecordings.Scenarios.SankeyChart.MeasureOnly],
];

export const RECORDS_WITHOUT_EMPTY_ATTRIBUTE: Array<string | any>[] = RECORDS.slice(0, 3);
