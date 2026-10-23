// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import cx from "classnames";
import { FormattedMessage } from "react-intl";

import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import {
    selectAiReasoningTitle,
    selectIsAiBuilding,
    selectIsAiGenerating,
    selectIsAiWaiting,
} from "../../../model/store/config/configSelectors.js";

import { DashboardAiComposingOverlay } from "./DashboardAiComposingOverlay.js";

interface IDashboardInteractionComposingProps {
    children: ReactNode;
}

export function DashboardInteractionComposing({ children }: IDashboardInteractionComposingProps) {
    const isAiGenerating = useDashboardSelector(selectIsAiGenerating);
    const isAiBuilding = useDashboardSelector(selectIsAiBuilding);
    const isAiWaiting = useDashboardSelector(selectIsAiWaiting);
    const aiReasoningTitle = useDashboardSelector(selectAiReasoningTitle);

    const isAiActive = isAiBuilding || isAiWaiting || isAiGenerating;
    const showReasoningTitle = (isAiGenerating || isAiBuilding) && !!aiReasoningTitle;
    const showStatus = isAiWaiting || showReasoningTitle;

    return (
        <>
            {children}
            {isAiActive ? (
                <div>
                    <DashboardAiComposingOverlay isWaiting={isAiWaiting} />
                </div>
            ) : null}
            <div
                className={cx("gd-dashboard-interaction-composing__status", {
                    hidden: !showStatus,
                })}
                role={showStatus ? "status" : undefined}
                aria-hidden={!showStatus}
            >
                {isAiWaiting || !showReasoningTitle ? (
                    <FormattedMessage id="dashboard.ai.composing.waiting" />
                ) : (
                    aiReasoningTitle
                )}
            </div>
        </>
    );
}
