// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import * as classNames from 'classnames';
import noop = require('lodash/noop');
import { AFM } from '@gooddata/typings';
import { VisElementType } from '../../../constants/visualizationTypes';
import ResponsiveText from '@gooddata/goodstrap/lib/ResponsiveText/ResponsiveText';
import {
    IFormattedHeadlineDataItem,
    IHeadlineData,
    IHeadlineDataItem
} from '../../../interfaces/Headlines';
import { formatItemValue, formatPercentageValue } from './utils/HeadlineDataItemUtils';

export interface IHeadlineFiredDrillEventItemContext {
    localIdentifier: AFM.Identifier;
    value: string | null;
    element: VisElementType;
}

export type IHeadlineFiredDrillEvent = (
    itemContext?: IHeadlineFiredDrillEventItemContext,
    elementTarget?: HTMLElement
) => void;

export interface IHeadlineVisualizationProps {
    data: IHeadlineData;
    onFiredDrillEvent?: IHeadlineFiredDrillEvent;
    onAfterRender?: () => void;
}

/**
 * The React component that renders the Headline visualisation.
 */
export default class Headline extends React.Component<IHeadlineVisualizationProps> {
    public static defaultProps: Partial<IHeadlineVisualizationProps> = {
        onFiredDrillEvent: () => true,
        onAfterRender: noop
    };

    constructor(props: IHeadlineVisualizationProps) {
        super(props);

        this.handleClickOnPrimaryItem = this.handleClickOnPrimaryItem.bind(this);
        this.handleClickOnSecondaryItem = this.handleClickOnSecondaryItem.bind(this);
    }

    public componentDidMount() {
        this.props.onAfterRender();
    }

    public componentDidUpdate() {
        this.props.onAfterRender();
    }

    public render() {
        return (
            <div className="headline">
                {this.renderPrimaryItem()}
                {this.renderCompareItems()}
            </div>
        );
    }

    private getDrillableClasses(isDrillable: boolean) {
        return isDrillable
            ? [
                'is-drillable',
                's-is-drillable'
            ]
            : [];
    }

    private getPrimaryItemClasses(primaryItem: IHeadlineDataItem) {
        return classNames([
            'headline-primary-item',
            's-headline-primary-item',
            ...this.getDrillableClasses(primaryItem.isDrillable)
        ]);
    }

    private getSecondaryItemClasses(secondaryItem: IHeadlineDataItem) {
        return classNames([
            'gd-flex-item',
            'headline-compare-section-item',
            'headline-secondary-item',
            's-headline-secondary-item',
            ...this.getDrillableClasses(secondaryItem.isDrillable)
        ]);
    }

    private getValueWrapperClasses(formattedItem: IFormattedHeadlineDataItem) {
        return classNames([
            'headline-value-wrapper',
            's-headline-value-wrapper'
        ], {
            'headline-value--empty': formattedItem.isValueEmpty,
            's-headline-value--empty': formattedItem.isValueEmpty
        });
    }

    private fireDrillEvent(item: IHeadlineDataItem, elementName: VisElementType, elementTarget: HTMLElement) {
        const { onFiredDrillEvent } = this.props;

        if (onFiredDrillEvent) {
            const itemContext = {
                localIdentifier: item.localIdentifier,
                value: item.value,
                element: elementName
            };

            onFiredDrillEvent(itemContext, elementTarget);
        }
    }

    private handleClickOnPrimaryItem(event: React.MouseEvent<HTMLElement>) {
        const { data: { primaryItem } } = this.props;

        this.fireDrillEvent(primaryItem, 'primaryValue', event.target as HTMLElement);
    }

    private handleClickOnSecondaryItem(event: React.MouseEvent<HTMLElement>) {
        const { data: { secondaryItem } } = this.props;

        this.fireDrillEvent(secondaryItem, 'secondaryValue', event.target as HTMLElement);
    }

    private renderTertiaryItem() {
        const { data: { tertiaryItem } } = this.props;
        const formattedItem = formatPercentageValue(tertiaryItem);

        return (
            <div className="gd-flex-item headline-compare-section-item headline-tertiary-item s-headline-tertiary-item">
                <div className={this.getValueWrapperClasses(formattedItem)}>
                    {formattedItem.value}
                </div>
                <div className="headline-title-wrapper s-headline-title-wrapper">
                    {tertiaryItem.title}
                </div>
            </div>
        );
    }

    private renderSecondaryItem() {
        const { data: { secondaryItem } } = this.props;

        const formattedItem = formatItemValue(secondaryItem);
        const valueClickCallback = secondaryItem.isDrillable ? this.handleClickOnSecondaryItem : null;

        const secondaryValue = secondaryItem.isDrillable
            ? this.renderHeadlineItemAsLink(formattedItem)
            : this.renderHeadlineItemAsValue(formattedItem);

        return (
            <div
                className={this.getSecondaryItemClasses(secondaryItem)}
                onClick={valueClickCallback}
            >
                <div className="headline-value-wrapper s-headline-value-wrapper" style={formattedItem.cssStyle}>
                    <ResponsiveText>
                        {secondaryValue}
                    </ResponsiveText>
                </div>
                <div className="headline-title-wrapper s-headline-title-wrapper">
                    {secondaryItem.title}
                </div>
            </div>
        );
    }

    private renderCompareItems() {
        const { data: { secondaryItem } } = this.props;

        if (!secondaryItem) {
            return null;
        }

        return (
            <div className="gd-flex-container headline-compare-section">
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
        const valueClassNames = classNames([
            'headline-value',
            's-headline-value'
        ], {
            'headline-value--empty': formattedItem.isValueEmpty,
            's-headline-value--empty': formattedItem.isValueEmpty
        });

        return (
            <div className={valueClassNames}>
                {formattedItem.value}
            </div>
        );
    }

    private renderHeadlineItemAsLink(formattedItem: IFormattedHeadlineDataItem) {
        return (
            <div className="headline-item-link s-headline-item-link">
                {this.renderHeadlineItemAsValue(formattedItem)}
            </div>
        );
    }

    private renderPrimaryItem() {
        const { data: { primaryItem } } = this.props;
        const formattedItem = formatItemValue(primaryItem);

        const valueClickCallback = primaryItem.isDrillable ? this.handleClickOnPrimaryItem : null;

        return (
            <div
                className={this.getPrimaryItemClasses(primaryItem)}
                style={formattedItem.cssStyle}
            >
                <ResponsiveText>
                    <div className="headline-value-wrapper" onClick={valueClickCallback}>
                        {this.renderHeadlineItem(primaryItem, formattedItem)}
                    </div>
                </ResponsiveText>
            </div>
        );
    }
}
