// (C) 2007-2025 GoodData Corporation

import { type MouseEvent, useCallback, useEffect, useRef } from "react";

import cx from "classnames";
import { defaultImport } from "default-import";
import ReactMeasure, { type MeasuredComponentProps } from "react-measure";

import { type HeadlineElementType } from "@gooddata/sdk-ui";
import { ResponsiveText } from "@gooddata/sdk-ui-kit";
import {
    HeadlinePagination,
    calculateHeadlineHeightFontSize,
    shouldRenderPagination,
} from "@gooddata/sdk-ui-vis-commons";

import { type IChartConfig } from "../../../../interfaces/index.js";
import { type HeadlineFiredDrillEvent } from "../interfaces/DrillEvents.js";
import {
    type IFormattedHeadlineDataItem,
    type IHeadlineData,
    type IHeadlineDataItem,
} from "../interfaces/Headlines.js";
import {
    formatItemValue,
    formatPercentageValue,
    getCompareSectionClasses,
    getDrillableClasses,
} from "../utils/HeadlineDataItemUtils.js";

const RESIZE_GUARD_TIMEOUT = 3000;

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const Measure = defaultImport(ReactMeasure);

export interface IHeadlineVisualizationProps {
    data: IHeadlineData;
    config?: IChartConfig;
    onDrill?: HeadlineFiredDrillEvent;
    onAfterRender?: () => void;
    disableDrillUnderline?: boolean;
}

/**
 * The React component that renders the Headline visualisation.
 */
export function LegacyHeadline({
    data,
    config = {},
    onDrill = () => true,
    onAfterRender = () => {},
    disableDrillUnderline = false,
}: IHeadlineVisualizationProps) {
    const secondaryItemTitleWrapperRef = useRef<HTMLDivElement>(null);
    const afterRenderGuardTimeoutIdRef = useRef<NodeJS.Timeout | null>(null);
    const afterRenderCalledRef = useRef(false);

    useEffect(() => {
        // guard if onResize would fail to resize the widget
        afterRenderGuardTimeoutIdRef.current = setTimeout(() => {
            if (!afterRenderCalledRef.current) {
                onAfterRender();
            }
        }, RESIZE_GUARD_TIMEOUT);

        return () => {
            if (afterRenderGuardTimeoutIdRef.current) {
                clearTimeout(afterRenderGuardTimeoutIdRef.current);
            }
        };
    }, [onAfterRender]);

    const getPrimaryItemClasses = useCallback((primaryItem: IHeadlineDataItem) => {
        return cx([
            "headline-primary-item",
            "s-headline-primary-item",
            ...getDrillableClasses(primaryItem.isDrillable),
        ]);
    }, []);

    const getSecondaryItemClasses = useCallback((secondaryItem: IHeadlineDataItem) => {
        return cx([
            "gd-flex-item",
            "headline-compare-section-item",
            "headline-secondary-item",
            "s-headline-secondary-item",
            ...getDrillableClasses(secondaryItem.isDrillable),
        ]);
    }, []);

    const getValueWrapperClasses = useCallback((formattedItem: IFormattedHeadlineDataItem) => {
        return cx(["headline-value-wrapper", "s-headline-value-wrapper"], {
            "headline-value--empty": formattedItem.isValueEmpty,
            "s-headline-value--empty": formattedItem.isValueEmpty,
        });
    }, []);

    const fireDrillEvent = useCallback(
        (item: IHeadlineDataItem, elementType: HeadlineElementType, elementTarget: EventTarget) => {
            if (onDrill) {
                const itemContext = {
                    localIdentifier: item.localIdentifier,
                    value: item.value,
                    element: elementType,
                };

                onDrill(itemContext, elementTarget);
            }
        },
        [onDrill],
    );

    const handleClickOnPrimaryItem = useCallback(
        (event: MouseEvent<EventTarget>) => {
            const { primaryItem } = data;

            fireDrillEvent(primaryItem, "primaryValue", event.target);
        },
        [data, fireDrillEvent],
    );

    const handleClickOnSecondaryItem = useCallback(
        (event: MouseEvent<EventTarget>) => {
            const { secondaryItem } = data;

            fireDrillEvent(secondaryItem, "secondaryValue", event.target);
        },
        [data, fireDrillEvent],
    );

    const renderTertiaryItem = useCallback(() => {
        const { tertiaryItem } = data;
        const formattedItem = formatPercentageValue(tertiaryItem);

        return (
            <div className="gd-flex-item headline-compare-section-item headline-tertiary-item s-headline-tertiary-item">
                <div className={getValueWrapperClasses(formattedItem)}>{formattedItem.value}</div>
                <div className="headline-title-wrapper s-headline-title-wrapper" title={tertiaryItem.title}>
                    {tertiaryItem.title}
                </div>
            </div>
        );
    }, [data, getValueWrapperClasses]);

    const renderHeadlineItemAsValue = useCallback(
        (formattedItem: IFormattedHeadlineDataItem) => {
            const valueClassNames = cx(["headline-value", "s-headline-value"], {
                "headline-value--empty": formattedItem.isValueEmpty,
                "s-headline-value--empty": formattedItem.isValueEmpty,
                "headline-link-style-underline": !disableDrillUnderline,
            });

            return <div className={valueClassNames}>{formattedItem.value}</div>;
        },
        [disableDrillUnderline],
    );

    const renderHeadlineItemAsLink = useCallback(
        (formattedItem: IFormattedHeadlineDataItem) => {
            return (
                <div className="headline-item-link s-headline-item-link">
                    {renderHeadlineItemAsValue(formattedItem)}
                </div>
            );
        },
        [renderHeadlineItemAsValue],
    );

    const renderHeadlineItem = useCallback(
        (item: IHeadlineDataItem, formattedItem: IFormattedHeadlineDataItem) => {
            return item.isDrillable
                ? renderHeadlineItemAsLink(formattedItem)
                : renderHeadlineItemAsValue(formattedItem);
        },
        [renderHeadlineItemAsLink, renderHeadlineItemAsValue],
    );

    const renderSecondaryItem = useCallback(() => {
        const { secondaryItem } = data;

        const formattedItem = formatItemValue(secondaryItem, config);
        const valueClickCallback = secondaryItem.isDrillable ? handleClickOnSecondaryItem : null;

        const secondaryValue = secondaryItem.isDrillable
            ? renderHeadlineItemAsLink(formattedItem)
            : renderHeadlineItemAsValue(formattedItem);

        return (
            <div className={getSecondaryItemClasses(secondaryItem)} onClick={valueClickCallback}>
                <div
                    className="headline-value-wrapper s-headline-value-wrapper"
                    style={formattedItem.cssStyle}
                >
                    <ResponsiveText>{secondaryValue}</ResponsiveText>
                </div>
                <div
                    className="headline-title-wrapper s-headline-title-wrapper"
                    title={secondaryItem.title}
                    ref={secondaryItemTitleWrapperRef}
                >
                    {secondaryItem.title}
                </div>
            </div>
        );
    }, [
        data,
        config,
        handleClickOnSecondaryItem,
        renderHeadlineItemAsLink,
        renderHeadlineItemAsValue,
        getSecondaryItemClasses,
    ]);

    const renderCompareItems = useCallback(
        (clientWidth?: number, clientHeight?: number) => {
            const { secondaryItem } = data;

            if (!secondaryItem) {
                return null;
            }

            const pagination = shouldRenderPagination(config.enableCompactSize, clientWidth, clientHeight);

            if (pagination) {
                return (
                    <div className="gd-flex-container headline-compare-section headline-paginated-compare-section">
                        <HeadlinePagination
                            renderSecondaryItem={renderSecondaryItem}
                            renderTertiaryItem={renderTertiaryItem}
                        />
                    </div>
                );
            }

            return (
                <div className={getCompareSectionClasses(clientWidth, secondaryItemTitleWrapperRef)}>
                    {renderTertiaryItem()}
                    {renderSecondaryItem()}
                </div>
            );
        },
        [config.enableCompactSize, data, renderSecondaryItem, renderTertiaryItem],
    );

    const renderPrimaryItem = useCallback(
        (clientHeight?: number) => {
            const { primaryItem, secondaryItem } = data;

            const formattedItem = formatItemValue(primaryItem, config);
            const valueClickCallback = primaryItem.isDrillable ? handleClickOnPrimaryItem : null;

            if (config.enableCompactSize) {
                if (!clientHeight) {
                    return null;
                }
                const { height, fontSize } = calculateHeadlineHeightFontSize(!!secondaryItem, clientHeight);
                const heightStyles = { height: `${height}px`, lineHeight: `${height}px` };

                return (
                    <div
                        className={getPrimaryItemClasses(primaryItem)}
                        style={{
                            ...formattedItem.cssStyle,
                            ...heightStyles,
                        }}
                    >
                        <div style={{ fontSize: `${fontSize}px` }}>
                            <ResponsiveText>
                                <div className="headline-value-wrapper" onClick={valueClickCallback}>
                                    {renderHeadlineItem(primaryItem, formattedItem)}
                                </div>
                            </ResponsiveText>
                        </div>
                    </div>
                );
            }

            return (
                <div className={getPrimaryItemClasses(primaryItem)} style={formattedItem.cssStyle}>
                    <ResponsiveText>
                        <div className="headline-value-wrapper" onClick={valueClickCallback}>
                            {renderHeadlineItem(primaryItem, formattedItem)}
                        </div>
                    </ResponsiveText>
                </div>
            );
        },
        [config, data, getPrimaryItemClasses, handleClickOnPrimaryItem, renderHeadlineItem],
    );

    return (
        <Measure
            client
            onResize={(dimensions) => {
                if (
                    dimensions?.client?.width > 0 &&
                    dimensions?.client?.height > 0 &&
                    !afterRenderCalledRef.current
                ) {
                    onAfterRender();
                    afterRenderCalledRef.current = true;
                }
            }}
        >
            {({ measureRef, contentRect }: MeasuredComponentProps) => {
                return (
                    <div className="headline" ref={measureRef}>
                        {renderPrimaryItem(contentRect.client?.height)}
                        {renderCompareItems(contentRect.client?.width, contentRect.client?.height)}
                    </div>
                );
            }}
        </Measure>
    );
}
