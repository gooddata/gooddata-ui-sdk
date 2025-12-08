// (C) 2007-2025 GoodData Corporation

import { ComponentType, MouseEvent, useCallback, useEffect, useMemo, useRef } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { IExecutionConfig, IFilter, ISeparators } from "@gooddata/sdk-model";
import { stringUtils } from "@gooddata/util";

import { InsightListItemDate } from "./InsightListItemDate.js";
import { Button } from "../Button/index.js";
import { DESCRIPTION_PANEL_ARROW_OFFSETS, DescriptionPanel } from "../DescriptionPanel/index.js";
import { ShortenedText } from "../ShortenedText/index.js";
import { getDateTimeConfig } from "../utils/dateTimeConfig.js";

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
    filters?: IFilter[];
    separators?: ISeparators;

    onClick?: () => void;
    onDelete?: () => void;
    onDescriptionPanelOpen?: () => void;

    showDescriptionPanel?: boolean;
    useRichText?: boolean;
    useReferences?: boolean;
    metadataTimeZone?: string;
    richTextExecConfig?: IExecutionConfig;

    LoadingComponent?: ComponentType;
}

/**
 * @internal
 */
export function InsightListItemTypeIcon({ type }: { type: string }) {
    const iconClassName = cx("gd-vis-type", `gd-vis-type-${type}`);

    return (
        <div className="gd-vis-type-container">
            <div className={iconClassName} />
        </div>
    );
}

/**
 * @internal
 */
export function InsightListItem({
    title,
    description,
    updated,
    type = VISUALIZATION_TYPE_UNKNOWN,
    isSelected,
    isLoading,
    filters,
    separators,
    LoadingComponent,
    onClick,
    onDescriptionPanelOpen,
    showDescriptionPanel = false,
    useRichText = false,
    useReferences = false,
    richTextExecConfig,
    width,
    isLocked,
    onDelete,
    metadataTimeZone,
}: IInsightListItemProps) {
    const intl = useIntl();
    const shortenedTextRef = useRef<ShortenedText>(null);

    useEffect(() => {
        if (shortenedTextRef.current) {
            shortenedTextRef.current.recomputeShortening();
        }
    }, [width]);

    const handleClickDelete = useCallback(
        (e: MouseEvent): void => {
            e.stopPropagation();
            if (onDelete) {
                onDelete();
            }
        },
        [onDelete],
    );

    const lockElement = useMemo(() => {
        if (isLocked) {
            return <i className="gd-icon-lock" />;
        }
        return null;
    }, [isLocked]);

    const renderUpdatedDateTime = useCallback(
        (date: any) => {
            if (!date) {
                return false;
            }

            if (type === WIDGET_TYPE_KPI) {
                return <span />;
            }

            const dateTimeConfig = getDateTimeConfig(date, { dateTimezone: metadataTimeZone });
            return <InsightListItemDate config={dateTimeConfig} />;
        },
        [type, metadataTimeZone],
    );

    const shouldRenderActions = !!onDelete;

    const renderActions = useCallback(() => {
        return (
            shouldRenderActions && (
                <div className="gd-visualizations-list-item-actions">
                    <Button
                        className="gd-button-link gd-button-icon-only gd-button-small
                        gd-icon-trash gd-visualizations-list-item-action-delete s-delete-item"
                        onClick={handleClickDelete}
                    />
                </div>
            )
        );
    }, [shouldRenderActions, handleClickDelete]);

    const visualizationListItemClassname = useMemo(
        () =>
            cx("gd-visualizations-list-item", `s-${stringUtils.simplifyText(title ?? "")}`, {
                "is-selected": isSelected,
            }),
        [title, isSelected],
    );

    return (
        <div className={visualizationListItemClassname} onClick={onClick}>
            {/* reversed order of items because of hover effect for whole item when hovering over trash bin - css hack with flex-direction: row-reverse; */}
            {renderActions()}
            {showDescriptionPanel ? (
                <div className="gd-visualizations-list-item-description">
                    <DescriptionPanel
                        onBubbleOpen={onDescriptionPanelOpen}
                        title={title}
                        description={description}
                        arrowOffsets={shouldRenderActions ? modifiedArrowOffsets : undefined}
                        useReferences={useReferences}
                        useRichText={useRichText}
                        filters={filters}
                        separators={separators}
                        LoadingComponent={LoadingComponent}
                        execConfig={richTextExecConfig}
                    />
                </div>
            ) : null}
            <div className="gd-visualizations-list-item-content">
                <div className="gd-visualizations-list-item-content-name">
                    {lockElement}
                    <ShortenedText
                        ref={shortenedTextRef}
                        tooltipAlignPoints={tooltipAlignPoints}
                        displayTooltip={!showDescriptionPanel}
                    >
                        {isLoading
                            ? intl.formatMessage({ id: "gs.visualizationsList.loading" })
                            : (title ?? "")}
                    </ShortenedText>
                </div>
                <div className="gd-visualizations-list-item-content-date">
                    {renderUpdatedDateTime(updated)}
                </div>
            </div>
            <InsightListItemTypeIcon type={type} />
        </div>
    );
}
