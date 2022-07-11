// (C) 2007-2022 GoodData Corporation
import React, { createRef } from "react";
import Measure from "react-measure";
import { ResponsiveText } from "@gooddata/sdk-ui-kit";
import cx from "classnames";
import { HeadlineElementType } from "@gooddata/sdk-ui";
import { IChartConfig } from "../../../interfaces";
import { IFormattedHeadlineDataItem, IHeadlineData, IHeadlineDataItem } from "../Headlines";
import { formatItemValue, formatPercentageValue } from "./utils/HeadlineDataItemUtils";
import { Identifier } from "@gooddata/sdk-model";
import noop from "lodash/noop";
import {
    HeadlinePagination,
    calculateHeadlineHeightFontSize,
    shouldRenderPagination,
    getHeadlineResponsiveClassName,
} from "@gooddata/sdk-ui-vis-commons";

export interface IHeadlineFiredDrillEventItemContext {
    localIdentifier: Identifier;
    value: string | null;
    element: HeadlineElementType;
}

export type IHeadlineFiredDrillEvent = (
    itemContext?: IHeadlineFiredDrillEventItemContext,
    elementTarget?: EventTarget,
) => void;

export interface IHeadlineVisualizationProps {
    data: IHeadlineData;
    config?: IChartConfig;
    onDrill?: IHeadlineFiredDrillEvent;
    onAfterRender?: () => void;
    disableDrillUnderline?: boolean;
}

/**
 * The React component that renders the Headline visualisation.
 */
export default class Headline extends React.Component<IHeadlineVisualizationProps> {
    public static defaultProps: Pick<
        IHeadlineVisualizationProps,
        "onDrill" | "onAfterRender" | "config" | "disableDrillUnderline"
    > = {
        onDrill: () => true,
        onAfterRender: noop,
        config: {},
        disableDrillUnderline: false,
    };

    public componentDidMount(): void {
        this.props.onAfterRender();
    }

    public componentDidUpdate(): void {
        this.props.onAfterRender();
    }

    private secondaryItemTitleWrapperRef = createRef<HTMLDivElement>();

    public render() {
        return (
            <Measure client>
                {({ measureRef, contentRect }) => {
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

    private getDrillableClasses(isDrillable: boolean) {
        return isDrillable ? ["is-drillable", "s-is-drillable"] : [];
    }

    private getPrimaryItemClasses(primaryItem: IHeadlineDataItem) {
        return cx([
            "headline-primary-item",
            "s-headline-primary-item",
            ...this.getDrillableClasses(primaryItem.isDrillable),
        ]);
    }

    private getSecondaryItemClasses(secondaryItem: IHeadlineDataItem) {
        return cx([
            "gd-flex-item",
            "headline-compare-section-item",
            "headline-secondary-item",
            "s-headline-secondary-item",
            ...this.getDrillableClasses(secondaryItem.isDrillable),
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
            <div className={this.getCompareSectionClasses(clientWidth)}>
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

    private getCompareSectionClasses(clientWidth?: number): string {
        const responsiveClassName = getHeadlineResponsiveClassName(clientWidth, this.isShortenedLabel());
        return cx("gd-flex-container", "headline-compare-section", responsiveClassName);
    }

    private isShortenedLabel(): boolean {
        if (!this.secondaryItemTitleWrapperRef.current) {
            return false;
        }

        const { height } = this.secondaryItemTitleWrapperRef.current.getBoundingClientRect();
        const { lineHeight } = window.getComputedStyle(this.secondaryItemTitleWrapperRef.current);
        return height > parseFloat(lineHeight) * 2;
    }
}
