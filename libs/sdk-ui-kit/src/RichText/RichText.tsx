// (C) 2024-2025 GoodData Corporation

import React, { useRef, useEffect, useCallback } from "react";
import Markdown from "react-markdown";
import cx from "classnames";
import { useIntl } from "react-intl";
import { IntlWrapper } from "@gooddata/sdk-ui";

// lineHeight from CSS, used to calculate max textarea height based on provided row count
const RICH_TEXT_TEXTAREA_ROW_HEIGHT = 19;

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
    /**
     * If provided, the textarea starts at just 1 row,
     * resizing dynamically up to editRows value.
     */
    autoResize?: boolean;

    /**
     * This will enable of rendering hidden input with markdown content
     * and data attributes for export purposes.
     */
    rawContent?: {
        show: boolean;
        dataAttributes?: Record<string, string>;
    };
}

const RichTextCore: React.FC<IRichTextProps> = ({
    value,
    onChange,
    renderMode = "view",
    editPlaceholder,
    editRows,
    emptyElement,
    className,
    autoResize,
    rawContent,
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
                    autoResize={autoResize}
                />
            ) : (
                <RichTextView value={value} emptyElement={emptyElement} />
            )}
            {rawContent?.show ? <input type="hidden" value={value} {...rawContent.dataAttributes} /> : null}
        </div>
    );
};

interface IRichTextEditProps {
    value: string;
    onChange: (text: string) => void;
    placeholder?: string;
    rows?: number;
    autoResize?: boolean;
}

const RichTextEdit: React.FC<IRichTextEditProps> = ({
    value,
    onChange,
    placeholder,
    rows = 10,
    autoResize = false,
}) => {
    const textareaRef = useRef(null);
    const intl = useIntl();
    const placeholderText =
        placeholder ?? `${intl.formatMessage({ id: "richText.placeholder" })}\n${RICH_TEXT_PLACEHOLDER}`;

    const moveCaretToEnd = (event: React.FocusEvent<HTMLTextAreaElement>) => {
        const { value } = event.target;
        const position = value.length;
        event.target.setSelectionRange(position, position);
    };

    const handleInput = useCallback(() => {
        if (autoResize) {
            const textarea = textareaRef.current;

            // Reset height to calculate new content height
            textarea.style.height = "auto";

            // Get the scroll height to adjust dynamically
            const scrollHeight = textarea.scrollHeight;

            // Set maxHeight equivalent to the number of provided rows
            const maxHeight = RICH_TEXT_TEXTAREA_ROW_HEIGHT * rows;

            // Apply height up to maxHeight, and allow scrolling if content exceeds it
            textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
            textarea.style.overflowY = scrollHeight > maxHeight ? "scroll" : "hidden";
        }
    }, [autoResize, rows]);

    // the effect will be called just once during initialization to set the textarea height
    useEffect(() => {
        handleInput();
    }, [handleInput]);

    return (
        <textarea
            ref={textareaRef}
            className="gd-visible-scrollbar"
            value={value}
            autoFocus
            placeholder={placeholderText}
            onChange={(event) => onChange(event.target.value)}
            onInput={handleInput}
            rows={autoResize ? 1 : rows}
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
