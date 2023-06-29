// (C) 2020-2022 GoodData Corporation
import React, { useCallback } from "react";
import { IInsight, IInsightWidget, insightTitle } from "@gooddata/sdk-model";

import { DashboardItemHeadlineContainer } from "../../../presentationComponents/index.js";
import { changeInsightWidgetHeader, useDashboardDispatch } from "../../../../model/index.js";
import { EditableHeadline } from "../../common/EditableHeadline.js";

const MAX_VISUALIZATION_TITLE_LENGTH = 200;

interface IEditableDashboardInsightWidgetHeaderProps {
    clientHeight: number | undefined;
    widget: IInsightWidget;
    insight: IInsight;
}

export const EditableDashboardInsightWidgetHeader: React.FC<IEditableDashboardInsightWidgetHeaderProps> = ({
    widget,
    insight,
    clientHeight,
}) => {
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
};
