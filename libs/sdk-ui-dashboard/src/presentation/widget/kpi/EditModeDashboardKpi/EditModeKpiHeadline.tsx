// (C) 2007-2022 GoodData Corporation
import React from "react";

import { DashboardItemHeadlineContainer } from "../../../presentationComponents/index.js";
import { EditableHeadline } from "../../common/EditableHeadline.js";

interface IEditableKpiHeadlineProps {
    title: string;
    onTitleChange: (title: string) => void;
    onTitleEditingEnd?: () => void;
    onTitleEditingStart?: () => void;
    clientHeight?: number;
}

const MAX_KPI_TITLE_LENGTH = 35;

export const EditableKpiHeadline: React.FC<IEditableKpiHeadlineProps> = ({
    title,
    onTitleChange,
    onTitleEditingEnd,
    onTitleEditingStart,
    clientHeight,
}) => {
    const maxLength = Math.max(title.length, MAX_KPI_TITLE_LENGTH);

    return (
        <DashboardItemHeadlineContainer clientHeight={clientHeight}>
            <EditableHeadline
                text={title}
                originalTitle={title}
                maxLength={maxLength}
                onTitleChange={onTitleChange}
                onTitleEditingStart={onTitleEditingStart}
                onTitleEditingCancel={onTitleEditingEnd}
            />
        </DashboardItemHeadlineContainer>
    );
};
