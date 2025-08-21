// (C) 2020-2025 GoodData Corporation
import React, { useCallback } from "react";

import { IInsight, IInsightWidget, insightTitle } from "@gooddata/sdk-model";

import { changeInsightWidgetHeader, useDashboardDispatch } from "../../../../model/index.js";
import { DashboardItemHeadlineContainer } from "../../../presentationComponents/index.js";
import { EditableHeadline } from "../../common/EditableHeadline.js";

const MAX_VISUALIZATION_TITLE_LENGTH = 200;

interface IEditableDashboardInsightWidgetHeaderProps {
    clientHeight: number | undefined;
    widget: IInsightWidget;
    insight?: IInsight;
}

export function EditableDashboardInsightWidgetHeader({
    widget,
    insight,
    clientHeight,
}: IEditableDashboardInsightWidgetHeaderProps) {
    const dispatch = useDashboardDispatch();

    const onWidgetTitleChanged = useCallback(
        (newTitle: string) => {
            if (newTitle) {
                dispatch(changeInsightWidgetHeader(widget.ref, { title: newTitle }));
            } else if (insight) {
                dispatch(changeInsightWidgetHeader(widget.ref, { title: insightTitle(insight) }));
            }
        },
        [dispatch, insight, widget.ref],
    );

    const maxLength = Math.max(widget.title.length, MAX_VISUALIZATION_TITLE_LENGTH);

    return (
        <DashboardItemHeadlineContainer clientHeight={clientHeight}>
            <EditableHeadline
                text={widget.title}
                originalTitle={widget.title}
                maxLength={maxLength}
                onTitleChange={onWidgetTitleChanged}
            />
        </DashboardItemHeadlineContainer>
    );
}
