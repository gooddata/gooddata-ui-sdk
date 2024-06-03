// (C) 2024 GoodData Corporation

import React from "react";
import Markdown from "react-markdown";
import cx from "classnames";
import { useIntl } from "react-intl";
import { IntlWrapper } from "@gooddata/sdk-ui";

const RICH_TEXT_PLACEHOLDER = `
# Heading 1
**Bold**
* List
[link](http://thisisalink.com)
![image](http://url/img.png)
`;

/**
 * @internal
 */
export interface IRichTextProps {
    value: string;
    onChange?: (text: string) => void;
    renderMode?: "view" | "edit";
    editPlaceholder?: string;
    editRows?: number;
    emptyElement?: JSX.Element;
    className?: string;
}

const RichTextCore: React.FC<IRichTextProps> = ({
    value,
    onChange,
    renderMode = "view",
    editPlaceholder,
    editRows,
    emptyElement,
    className,
}) => {
    return (
        <div
            className={cx([
                "gd-rich-text-content",
                `gd-rich-text-content-${renderMode}`,
                "s-rich-text",
                `s-rich-text-${renderMode}`,
                { "gd-visible-scrollbar": renderMode === "view" },
                className,
            ])}
        >
            {renderMode === "edit" ? (
                <RichTextEdit
                    value={value}
                    onChange={(updatedValue) => onChange?.(updatedValue)}
                    placeholder={editPlaceholder}
                    rows={editRows}
                />
            ) : (
                <RichTextView value={value} emptyElement={emptyElement} />
            )}
        </div>
    );
};

interface IRichTextEditProps {
    value: string;
    onChange: (text: string) => void;
    placeholder?: string;
    rows?: number;
}

const RichTextEdit: React.FC<IRichTextEditProps> = ({ value, onChange, placeholder, rows = 10 }) => {
    const intl = useIntl();
    const placeholderText =
        placeholder ?? `${intl.formatMessage({ id: "richText.placeholder" })}\n${RICH_TEXT_PLACEHOLDER}`;

    const moveCaretToEnd = (event: React.FocusEvent<HTMLTextAreaElement>) => {
        const { value } = event.target;
        const position = value.length;
        event.target.setSelectionRange(position, position);
    };

    return (
        <textarea
            className="gd-visible-scrollbar"
            value={value}
            autoFocus
            placeholder={placeholderText}
            onChange={(event) => onChange(event.target.value)}
            rows={rows}
            onFocus={moveCaretToEnd}
        />
    );
};

interface IRichTextViewProps {
    value: string;
    emptyElement?: JSX.Element;
}

const ImageComponent = (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img style={{ maxWidth: "100%" }} {...props} />
);

const AnchorComponent = (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a target="_blank" rel="noopener noreferrer" {...props} />
);

const RichTextView: React.FC<IRichTextViewProps> = ({ value, emptyElement }) => {
    // Strip all whitespace and newlines
    const isValueEmpty = !value?.replace(/\s/g, "");

    if (isValueEmpty && emptyElement) {
        return emptyElement;
    }

    return <Markdown components={{ img: ImageComponent, a: AnchorComponent }}>{value}</Markdown>;
};

/**
 * @internal
 */
export const RichText: React.FC<IRichTextProps> = (props) => (
    <IntlWrapper>
        <RichTextCore {...props} />
    </IntlWrapper>
);
