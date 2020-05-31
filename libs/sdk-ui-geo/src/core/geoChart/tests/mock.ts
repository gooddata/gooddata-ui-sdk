// (C) 2020 GoodData Corporation
import { AFM, Execution } from "@gooddata/typings";
import omit = require("lodash/omit");

import GeoChartColorStrategy from "../../../visualizations/chart/colorStrategies/geoChart";
import { IColorAssignment, DEFAULT_COLOR_PALETTE } from "../../../../interfaces/Config";
import { IGeoData } from "../../../../interfaces/GeoChart";
import {
    findGeoAttributesInDimension,
    IGeoAttributesInDimension,
} from "../../../../helpers/geoChart/executionResultHelper";
import { getAfm, IMockGeoOptions } from "../../../../../stories/data/geoChart";
import { DEFAULT_COLORS } from "../../../visualizations/utils/color";
import { IColorStrategy } from "../../../visualizations/chart/colorFactory";

function buildMockColorAssignment(props: IMockGeoOptions): IColorAssignment[] {
    const { isWithLocation, isWithSegment } = props;

    if (isWithSegment) {
        return [
            {
                headerItem: {
                    attributeHeaderItem: {
                        name: "General Goods",
                        uri: `/gdc/md/storybook/obj/23/elements?id=1`,
                    },
                },
                color: {
                    type: "guid",
                    value: "1",
                },
            },
        ];
    }

    if (isWithLocation) {
        return [
            {
                headerItem: {
                    attributeHeader: {
                        uri: "location",
                        identifier: "location",
                        localIdentifier: "location",
                        name: "location",
                        formOf: {
                            uri: "location",
                            identifier: "location",
                            name: "location",
                        },
                    },
                },
                color: {
                    type: "guid",
                    value: "1",
                },
            },
        ];
    }

    return [];
}

export function buildMockColorStrategy(
    props: IMockGeoOptions,
    execution: Execution.IExecutionResponses,
    geoData: IGeoData,
): IColorStrategy {
    const afm: AFM.IAfm = getAfm(props);
    const { locationAttribute, segmentByAttribute }: IGeoAttributesInDimension = findGeoAttributesInDimension(
        execution,
        geoData,
    );
    const locationAttributeHeader: Execution.IAttributeHeader = {
        attributeHeader: omit(locationAttribute, "items"),
    };

    const mockColorStrategy = new GeoChartColorStrategy(
        DEFAULT_COLOR_PALETTE,
        null,
        locationAttributeHeader,
        segmentByAttribute,
        execution.executionResponse,
        afm,
    );

    const mockGetColorByIndex = jest.spyOn(mockColorStrategy, "getColorByIndex");
    const mockGetColorAssignment = jest.spyOn(mockColorStrategy, "getColorAssignment");
    mockGetColorByIndex.mockImplementation(index => DEFAULT_COLORS[index]);
    mockGetColorAssignment.mockImplementation((): IColorAssignment[] => buildMockColorAssignment(props));

    return mockColorStrategy;
}
