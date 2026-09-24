// (C) 2025-2026 GoodData Corporation

import { useMemo } from "react";

import { insightWidgetDescription } from "../../../_staging/insight/insightWidgetDescription.js";

import { type IInsightWidgetDescriptionTriggerProps } from "./types.js";

export const useInsightWidgetDescription = (props: IInsightWidgetDescriptionTriggerProps) => {
    const { widget, insight } = props;

    const description = useMemo(() => insightWidgetDescription(widget, insight), [widget, insight]);
    const trimmedDescription = useMemo(() => description?.trim(), [description]);

    const visible = widget.configuration?.description?.visible ?? true;
    const isVisible = useMemo(
        () => visible && trimmedDescription && trimmedDescription !== "",
        [visible, trimmedDescription],
    );

    return {
        isVisible,
        description,
    };
};
