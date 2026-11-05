// (C) 2007-2026 GoodData Corporation

import { type ReactElement } from "react";

import { useIntl } from "react-intl";
import { useSelector } from "react-redux";

import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import {
    type IAnalyticalDesignerHeaderContext,
    type IAnalyticalDesignerVisualizationInfoProps,
} from "../../embedding/editorHeaderSlotTypes.js";
import { renderSlot, useAdSlots } from "../../embedding/slots.js";
import { isNavigationDisabled as isNavigationDisabledSelector } from "../../selectors/editor_header_selector.js";
import { isEnabledInsightUsageOnDashboards } from "../../selectors/report_selector.js";
import { InsightUsageOnDashboards } from "../InsightUsageOnDashboards.js";
import { DefaultVisualizationDescription, useVisualizationDescriptionProps } from "../ReportDescription.js";

import { useRequestCancellation } from "./CancelButton.js";
import {
    DefaultVisualizationAccess,
    InsightAccessDialogProvider,
    useVisualizationAccess,
} from "./share/InsightAccess.js";
import { DefaultVisualizationTitle, useVisualizationTitleProps } from "./VisualizationTitle.js";

const LOCK_ALIGN_POINTS = [{ align: "bc tl" }];
const UNSAVED_ALIGN_POINTS = [{ align: "bc tl", offset: { x: 0, y: 0 } }];

interface IVisualizationIndicatorsProps {
    isLocked: boolean;
    hasUnsavedChanges: boolean;
}

function VisualizationIndicators({ isLocked, hasUnsavedChanges }: IVisualizationIndicatorsProps) {
    const intl = useIntl();

    return (
        <>
            {isLocked ? (
                // Inherited insights are locked and cannot be edited; we need to give slightly different tooltip.
                <BubbleHoverTrigger className="gd-icon-lock-wrapper" showDelay={0} hideDelay={0}>
                    <i className="gd-icon-lock" />
                    <Bubble className="bubble-primary" alignPoints={LOCK_ALIGN_POINTS}>
                        {intl.formatMessage({ id: "inherited_report" })}
                    </Bubble>
                </BubbleHoverTrigger>
            ) : null}
            {hasUnsavedChanges ? (
                <BubbleHoverTrigger>
                    <i className="gd-icon-circle unsaved-notification" />
                    <Bubble className="bubble-primary" alignPoints={UNSAVED_ALIGN_POINTS}>
                        {intl.formatMessage({ id: "unsaved_changes" })}
                    </Bubble>
                </BubbleHoverTrigger>
            ) : null}
        </>
    );
}

/**
 * The VisualizationInfo region with its title, description and access slots resolved.
 */
export function useVisualizationInfo(context: IAnalyticalDesignerHeaderContext): ReactElement {
    const slots = useAdSlots();
    const titleProps = useVisualizationTitleProps(context);
    const descriptionProps = useVisualizationDescriptionProps(context);
    const { props: accessProps, dialogContext } = useVisualizationAccess(context);
    const isEnabledUsages = useSelector(isEnabledInsightUsageOnDashboards);
    const isNavigationDisabled = useSelector(isNavigationDisabledSelector);
    const onRequestBack = useRequestCancellation();

    const props: IAnalyticalDesignerVisualizationInfoProps = {
        ...context,
        visualizationTitle: renderSlot(slots.VisualizationTitle, DefaultVisualizationTitle, titleProps),
        visualizationDescription: renderSlot(
            slots.VisualizationDescription,
            DefaultVisualizationDescription,
            descriptionProps,
        ),
        visualizationAccess: (
            <InsightAccessDialogProvider value={dialogContext}>
                {renderSlot(slots.VisualizationAccess, DefaultVisualizationAccess, accessProps)}
            </InsightAccessDialogProvider>
        ),
        indicators: (
            <VisualizationIndicators
                isLocked={titleProps.isLocked}
                hasUnsavedChanges={context.hasUnsavedChanges}
            />
        ),
        usages: isEnabledUsages ? <InsightUsageOnDashboards /> : null,
        isNavigationDisabled,
        onRequestBack,
    };

    return renderSlot(slots.VisualizationInfo, DefaultVisualizationInfo, props);
}

/**
 * Default of the VisualizationInfo slot: the indicators, then the title with its description, access and usages.
 */
export function DefaultVisualizationInfo({
    hasUnsavedChanges,
    indicators,
    visualizationTitle,
    visualizationDescription,
    visualizationAccess,
    usages,
}: IAnalyticalDesignerVisualizationInfoProps) {
    return (
        <div className="report-title-wrapper">
            {indicators}
            <div className={hasUnsavedChanges ? "move-right-animation" : ""}>
                {visualizationTitle}
                {visualizationDescription}
                {visualizationAccess}
                {usages}
            </div>
        </div>
    );
}
