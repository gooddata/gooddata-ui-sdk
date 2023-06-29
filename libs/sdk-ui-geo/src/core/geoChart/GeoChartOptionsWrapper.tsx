// (C) 2020-2022 GoodData Corporation
import React from "react";
import { invariant } from "ts-invariant";
import { IGeoData, IValidationResult } from "../../GeoChart.js";
import { isDataOfReasonableSize } from "./helpers/geoChart/common.js";
import { getGeoData } from "./helpers/geoChart/data.js";
import { GeoChartInner, IGeoChartInnerOptions, IGeoChartInnerProps } from "./GeoChartInner.js";
import { DEFAULT_DATA_POINTS_LIMIT } from "./constants/geoChart.js";
import {
    DataViewFacade,
    ErrorCodes,
    IErrorDescriptors,
    newErrorMapping,
    ErrorComponent as DefaultErrorComponent,
    LoadingComponent as DefaultLoadingComponent,
} from "@gooddata/sdk-ui";
import { isResultAttributeHeader } from "@gooddata/sdk-model";
import {
    getValidColorPalette,
    IColorStrategy,
    IPushpinCategoryLegendItem,
} from "@gooddata/sdk-ui-vis-commons";
import { getColorStrategy } from "./colorStrategy/geoChart.js";

export class GeoChartOptionsWrapper extends React.Component<IGeoChartInnerProps> {
    private readonly emptyHeaderString: string;
    private readonly nullHeaderString: string;
    private readonly errorMap: IErrorDescriptors;

    constructor(props: IGeoChartInnerProps) {
        super(props);
        this.emptyHeaderString = props.intl.formatMessage({ id: "visualization.emptyValue" });
        this.nullHeaderString = props.intl.formatMessage({ id: "visualization.emptyValue" }); // TODO: RAIL-4360 replace by proper null header string id when available
        this.errorMap = newErrorMapping(props.intl);
    }

    public render() {
        const { dataView, error, isLoading } = this.props;

        // if explicitly null, do not default the components to allow them to be disabled
        const ErrorComponent =
            this.props.ErrorComponent === null ? null : this.props.ErrorComponent ?? DefaultErrorComponent;
        const LoadingComponent =
            this.props.LoadingComponent === null
                ? null
                : this.props.LoadingComponent ?? DefaultLoadingComponent;

        if (error) {
            const errorProps =
                this.errorMap[
                    Object.prototype.hasOwnProperty.call(this.errorMap, error)
                        ? error
                        : ErrorCodes.UNKNOWN_ERROR
                ];
            return ErrorComponent ? <ErrorComponent code={error} {...errorProps} /> : null;
        }

        if (isLoading || !dataView) {
            return LoadingComponent ? <LoadingComponent /> : null;
        }

        return this.renderVisualization();
    }

    public renderVisualization(): React.ReactNode {
        const { dataView, onDataTooLarge } = this.props;

        const dv = DataViewFacade.for(dataView!);
        const geoData = getGeoData(dv, this.emptyHeaderString, this.nullHeaderString);
        const validationResult = this.validateData(geoData, this.props);

        if (validationResult?.isDataTooLarge) {
            invariant(onDataTooLarge, "GeoChart's onDataTooLarge callback is missing.");
            onDataTooLarge();

            return null;
        }

        const geoChartOptions = this.buildGeoChartOptions(geoData, this.props);
        return <GeoChartInner {...this.props} geoChartOptions={geoChartOptions} />;
    }

    private buildGeoChartOptions = (
        geoData: Readonly<IGeoData>,
        props: IGeoChartInnerProps,
    ): IGeoChartInnerOptions => {
        const { segment } = geoData;
        const { config: { colors = [], colorPalette = [], colorMapping = [] } = {}, dataView } = props;

        const dv = DataViewFacade.for(dataView!);
        const palette = getValidColorPalette(colors, colorPalette);
        const colorStrategy = getColorStrategy(palette, colorMapping, geoData, dv);

        const categoryItems = segment ? this.getCategoryLegendItems(colorStrategy) : [];

        return {
            geoData,
            categoryItems,
            colorStrategy,
            colorPalette: palette,
        };
    };

    private getCategoryLegendItems(colorStrategy: IColorStrategy): IPushpinCategoryLegendItem[] {
        return createCategoryLegendItems(colorStrategy, this.emptyHeaderString, this.nullHeaderString);
    }

    private validateData = (geoData: IGeoData, props: IGeoChartInnerProps): IValidationResult | undefined => {
        if (!props.dataView) {
            return;
        }
        const { dataView } = props;
        const limit = props.config?.limit ?? DEFAULT_DATA_POINTS_LIMIT;
        const dv = DataViewFacade.for(dataView!);

        return {
            isDataTooLarge: !isDataOfReasonableSize(dv, geoData, limit),
        };
    };
}

export function createCategoryLegendItems(
    colorStrategy: IColorStrategy,
    emptyHeaderString: string,
    nullHeaderString: string,
): IPushpinCategoryLegendItem[] {
    const colorAssignment = colorStrategy.getColorAssignment();
    return colorAssignment.map((item, legendIndex): IPushpinCategoryLegendItem => {
        const { name, uri } = isResultAttributeHeader(item.headerItem)
            ? item.headerItem.attributeHeaderItem
            : { name: emptyHeaderString, uri: emptyHeaderString };
        const color = colorStrategy.getColorByIndex(legendIndex);
        return {
            uri: uri ?? nullHeaderString,
            name: name ?? nullHeaderString,
            color,
            legendIndex,
            isVisible: true,
        };
    });
}
