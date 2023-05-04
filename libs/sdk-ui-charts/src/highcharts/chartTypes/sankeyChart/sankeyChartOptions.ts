// (C) 2023 GoodData Corporation
import { ISeriesItem } from "../../typings/unsafe";
import { DataViewFacade, getMappingHeaderFormattedName, IColorAssignment } from "@gooddata/sdk-ui";
import { IUnwrappedAttributeHeadersWithItems } from "../../typings/mess";
import { getColorByGuid, getRgbStringFromRGB, valueWithEmptyHandling } from "@gooddata/sdk-ui-vis-commons";
import { IColorPalette, isRgbColor } from "@gooddata/sdk-model";
import compact from "lodash/compact";

const KEYS = ["from", "to", "weight", "name"];
const DEFAULT_ATTRIBUTE_HEADER = "";
const DEFAULT_WEIGHT = 1;

const buildNodes = (
    colorAssignments: IColorAssignment[],
    colorPalette: IColorPalette,
    emptyHeaderTitle: string,
) => {
    return colorAssignments.map((colorAssignment) => ({
        id: valueWithEmptyHandling(
            getMappingHeaderFormattedName(colorAssignment.headerItem),
            emptyHeaderTitle,
        ),
        color: isRgbColor(colorAssignment.color)
            ? getRgbStringFromRGB(colorAssignment.color.value)
            : getRgbStringFromRGB(getColorByGuid(colorPalette, colorAssignment.color.value, 0)),
    }));
};

const buildEmptyData = (dv: DataViewFacade) => {
    return [
        {
            from: DEFAULT_ATTRIBUTE_HEADER,
            to: DEFAULT_ATTRIBUTE_HEADER,
            weight: Number((dv.rawData().dataAt(0) as Array<number>)[0]) || DEFAULT_WEIGHT,
            name: DEFAULT_ATTRIBUTE_HEADER,
        },
    ];
};

const buildData = (
    dv: DataViewFacade,
    attributeHeaders: IUnwrappedAttributeHeadersWithItems[],
    emptyHeaderTitle: string,
) => {
    const [from, to] = compact(attributeHeaders);
    const isExistingAttributeHeader = from || to;

    if (!isExistingAttributeHeader) {
        return buildEmptyData(dv);
    }

    return (dv.rawData().dataAt(0) as Array<number>).map((it, index) => {
        const fromValue =
            from &&
            valueWithEmptyHandling(getMappingHeaderFormattedName(from.items[index]), emptyHeaderTitle);

        const toValue =
            to && valueWithEmptyHandling(getMappingHeaderFormattedName(to.items[index]), emptyHeaderTitle);

        return {
            from: fromValue,
            to: toValue,
            weight: Number(it),
            name: fromValue,
        };
    });
};

export const buildSankeyChartSeries = (
    dv: DataViewFacade,
    attributeHeaders: IUnwrappedAttributeHeadersWithItems[],
    colorAssignments: IColorAssignment[],
    colorPalette: IColorPalette,
    emptyHeaderTitle: string,
): ISeriesItem[] => {
    return [
        {
            keys: KEYS,
            data: buildData(dv, attributeHeaders, emptyHeaderTitle),
            nodes: buildNodes(colorAssignments, colorPalette, emptyHeaderTitle),
        },
    ];
};
