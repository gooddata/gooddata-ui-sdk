// (C) 2007-2022 GoodData Corporation
import React from "react";
import noop from "lodash/noop.js";
import { EditableLabel } from "@gooddata/sdk-ui-kit";

interface IEditableHeadlineProps {
    text: string;
    maxLength: number;
    originalTitle: string;
    onTitleEditingStart?: () => void;
    onTitleEditingCancel?: () => void;
    onTitleChange: (title: string) => void;
}

export const EditableHeadline: React.FC<IEditableHeadlineProps> = ({
    maxLength,
    originalTitle,
    text,
    onTitleChange,
    onTitleEditingCancel = noop,
    onTitleEditingStart = noop,
}) => (
    <EditableLabel
        className="s-editable-label s-headline"
        maxRows={2}
        value={text}
        maxLength={maxLength}
        placeholder={originalTitle}
        onEditingStart={onTitleEditingStart}
        onSubmit={onTitleChange}
        onCancel={onTitleEditingCancel}
    >
        <span>{text}</span>
    </EditableLabel>
);
