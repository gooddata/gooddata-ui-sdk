// (C) 2024-2025 GoodData Corporation

import React, { ReactElement, useCallback, useEffect, useRef } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";
import Markdown from "react-markdown";

import { IExecutionConfig, IFilter, ISeparators } from "@gooddata/sdk-model";
import { IntlWrapper, LoadingComponent, OnError, OnLoadingChanged } from "@gooddata/sdk-ui";

import { useEvaluatedReferences } from "./hooks/useEvaluatedReferences.js";
import { rehypeReferences } from "./plugins/rehype-references.js";
import { remarkReferences } from "./plugins/remark-references.js";

// lineHeight from CSS, used to calculate max textarea height based on provided row count
const RICH_TEXT_TEXTAREA_ROW_HEIGHT = 19;

const RICH_TEXT_PLACEHOLDER = `
# Heading 1
**Bold**
* List
[link](http://thisisalink.com)
![image](http://url/img.png)
{metric/metric_id}
{label/label_id}
`;

function DefaultLoadingComponent() {
    return <LoadingComponent />;
}

/**
 * @internal
 */
export interface IRichTextProps {
    value: string;
    onChange?: (text: string) => void;
    renderMode?: "view" | "edit";
    editPlaceholder?: string;
    execConfig?: IExecutionConfig;
    editRows?: number;
    emptyElement?: ReactElement;
    className?: string;
    referencesEnabled?: boolean;
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

    /**
     * Filters to be used for rendering references.
     */
    filters?: IFilter[];

    /**
     * If true, the filters are loading.
     */
    isFiltersLoading?: boolean;

    /**
     * Separators to be used for rendering references.
     */
    separators?: ISeparators;

    /**
     * @alpha
     */
    onLoadingChanged?: OnLoadingChanged;
    /**
     * @alpha
     */
    onError?: OnError;

    //Components
    LoadingComponent?: React.ComponentType;
}

const RichTextCore: React.FC<IRichTextProps> = ({
    value,
    execConfig,
    onChange,
    referencesEnabled,
    renderMode = "view",
    editPlaceholder,
    editRows,
    emptyElement,
    className,
    autoResize,
    rawContent,
    filters,
    isFiltersLoading,
    separators,
    onLoadingChanged,
    onError,
    LoadingComponent,
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
                <RichTextView
                    value={value}
                    filters={filters}
                    isFiltersLoading={isFiltersLoading}
                    separators={separators}
                    referencesEnabled={referencesEnabled}
                    LoadingComponent={LoadingComponent}
                    onLoadingChanged={onLoadingChanged}
                    onError={onError}
                    emptyElement={emptyElement}
                    execConfig={execConfig}
                />
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
    emptyElement?: ReactElement;
    referencesEnabled?: boolean;
    filters?: IFilter[];
    isFiltersLoading?: boolean;
    separators?: ISeparators;
    execConfig?: IExecutionConfig;
    onLoadingChanged?: OnLoadingChanged;
    onError?: OnError;
    //Components
    LoadingComponent?: React.ComponentType;
}

const ImageComponent = (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img style={{ maxWidth: "100%" }} {...props} />
);

const AnchorComponent = (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a target="_blank" rel="noopener noreferrer" {...props} />
);

const RichTextView: React.FC<IRichTextViewProps> = ({
    value,
    referencesEnabled,
    emptyElement,
    filters,
    isFiltersLoading,
    separators,
    execConfig,
    onError,
    onLoadingChanged,
    LoadingComponent = DefaultLoadingComponent,
}) => {
    const intl = useIntl();
    const { loading, metrics, isEmptyValue, error } = useEvaluatedReferences(value, filters, {
        enabled: referencesEnabled,
        isFiltersLoading,
        ...execConfig,
    });

    useEffect(() => {
        onLoadingChanged?.({
            isLoading: loading,
        });
    }, [onLoadingChanged, loading]);

    useEffect(() => {
        if (error) {
            onError?.(error);
        }
    }, [error, onError]);

    if (isEmptyValue && emptyElement) {
        return emptyElement;
    }

    if (loading) {
        return <LoadingComponent />;
    }

    return (
        <Markdown
            components={{ img: ImageComponent, a: AnchorComponent }}
            remarkPlugins={referencesEnabled ? [remarkReferences()] : []}
            rehypePlugins={referencesEnabled ? [rehypeReferences(intl, metrics, separators)] : []}
        >
            {value}
        </Markdown>
    );
};

/**
 * @internal
 */
export const RichText: React.FC<IRichTextProps> = (props) => (
    <IntlWrapper>
        <RichTextCore {...props} />
    </IntlWrapper>
);
