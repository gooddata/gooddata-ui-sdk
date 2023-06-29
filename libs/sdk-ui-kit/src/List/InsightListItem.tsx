// (C) 2007-2022 GoodData Corporation
import React, { Component, createRef } from "react";
import cx from "classnames";
import { injectIntl, WrappedComponentProps } from "react-intl";

import { stringUtils } from "@gooddata/util";

import { InsightListItemDate, getDateTimeConfig } from "./InsightListItemDate.js";
import { Button } from "../Button/index.js";
import { ShortenedText } from "../ShortenedText/index.js";
import { DescriptionPanel, DESCRIPTION_PANEL_ARROW_OFFSETS } from "../DescriptionPanel/index.js";

const VISUALIZATION_TYPE_UNKNOWN = "unknown";
const WIDGET_TYPE_KPI = "kpi";

const visualizationIconWidthAndPadding = 42;

const tooltipAlignPoints = [
    {
        align: "cr cl",
    },
    {
        align: "cl cr",
        offset: {
            x: -visualizationIconWidthAndPadding,
            y: 0,
        },
    },
];

const modifiedArrowOffsets = {
    ...DESCRIPTION_PANEL_ARROW_OFFSETS,
    "cr cl": [30, 0],
};

/**
 * @internal
 */
export interface IInsightListItemProps {
    isLoading?: boolean;
    isLocked?: boolean;
    isSelected?: boolean;

    title?: string;
    description?: string;
    updated?: string;
    type?: string;
    width?: number;

    onClick?: () => void;
    onDelete?: () => void;
    onDescriptionPanelOpen?: () => void;

    showDescriptionPanel?: boolean;
}

/**
 * @internal
 */
export class InsightListItemCore extends Component<IInsightListItemProps & WrappedComponentProps> {
    private shortenedTextRef = createRef<ShortenedText>();

    public render(): JSX.Element {
        const {
            title,
            description,
            updated,
            type = VISUALIZATION_TYPE_UNKNOWN,
            isSelected,
            isLoading,
            onClick,
            onDescriptionPanelOpen,
            showDescriptionPanel = false,
        } = this.props;

        const iconClassName = cx("gd-vis-type", `gd-vis-type-${type}`);

        const visualizationListItemClassname = cx(
            "gd-visualizations-list-item",
            `s-${stringUtils.simplifyText(title)}`,
            {
                "is-selected": isSelected,
            },
        );

        return (
            <div className={visualizationListItemClassname} onClick={onClick}>
                {/* reversed order of items because of hover effect for whole item when hovering over trash bin - css hack with flex-direction: row-reverse; */}
                {this.renderActions()}
                {showDescriptionPanel ? (
                    <div className="gd-visualizations-list-item-description">
                        <DescriptionPanel
                            onBubbleOpen={onDescriptionPanelOpen}
                            title={title}
                            description={description}
                            arrowOffsets={this.shouldRenderActions() ? modifiedArrowOffsets : undefined}
                        />
                    </div>
                ) : null}
                <div className="gd-visualizations-list-item-content">
                    <div className="gd-visualizations-list-item-content-name">
                        {this.renderLock()}
                        <ShortenedText
                            ref={this.shortenedTextRef}
                            tooltipAlignPoints={tooltipAlignPoints}
                            displayTooltip={!showDescriptionPanel}
                        >
                            {isLoading
                                ? this.props.intl.formatMessage({ id: "gs.visualizationsList.loading" })
                                : title}
                        </ShortenedText>
                    </div>
                    <div className="gd-visualizations-list-item-content-date">
                        {this.renderUpdatedDateTime(updated)}
                    </div>
                </div>
                <div className="gd-vis-type-container">
                    <div className={iconClassName} />
                </div>
            </div>
        );
    }

    public componentDidUpdate(prevProps: IInsightListItemProps & WrappedComponentProps): void {
        if (prevProps.width !== this.props.width && this.shortenedTextRef.current) {
            this.shortenedTextRef.current.recomputeShortening();
        }
    }

    public handleClickDelete = (e: React.MouseEvent): void => {
        e.stopPropagation();
        const { onDelete } = this.props;
        if (onDelete) {
            this.props.onDelete();
        }
    };

    private renderLock = () => {
        if (this.props.isLocked) {
            return <i className="gd-icon-lock" />;
        }

        return false;
    };

    private renderUpdatedDateTime = (date: any) => {
        const { type } = this.props;

        if (!date) {
            return false;
        }

        if (type === WIDGET_TYPE_KPI) {
            return <span />;
        }

        return <InsightListItemDate config={getDateTimeConfig(date)} />;
    };

    private shouldRenderActions = () => !!this.props.onDelete;

    private renderActions = () => {
        return (
            this.shouldRenderActions() && (
                <div className="gd-visualizations-list-item-actions">
                    <Button
                        className="gd-button-link gd-button-icon-only gd-button-small
                        gd-icon-trash gd-visualizations-list-item-action-delete s-delete-item"
                        onClick={this.handleClickDelete}
                    />
                </div>
            )
        );
    };
}

/**
 * @internal
 */
export const InsightListItem = injectIntl(InsightListItemCore);
