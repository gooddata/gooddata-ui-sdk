// (C) 2024-2026 GoodData Corporation

import {
    type AnchorHTMLAttributes,
    type ComponentType,
    type FocusEvent,
    type ImgHTMLAttributes,
    type ReactElement,
    useCallback,
    useEffect,
    useRef,
} from "react";

import cx from "classnames";
import { useIntl } from "react-intl";
import Markdown from "react-markdown";

import { type IExecutionConfig, type IFilter, type ISeparators, type ObjRef } from "@gooddata/sdk-model";
import { IntlWrapper, LoadingComponent, type OnError, type OnLoadingChanged } from "@gooddata/sdk-ui";

import { useEvaluatedReferences } from "./hooks/useEvaluatedReferences.js";
import { rehypeReferences } from "./plugins/rehype-references.js";
import { type RichTextFeature, remarkMarkdownFeatures } from "./plugins/remark-markdown-features.js";
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
     * Which markdown features are recognised, narrowing what the text may contain. Syntax for a
     * feature left out renders as the characters that were typed rather than as markup. Omit for
     * full CommonMark; pass `[]` for no markup at all.
     *
     * Paragraphs, trailing-whitespace line breaks and backslash escapes are recognised whatever
     * is asked for: escapes are the only way to write a marker literally, and text needs
     * paragraphs to be text. `backslashBreaks` adds the backslash spelling of a line break on top.
     *
     * `html` only governs whether HTML syntax is *recognised*, which affects block structure.
     * A tag is rendered as the characters that were typed either way — there is no `rehype-raw`.
     *
     * Applies to `renderMode="view"`; the editor takes whatever is typed either way.
     */
    allowedMarkdown?: readonly RichTextFeature[];
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
     * References the current user is not allowed to read. Each of them renders as a marker in place
     * of its value, and is left out of the execution that resolves the remaining references — one
     * execution serves them all, and it fails as a whole if it asks for a restricted object.
     */
    restrictedReferences?: ObjRef[];

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
    LoadingComponent?: ComponentType;
}

function RichTextCore({
    value,
    execConfig,
    onChange,
    referencesEnabled,
    allowedMarkdown,
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
    restrictedReferences,
    onLoadingChanged,
    onError,
    LoadingComponent,
}: IRichTextProps) {
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
                    restrictedReferences={restrictedReferences}
                    referencesEnabled={referencesEnabled}
                    allowedMarkdown={allowedMarkdown}
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
}

interface IRichTextEditProps {
    value: string;
    onChange: (text: string) => void;
    placeholder?: string;
    rows?: number;
    autoResize?: boolean;
}

function RichTextEdit({ value, onChange, placeholder, rows = 10, autoResize = false }: IRichTextEditProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const intl = useIntl();
    const placeholderText =
        placeholder ?? `${intl.formatMessage({ id: "richText.placeholder" })}\n${RICH_TEXT_PLACEHOLDER}`;

    const moveCaretToEnd = (event: FocusEvent<HTMLTextAreaElement>) => {
        const { value } = event.target;
        const position = value.length;
        event.target.setSelectionRange(position, position);
    };

    const handleInput = useCallback(() => {
        if (autoResize) {
            const textarea = textareaRef.current;
            if (!textarea) {
                return;
            }

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
}

interface IRichTextViewProps {
    value: string;
    emptyElement?: ReactElement;
    referencesEnabled?: boolean;
    allowedMarkdown?: readonly RichTextFeature[];
    filters?: IFilter[];
    isFiltersLoading?: boolean;
    separators?: ISeparators;
    restrictedReferences?: ObjRef[];
    execConfig?: IExecutionConfig;
    onLoadingChanged?: OnLoadingChanged;
    onError?: OnError;
    //Components
    LoadingComponent?: ComponentType;
}

const imageStyle = { maxWidth: "100%" };

function ImageComponent(props: ImgHTMLAttributes<HTMLImageElement>) {
    return <img style={imageStyle} {...props} />;
}

function AnchorComponent(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
    return <a target="_blank" rel="noopener noreferrer" {...props} />;
}

function RichTextView({
    value,
    referencesEnabled,
    allowedMarkdown,
    emptyElement,
    filters,
    isFiltersLoading,
    separators,
    restrictedReferences,
    execConfig,
    onError,
    onLoadingChanged,
    LoadingComponent = DefaultLoadingComponent,
}: IRichTextViewProps) {
    const intl = useIntl();
    const { loading, metrics, isEmptyValue, error } = useEvaluatedReferences(
        value,
        filters ?? [],
        {
            enabled: referencesEnabled ?? false,
            isFiltersLoading,
            ...execConfig,
        },
        restrictedReferences,
    );

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
            remarkPlugins={[
                ...(allowedMarkdown === undefined ? [] : [remarkMarkdownFeatures(allowedMarkdown)]),
                ...(referencesEnabled ? [remarkReferences()] : []),
            ]}
            rehypePlugins={
                referencesEnabled ? [rehypeReferences(intl, metrics, separators, restrictedReferences)] : []
            }
        >
            {value}
        </Markdown>
    );
}

/**
 * @internal
 */
export function RichText(props: IRichTextProps) {
    return (
        <IntlWrapper>
            <RichTextCore {...props} />
        </IntlWrapper>
    );
}
