// (C) 2020-2026 GoodData Corporation

import { useCallback } from "react";

import { type IInsight, type IInsightWidget, insightTitle } from "@gooddata/sdk-model";

import { changeInsightWidgetHeader } from "../../../../model/commands/insight.js";
import { useDashboardDispatch } from "../../../../model/react/DashboardStoreProvider.js";
import { DashboardItemHeadlineContainer } from "../../../presentationComponents/DashboardItems/DashboardItemHeadlineContainer.js";
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
