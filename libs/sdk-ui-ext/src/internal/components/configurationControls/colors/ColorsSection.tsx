// (C) 2019-2026 GoodData Corporation

import { type ReactNode } from "react";

import { useIntl } from "react-intl";

import { type IColor, isMeasureDescriptor } from "@gooddata/sdk-model";
import { type ChartFillType, type LineStyle } from "@gooddata/sdk-ui-charts";

import { messages } from "../../../../locales.js";
import { fillDropdownItems } from "../../../constants/dropdowns.js";
import { type IColorConfiguration, type IColoredItem } from "../../../interfaces/Colors.js";
import { type IReferences, type IVisualizationProperties } from "../../../interfaces/Visualization.js";
import {
    getColoredInputItems,
    getLineStyleProperties,
    getMappingHeaderId,
    getProperties,
    removeColorMappingFromProperties,
} from "../../../utils/colors.js";
import { getTranslatedDropdownItems, getTranslation } from "../../../utils/translations.js";
import { ConfigSection } from "../../configurationControls/ConfigSection.js";
import { DropdownControl } from "../DropdownControl.js";

import { ColoredItemsList } from "./coloredItemsList/ColoredItemsList.js";

export interface IColorsSectionProps {
    controlsDisabled: boolean;
    properties?: IVisualizationProperties;
    propertiesMeta?: any;
    references?: IReferences;
    pushData?: (data: any) => void;
    hasMeasures: boolean;
    colors?: IColorConfiguration;
    isLoading?: boolean;
    supportsChartFill?: boolean;
    chartFillIgnoredMeasures?: string[];
    isChartFillDisabled?: boolean;
    /** Optional controls rendered above the fill dropdown, inside the section. */
    additionalControls?: ReactNode;
    supportsLineStyles?: boolean;
}

export const COLOR_MAPPING_CHANGED = "COLOR_MAPPING_CHANGED";

export function ColorsSection({
    controlsDisabled,
    properties,
    propertiesMeta,
    pushData,
    hasMeasures,
    colors,
    isLoading,
    supportsChartFill,
    chartFillIgnoredMeasures = [],
    isChartFillDisabled,
    additionalControls,
    supportsLineStyles,
}: IColorsSectionProps) {
    const intl = useIntl();
    const onSelect = (selectedColorItem: IColoredItem, color: IColor) => {
        const { mappingHeader } = selectedColorItem;
        const result = getProperties(properties!, mappingHeader!, color);

        const message = {
            messageId: COLOR_MAPPING_CHANGED,
            properties: result,
        };

        pushData?.(message);
    };

    const onLineStyleOrWidthChange = (
        item: IColoredItem,
        lineStyle: LineStyle | undefined,
        lineWidth: (1 | 2 | 3 | 4) | undefined,
    ) => {
        const { mappingHeader } = item;
        if (!mappingHeader || !properties || !isMeasureDescriptor(mappingHeader)) {
            return;
        }
        const localId = mappingHeader.measureHeaderItem.localIdentifier;
        if (!localId) {
            return;
        }
        const newProperties = getLineStyleProperties(properties, localId, lineStyle, lineWidth);
        pushData?.({ messageId: COLOR_MAPPING_CHANGED, properties: newProperties });
    };

    const onLineStyleChange = (item: IColoredItem, lineStyle: LineStyle) =>
        onLineStyleOrWidthChange(item, lineStyle, item.lineWidth);

    const onLineWidthChange = (item: IColoredItem, lineWidth: 1 | 2 | 3 | 4) =>
        onLineStyleOrWidthChange(item, item.lineStyle, lineWidth);

    const isColoredListVisible = () => {
        return isLoading || (!controlsDisabled && colors?.colorPalette && hasMeasures);
    };

    const onResetItem = (item: IColoredItem) => {
        const id = item.mappingHeader ? getMappingHeaderId(item.mappingHeader) : undefined;
        if (id === undefined) {
            return;
        }
        pushData?.({
            messageId: COLOR_MAPPING_CHANGED,
            properties: removeColorMappingFromProperties(properties!, id),
        });
    };

    const renderFillDropdown = () => {
        if (!supportsChartFill) {
            return null;
        }
        // when all colors are used for disabled measures, chart fill is not available
        const isDisabled =
            controlsDisabled ||
            isChartFillDisabled ||
            chartFillIgnoredMeasures.length === colors?.colorAssignments.length;
        const currentChartFillValue: ChartFillType = isChartFillDisabled
            ? "solid"
            : (properties?.controls?.["chartFill"]?.type ?? "solid");
        return (
            <div className="gd-chart-fill-section">
                <DropdownControl
                    value={currentChartFillValue}
                    valuePath="chartFill.type"
                    labelText={messages["fill"].id}
                    disabled={isDisabled}
                    properties={properties}
                    pushData={pushData}
                    items={getTranslatedDropdownItems(fillDropdownItems, intl)}
                    showDisabledMessage={isDisabled}
                />
            </div>
        );
    };

    const renderColoredList = () => {
        const lineStyleMapping = supportsLineStyles
            ? (properties?.controls?.["lineStyleMapping"] ?? [])
            : undefined;
        const inputItems = getColoredInputItems(
            colors,
            lineStyleMapping,
            properties?.controls?.["colorMapping"],
        );
        const colorPalette = colors?.colorPalette ? colors.colorPalette : [];
        const chartFill = isChartFillDisabled ? undefined : properties?.controls?.["chartFill"];

        return (
            <>
                <ColoredItemsList
                    colorPalette={colorPalette}
                    inputItems={inputItems}
                    onSelect={onSelect}
                    onResetItem={onResetItem}
                    disabled={controlsDisabled}
                    isLoading={isLoading}
                    chartFill={chartFill}
                    chartFillIgnoredMeasures={chartFillIgnoredMeasures}
                    supportsLineStyles={supportsLineStyles}
                    onLineStyleChange={supportsLineStyles ? onLineStyleChange : undefined}
                    onLineWidthChange={supportsLineStyles ? onLineWidthChange : undefined}
                />
                {additionalControls}
                {renderFillDropdown()}
            </>
        );
    };

    const renderUnsupportedColoredList = () => {
        return (
            <div className="gd-color-unsupported">
                {getTranslation(messages["unsupportedColors"].id, intl)}
            </div>
        );
    };

    const renderSectionContents = () => {
        return isColoredListVisible() ? renderColoredList() : renderUnsupportedColoredList();
    };

    const sectionTitleTranslationId = supportsLineStyles
        ? messages["colorsAndStyles"].id
        : supportsChartFill
          ? messages["colorsAndFills"].id
          : messages["colors"].id;

    return (
        <ConfigSection
            title={sectionTitleTranslationId}
            pushData={pushData}
            propertiesMeta={propertiesMeta}
            id="colors_section"
            className="adi-color-configuration"
        >
            {renderSectionContents()}
        </ConfigSection>
    );
}
