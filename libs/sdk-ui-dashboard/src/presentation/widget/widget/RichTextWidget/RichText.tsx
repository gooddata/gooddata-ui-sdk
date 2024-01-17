// (C) 2023-2024 GoodData Corporation

import React from "react";
import Markdown from "react-markdown";

const RICH_TEXT_EMPTY = "No rich text content";
const RICH_TEXT_PLACEHOLDER = `Add markdown text here...\n
# Heading 1
**Bold**
* List
[link](http://thisisalink.com)
![image](http://url/img.png)
`;

interface IRichTextProps {
    text: string;
    onChange: (text: string) => void;
    editMode?: boolean;
    editPlaceholder?: string;
    emptyText?: string;
}

export const RichText: React.FC<IRichTextProps> = ({
    text,
    onChange,
    editMode = false,
    editPlaceholder,
    emptyText,
}) => {
    return (
        <div className="gd-rich-text">
            {editMode ? (
                <RichTextEdit text={text} onChange={onChange} placeholder={editPlaceholder} />
            ) : (
                <RichTextView text={text} emptyText={emptyText} />
            )}
        </div>
    );
};

interface IRichTextEditProps {
    text: string;
    onChange: (text: string) => void;
    placeholder?: string;
    rows?: number;
}

const RichTextEdit: React.FC<IRichTextEditProps> = ({
    text,
    onChange,
    placeholder = RICH_TEXT_PLACEHOLDER,
    rows = 10,
}) => {
    const moveCaretToEnd = (event: React.FocusEvent<HTMLTextAreaElement>) => {
        const { value } = event.target;
        const position = value.length;
        event.target.setSelectionRange(position, position);
    };

    return (
        <textarea
            value={text}
            autoFocus
            placeholder={placeholder}
            onChange={(event) => onChange(event.target.value)}
            rows={rows}
            onFocus={moveCaretToEnd}
        />
    );
};

interface IRichTextViewProps {
    text: string;
    emptyText?: string;
}

const RichTextView: React.FC<IRichTextViewProps> = ({ text, emptyText = RICH_TEXT_EMPTY }) => {
    if (!text) {
        return <div className="gd-rich-text-empty">{emptyText}</div>;
    }

    return <Markdown>{text}</Markdown>;
};
