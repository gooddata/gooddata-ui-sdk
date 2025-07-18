// (C) 2007-2025 GoodData Corporation
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

export function EditableHeadline({
    maxLength,
    originalTitle,
    text,
    onTitleChange,
    onTitleEditingCancel = noop,
    onTitleEditingStart = noop,
}: IEditableHeadlineProps) {
    return (
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
}
