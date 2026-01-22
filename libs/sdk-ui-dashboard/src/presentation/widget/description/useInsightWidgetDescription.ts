// (C) 2025-2026 GoodData Corporation

import { useMemo } from "react";

import { type IInsightWidgetDescriptionTriggerProps } from "./types.js";
import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectEnableRichTextDescriptions } from "../../../model/store/config/configSelectors.js";

export const useInsightWidgetDescription = (props: IInsightWidgetDescriptionTriggerProps) => {
    const { widget, insight } = props;

    const useRichText = useDashboardSelector(selectEnableRichTextDescriptions);

    const description = useMemo(() => {
        return widget.configuration?.description?.source === "widget" || !insight
            ? widget.description
            : insight.insight.summary;
    }, [widget, insight]);
    const trimmedDescription = useMemo(() => description?.trim(), [description]);

    const visible = widget.configuration?.description?.visible ?? true;
    const isVisible = useMemo(
        () => visible && trimmedDescription && trimmedDescription !== "",
        [visible, trimmedDescription],
    );

    return {
        isVisible,
        description,
        useRichText,
    };
};
