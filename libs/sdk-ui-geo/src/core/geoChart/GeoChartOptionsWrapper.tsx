// (C) 2020-2025 GoodData Corporation

import { type ComponentType, useCallback, useMemo } from "react";

import { invariant } from "ts-invariant";

import { isResultAttributeHeader } from "@gooddata/sdk-model";
import {
    DataViewFacade,
    ErrorComponent as DefaultErrorComponent,
    LoadingComponent as DefaultLoadingComponent,
    ErrorCodes,
    type IErrorProps,
    VisualizationTypes,
    newErrorMapping,
} from "@gooddata/sdk-ui";
import {
    type IColorStrategy,
    type IPushpinCategoryLegendItem,
    getValidColorPalette,
} from "@gooddata/sdk-ui-vis-commons";

import { getColorStrategy } from "./colorStrategy/geoChart.js";
import { DEFAULT_DATA_POINTS_LIMIT } from "./constants/geoChart.js";
import { GeoChartInner, type IGeoChartInnerOptions, type IGeoChartInnerProps } from "./GeoChartInner.js";
import { type IGeoData, type IValidationResult } from "../../GeoChart.js";
import { getGeoAttributeHeaderItems, isDataOfReasonableSize } from "./helpers/geoChart/common.js";
import { getGeoData } from "./helpers/geoChart/data.js";

function resolveOptionalComponent<T>(
    component: ComponentType<T> | null | undefined,
    defaultComponent: ComponentType<T>,
): ComponentType<T> | null {
    // if explicitly null, do not default the components to allow them to be disabled
    if (component === null) {
        return null;
    }
    return component ?? defaultComponent;
}

function getErrorKey(errorMap: Record<string, IErrorProps>, error: string): string {
    return Object.prototype.hasOwnProperty.call(errorMap, error) ? error : ErrorCodes.UNKNOWN_ERROR;
}

function validateGeoData(geoData: IGeoData, props: IGeoChartInnerProps): IValidationResult | undefined {
    if (!props.dataView) {
        return;
    }
    const { dataView } = props;
    const limit = props.config?.limit ?? DEFAULT_DATA_POINTS_LIMIT;
    const dv = DataViewFacade.for(dataView!);

    return {
        isDataTooLarge: !isDataOfReasonableSize(dv, geoData, limit),
    };
}

function handleDataTooLarge(geoData: IGeoData, dv: DataViewFacade, props: IGeoChartInnerProps): void {
    const { onDataTooLarge } = props;
    invariant(onDataTooLarge, "GeoChart's onDataTooLarge callback is missing.");

    const { location } = geoData;
    const attributeHeaderItems = getGeoAttributeHeaderItems(dv, geoData);
    const locationData = location === undefined ? [] : attributeHeaderItems[location.index];

    const limit = props.config?.limit ?? DEFAULT_DATA_POINTS_LIMIT;
    const errorMessage = `LocationData limit: ${limit} actual: ${locationData.length}`;

    onDataTooLarge(undefined, errorMessage);
}

export function GeoChartOptionsWrapper(props: IGeoChartInnerProps) {
    const emptyHeaderString = useMemo(
        () => props.intl.formatMessage({ id: "visualization.emptyValue" }),
        [props.intl],
    );
    const nullHeaderString = useMemo(
        () => props.intl.formatMessage({ id: "visualization.emptyValue" }), // TODO: RAIL-4360 replace by proper null header string id when available
        [props.intl],
    );
    const errorMap = useMemo(() => newErrorMapping(props.intl), [props.intl]);

    const getCategoryLegendItems = useCallback(
        (colorStrategy: IColorStrategy): IPushpinCategoryLegendItem[] => {
            return createCategoryLegendItems(colorStrategy, emptyHeaderString, nullHeaderString);
        },
        [emptyHeaderString, nullHeaderString],
    );

    const buildGeoChartOptions = useCallback(
        (geoData: Readonly<IGeoData>, props: IGeoChartInnerProps): IGeoChartInnerOptions => {
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
        },
        [getCategoryLegendItems],
    );

    const renderVisualization = useCallback(() => {
        const { dataView } = props;

        const dv = DataViewFacade.for(dataView!);
        const geoData = getGeoData(dv, emptyHeaderString, nullHeaderString);
        const validationResult = validateGeoData(geoData, props);

        if (validationResult?.isDataTooLarge) {
            handleDataTooLarge(geoData, dv, props);
            return null;
        }

        const geoChartOptions = buildGeoChartOptions(geoData, props);
        return <GeoChartInner {...props} geoChartOptions={geoChartOptions} />;
    }, [buildGeoChartOptions, emptyHeaderString, nullHeaderString, props]);

    const { dataView, error, isLoading } = props;

    const ErrorComponent = resolveOptionalComponent(props.ErrorComponent, DefaultErrorComponent);
    const LoadingComponent = resolveOptionalComponent(props.LoadingComponent, DefaultLoadingComponent);

    if (error) {
        const errorProps = errorMap[getErrorKey(errorMap, error)];
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
            type: VisualizationTypes.PUSHPIN,
            uri: uri ?? nullHeaderString,
            name: name ?? nullHeaderString,
            color,
            legendIndex,
            isVisible: true,
        };
    });
}
