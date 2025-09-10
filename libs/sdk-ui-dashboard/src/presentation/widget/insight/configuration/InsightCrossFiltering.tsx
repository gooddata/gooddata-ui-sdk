// (C) 2024-2025 GoodData Corporation

import React from "react";

import { FormattedMessage } from "react-intl";

import { IInsightWidget } from "@gooddata/sdk-model";
import { Bubble, BubbleHoverTrigger, Icon } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { messages } from "../../../../locales.js";
import {
    changeInsightWidgetIgnoreCrossFiltering,
    selectEnableIgnoreCrossFiltering,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../model/index.js";
import { gdColorStateBlank } from "../../../constants/colors.js";

const { QuestionMark: QuestionMarkIcon } = Icon;

const TOOLTIP_ALIGN_POINTS = [
    { align: "cr cl", offset: { x: 0, y: 1 } },
    { align: "cl cr", offset: { x: 0, y: 1 } },
];

interface IInsightCrossFiltering {
    widget: IInsightWidget;
}

export function InsightCrossFiltering({ widget }: IInsightCrossFiltering) {
    const dispatch = useDashboardDispatch();
    const theme = useTheme();
    const isIgnoreCrossFilteringEnabled = useDashboardSelector(selectEnableIgnoreCrossFiltering);

    if (!isIgnoreCrossFilteringEnabled) {
        return null;
    }

    return (
        <div className="gd-cross-filtering-configuration">
            <label
                className="input-checkbox-label s-respect-cross-filtering"
                htmlFor="respect-cross-filtering"
            >
                <input
                    id="respect-cross-filtering"
                    type="checkbox"
                    className="input-checkbox"
                    checked={!widget.ignoreCrossFiltering}
                    onChange={(e) => {
                        dispatch(changeInsightWidgetIgnoreCrossFiltering(widget.ref, !e.target.checked));
                    }}
                />
                <span className="input-label-text">
                    <FormattedMessage id={messages.respectCrossFilteringConfig.id} />
                </span>
                <BubbleHoverTrigger>
                    <QuestionMarkIcon
                        className="question-mark-icon"
                        color={theme?.palette?.complementary?.c6 ?? gdColorStateBlank}
                        width={14}
                        height={14}
                    />
                    <Bubble alignPoints={TOOLTIP_ALIGN_POINTS}>
                        <FormattedMessage id={messages.respectCrossFilteringTooltip.id} />
                    </Bubble>
                </BubbleHoverTrigger>
            </label>
        </div>
    );
}
