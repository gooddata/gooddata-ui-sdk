// (C) 2007-2025 GoodData Corporation
import React, { createRef } from "react";
import ReactMeasure, { MeasuredComponentProps } from "react-measure";
import { ResponsiveText } from "@gooddata/sdk-ui-kit";
import cx from "classnames";
import { HeadlineElementType } from "@gooddata/sdk-ui";
import { IChartConfig } from "../../../../interfaces/index.js";
import { IFormattedHeadlineDataItem, IHeadlineData, IHeadlineDataItem } from "../interfaces/Headlines.js";
import {
    formatItemValue,
    formatPercentageValue,
    getCompareSectionClasses,
    getDrillableClasses,
} from "../utils/HeadlineDataItemUtils.js";
import noop from "lodash/noop.js";
import {
    HeadlinePagination,
    calculateHeadlineHeightFontSize,
    shouldRenderPagination,
} from "@gooddata/sdk-ui-vis-commons";
import { defaultImport } from "default-import";
import { HeadlineFiredDrillEvent } from "../interfaces/DrillEvents.js";

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
export default class LegacyHeadline extends React.Component<IHeadlineVisualizationProps> {
    public static defaultProps: Pick<
        IHeadlineVisualizationProps,
        "onDrill" | "onAfterRender" | "config" | "disableDrillUnderline"
    > = {
        onDrill: () => true,
        onAfterRender: noop,
        config: {},
        disableDrillUnderline: false,
    };

    private secondaryItemTitleWrapperRef = createRef<HTMLDivElement>();
    private afterRenderGuardTimeoutId;
    private afterRenderCalled = false;

    public componentDidMount(): void {
        // guard if onResize would fail to resize the widget
        this.afterRenderGuardTimeoutId = setTimeout(() => {
            if (!this.afterRenderCalled) {
                this.props.onAfterRender();
            }
        }, RESIZE_GUARD_TIMEOUT);
    }

    public componentWillUnmount() {
        clearTimeout(this.afterRenderGuardTimeoutId);
    }

    public render() {
        return (
            <Measure
                client={true}
                onResize={(dimensions) => {
                    if (
                        dimensions?.client?.width > 0 &&
                        dimensions?.client?.height > 0 &&
                        !this.afterRenderCalled
                    ) {
                        this.props.onAfterRender();
                        this.afterRenderCalled = true;
                    }
                }}
            >
                {({ measureRef, contentRect }: MeasuredComponentProps) => {
                    return (
                        <div className="headline" ref={measureRef}>
                            {this.renderPrimaryItem(contentRect.client?.height)}
                            {this.renderCompareItems(contentRect.client?.width, contentRect.client?.height)}
                        </div>
                    );
                }}
            </Measure>
        );
    }

    private getPrimaryItemClasses(primaryItem: IHeadlineDataItem) {
        return cx([
            "headline-primary-item",
            "s-headline-primary-item",
            ...getDrillableClasses(primaryItem.isDrillable),
        ]);
    }

    private getSecondaryItemClasses(secondaryItem: IHeadlineDataItem) {
        return cx([
            "gd-flex-item",
            "headline-compare-section-item",
            "headline-secondary-item",
            "s-headline-secondary-item",
            ...getDrillableClasses(secondaryItem.isDrillable),
        ]);
    }

    private getValueWrapperClasses(formattedItem: IFormattedHeadlineDataItem) {
        return cx(["headline-value-wrapper", "s-headline-value-wrapper"], {
            "headline-value--empty": formattedItem.isValueEmpty,
            "s-headline-value--empty": formattedItem.isValueEmpty,
        });
    }

    private fireDrillEvent(
        item: IHeadlineDataItem,
        elementType: HeadlineElementType,
        elementTarget: EventTarget,
    ) {
        const { onDrill } = this.props;

        if (onDrill) {
            const itemContext = {
                localIdentifier: item.localIdentifier,
                value: item.value,
                element: elementType,
            };

            onDrill(itemContext, elementTarget);
        }
    }

    private handleClickOnPrimaryItem = (event: React.MouseEvent<EventTarget>) => {
        const {
            data: { primaryItem },
        } = this.props;

        this.fireDrillEvent(primaryItem, "primaryValue", event.target);
    };

    private handleClickOnSecondaryItem = (event: React.MouseEvent<EventTarget>) => {
        const {
            data: { secondaryItem },
        } = this.props;

        this.fireDrillEvent(secondaryItem, "secondaryValue", event.target);
    };

    private renderTertiaryItem = () => {
        const {
            data: { tertiaryItem },
        } = this.props;
        const formattedItem = formatPercentageValue(tertiaryItem);

        return (
            <div className="gd-flex-item headline-compare-section-item headline-tertiary-item s-headline-tertiary-item">
                <div className={this.getValueWrapperClasses(formattedItem)}>{formattedItem.value}</div>
                <div className="headline-title-wrapper s-headline-title-wrapper" title={tertiaryItem.title}>
                    {tertiaryItem.title}
                </div>
            </div>
        );
    };

    private renderSecondaryItem = () => {
        const {
            data: { secondaryItem },
            config,
        } = this.props;

        const formattedItem = formatItemValue(secondaryItem, config);
        const valueClickCallback = secondaryItem.isDrillable ? this.handleClickOnSecondaryItem : null;

        const secondaryValue = secondaryItem.isDrillable
            ? this.renderHeadlineItemAsLink(formattedItem)
            : this.renderHeadlineItemAsValue(formattedItem);

        return (
            <div className={this.getSecondaryItemClasses(secondaryItem)} onClick={valueClickCallback}>
                <div
                    className="headline-value-wrapper s-headline-value-wrapper"
                    style={formattedItem.cssStyle}
                >
                    <ResponsiveText>{secondaryValue}</ResponsiveText>
                </div>
                <div
                    className="headline-title-wrapper s-headline-title-wrapper"
                    title={secondaryItem.title}
                    ref={this.secondaryItemTitleWrapperRef}
                >
                    {secondaryItem.title}
                </div>
            </div>
        );
    };

    private renderCompareItems(clientWidth?: number, clientHeight?: number) {
        const {
            data: { secondaryItem },
            config,
        } = this.props;

        if (!secondaryItem) {
            return null;
        }

        const pagination = shouldRenderPagination(config.enableCompactSize, clientWidth, clientHeight);

        if (pagination) {
            return (
                <div className="gd-flex-container headline-compare-section headline-paginated-compare-section">
                    <HeadlinePagination
                        renderSecondaryItem={this.renderSecondaryItem}
                        renderTertiaryItem={this.renderTertiaryItem}
                    />
                </div>
            );
        }

        return (
            <div className={getCompareSectionClasses(clientWidth, this.secondaryItemTitleWrapperRef)}>
                {this.renderTertiaryItem()}
                {this.renderSecondaryItem()}
            </div>
        );
    }

    private renderHeadlineItem(item: IHeadlineDataItem, formattedItem: IFormattedHeadlineDataItem) {
        return item.isDrillable
            ? this.renderHeadlineItemAsLink(formattedItem)
            : this.renderHeadlineItemAsValue(formattedItem);
    }

    private renderHeadlineItemAsValue(formattedItem: IFormattedHeadlineDataItem) {
        const valueClassNames = cx(["headline-value", "s-headline-value"], {
            "headline-value--empty": formattedItem.isValueEmpty,
            "s-headline-value--empty": formattedItem.isValueEmpty,
            "headline-link-style-underline": !this.props.disableDrillUnderline,
        });

        return <div className={valueClassNames}>{formattedItem.value}</div>;
    }

    private renderHeadlineItemAsLink(formattedItem: IFormattedHeadlineDataItem) {
        return (
            <div className="headline-item-link s-headline-item-link">
                {this.renderHeadlineItemAsValue(formattedItem)}
            </div>
        );
    }

    private renderPrimaryItem(clientHeight?: number) {
        const {
            data: { primaryItem, secondaryItem },
            config,
        } = this.props;

        const formattedItem = formatItemValue(primaryItem, config);
        const valueClickCallback = primaryItem.isDrillable ? this.handleClickOnPrimaryItem : null;

        if (config.enableCompactSize) {
            if (!clientHeight) {
                return null;
            }
            const { height, fontSize } = calculateHeadlineHeightFontSize(!!secondaryItem, clientHeight);
            const heightStyles = { height: `${height}px`, lineHeight: `${height}px` };

            return (
                <div
                    className={this.getPrimaryItemClasses(primaryItem)}
                    style={{
                        ...formattedItem.cssStyle,
                        ...heightStyles,
                    }}
                >
                    <div style={{ fontSize: `${fontSize}px` }}>
                        <ResponsiveText>
                            <div className="headline-value-wrapper" onClick={valueClickCallback}>
                                {this.renderHeadlineItem(primaryItem, formattedItem)}
                            </div>
                        </ResponsiveText>
                    </div>
                </div>
            );
        }

        return (
            <div className={this.getPrimaryItemClasses(primaryItem)} style={formattedItem.cssStyle}>
                <ResponsiveText>
                    <div className="headline-value-wrapper" onClick={valueClickCallback}>
                        {this.renderHeadlineItem(primaryItem, formattedItem)}
                    </div>
                </ResponsiveText>
            </div>
        );
    }
}
