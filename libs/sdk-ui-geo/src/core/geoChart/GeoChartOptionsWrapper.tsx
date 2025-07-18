// (C) 2020-2025 GoodData Corporation
import { useMemo } from "react";
import { invariant } from "ts-invariant";
import { IGeoData, IValidationResult } from "../../GeoChart.js";
import { getGeoAttributeHeaderItems, isDataOfReasonableSize } from "./helpers/geoChart/common.js";
import { getGeoData } from "./helpers/geoChart/data.js";
import { GeoChartInner, IGeoChartInnerOptions, IGeoChartInnerProps } from "./GeoChartInner.js";
import { DEFAULT_DATA_POINTS_LIMIT } from "./constants/geoChart.js";
import {
    DataViewFacade,
    ErrorCodes,
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

export function GeoChartOptionsWrapper(props: IGeoChartInnerProps) {
    const emptyHeaderString = useMemo(
        () => props.intl.formatMessage({ id: "visualization.emptyValue" }),
        [props.intl],
    );
    const nullHeaderString = useMemo(
        () => props.intl.formatMessage({ id: "visualization.emptyValue" }),
        [props.intl],
    ); // TODO: RAIL-4360 replace by proper null header string id when available
    const errorMap = useMemo(() => newErrorMapping(props.intl), [props.intl]);

    const validateData = (geoData: IGeoData, props: IGeoChartInnerProps): IValidationResult | undefined => {
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

    const getCategoryLegendItems = (colorStrategy: IColorStrategy): IPushpinCategoryLegendItem[] => {
        return createCategoryLegendItems(colorStrategy, emptyHeaderString, nullHeaderString);
    };

    const buildGeoChartOptions = (
        geoData: Readonly<IGeoData>,
        props: IGeoChartInnerProps,
    ): IGeoChartInnerOptions => {
        const { segment } = geoData;
        const { config: { colors = [], colorPalette = [], colorMapping = [] } = {}, dataView } = props;

        const dv = DataViewFacade.for(dataView!);
        const palette = getValidColorPalette(colors, colorPalette);
        const colorStrategy = getColorStrategy(palette, colorMapping, geoData, dv);

        const categoryItems = segment ? getCategoryLegendItems(colorStrategy) : [];

        return {
            geoData,
            categoryItems,
            colorStrategy,
            colorPalette: palette,
        };
    };

    const renderVisualization = (): React.ReactNode => {
        const { dataView, onDataTooLarge } = props;

        const dv = DataViewFacade.for(dataView!);
        const geoData = getGeoData(dv, emptyHeaderString, nullHeaderString);
        const validationResult = validateData(geoData, props);

        if (validationResult?.isDataTooLarge) {
            invariant(onDataTooLarge, "GeoChart's onDataTooLarge callback is missing.");

            const { location } = geoData;
            const attributeHeaderItems = getGeoAttributeHeaderItems(dv, geoData);
            const locationData = location !== undefined ? attributeHeaderItems[location.index] : [];

            const limit = props.config?.limit ?? DEFAULT_DATA_POINTS_LIMIT;
            const errorMessage = `LocationData limit: ${limit} actual: ${locationData.length}`;

            onDataTooLarge(undefined, errorMessage);

            return null;
        }

        const geoChartOptions = buildGeoChartOptions(geoData, props);
        return <GeoChartInner {...props} geoChartOptions={geoChartOptions} />;
    };

    const { dataView, error, isLoading } = props;

    // if explicitly null, do not default the components to allow them to be disabled
    const ErrorComponent =
        props.ErrorComponent === null ? null : (props.ErrorComponent ?? DefaultErrorComponent);
    const LoadingComponent =
        props.LoadingComponent === null ? null : (props.LoadingComponent ?? DefaultLoadingComponent);

    if (error) {
        const errorProps =
            errorMap[
                Object.prototype.hasOwnProperty.call(errorMap, error) ? error : ErrorCodes.UNKNOWN_ERROR
            ];
        return ErrorComponent ? <ErrorComponent code={error} {...errorProps} /> : null;
    }

    if (isLoading || !dataView) {
        return LoadingComponent ? <LoadingComponent /> : null;
    }

    return renderVisualization();
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
