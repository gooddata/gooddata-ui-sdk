// (C) 2022-2026 GoodData Corporation

import { type ReactNode, useCallback, useMemo, useState } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { type IColorPalette, type ITheme, type ObjRef } from "@gooddata/sdk-model";
import { IntlWrapper } from "@gooddata/sdk-ui";

import { Button } from "../../Button/Button.js";
import { Message } from "../../Messages/Message.js";
import { Typography } from "../../Typography/Typography.js";
import { useId } from "../../utils/useId.js";
import { Dialog } from "../Dialog.js";
import { type IDialogBaseProps } from "../typings.js";

import { BubbleHeaderSeparator } from "./BubbleHeaderSeparator.js";
import {
    StylingEditorDialogFooter,
    type TStylingEditorDialogFooterProps,
} from "./StylingEditorDialogFooter.js";
import { StylingExample } from "./StylingExample.js";

/**
 * @internal
 */
export type StylingPickerItemContent = ITheme | IColorPalette;

/**
 * @internal
 */
export interface IStylingPickerItem<T extends StylingPickerItemContent> {
    name?: string;
    ref?: ObjRef;
    content: T;
}

/**
 * @internal
 */
export interface IStylingEditorDialogProps<T extends StylingPickerItemContent>
    extends TStylingEditorDialogFooterProps, Pick<IDialogBaseProps, "onClose" | "className"> {
    title: string;
    tooltip?: string;
    stylingItem?: IStylingPickerItem<T>;
    examples?: IStylingPickerItem<T>[];
    exampleToColorPreview?: (example: T) => string[];
    locale?: string;
    onExit?: (name: string, definition: string) => void;
    onInvalidDefinition?: (ref: ObjRef) => void;
    showBackButton?: boolean;
    /**
     * Optional validation of the parsed definition content (e.g. checking theme color values).
     *
     * @remarks
     * Called only when the definition is valid JSON. Return a localized error message to block
     * submission and display it, or undefined when the content is valid.
     */
    validateDefinition?: (content: T) => string | undefined;
    /**
     * Optional non-blocking check of the parsed definition content.
     *
     * @remarks
     * Called only when the definition is valid JSON. Return a localized message to display it as a
     * warning, or undefined when there is nothing to report. Unlike {@link IStylingEditorDialogProps.validateDefinition}
     * this never prevents submission — use it for content that applies but degrades the result.
     */
    validateDefinitionWarning?: (content: T) => string | undefined;
    /**
     * Optionally replaces the definition editor, e.g. with a syntax-highlighting one.
     *
     * @remarks
     * `value` is the definition as JSON text, and `onChange` expects JSON text back — the same
     * contract as the plain textarea rendered when this is not supplied. Anything richer (a language
     * toggle and its persistence, for instance) stays owned by the caller.
     */
    renderDefinitionEditor?: (props: { value: string; onChange: (next: string) => void }) => ReactNode;
}

/**
 * @internal
 */
export function StylingEditorDialog<T extends StylingPickerItemContent>(props: IStylingEditorDialogProps<T>) {
    return (
        <IntlWrapper locale={props.locale}>
            <StylingEditorDialogCore<T> {...props} />
        </IntlWrapper>
    );
}

function StylingEditorDialogCore<T extends StylingPickerItemContent>({
    title,
    tooltip,
    link,
    stylingItem,
    examples,
    exampleToColorPreview,
    onClose,
    onSubmit,
    onCancel,
    disableSubmit,
    showProgressIndicator,
    showBackButton,
    onHelpClick,
    onExit = () => {},
    className,
    onInvalidDefinition = () => {},
    validateDefinition,
    validateDefinitionWarning,
    renderDefinitionEditor,
}: IStylingEditorDialogProps<T>) {
    const intl = useIntl();
    const providedExamples = !!examples && examples.length !== 0 && !!exampleToColorPreview;
    const initialNameField = stylingItem?.name ?? "";
    const initialDefinitionField = stylingItem?.content ? JSON.stringify(stylingItem?.content, null, 4) : "";
    const [nameField, setNameField] = useState(initialNameField);
    const [definitionField, setDefinitionField] = useState(initialDefinitionField);

    const parsedDefinition = useMemo((): { ok: true; content: T } | { ok: false } => {
        try {
            const parsed: unknown = JSON.parse(definitionField);
            // A theme is an object and a colour palette an array, so a bare scalar is never a valid
            // definition even though JSON.parse accepts it. Worth rejecting explicitly: a
            // syntax-highlighting editor offering YAML makes `foo` — a bare string — an easy thing to
            // leave behind mid-edit, and it would otherwise submit as the whole styling content.
            if (typeof parsed !== "object" || parsed === null) {
                return { ok: false };
            }
            return { ok: true, content: parsed as T };
        } catch {
            return { ok: false };
        }
    }, [definitionField]);

    const fieldsChanged = useMemo(() => {
        if (!parsedDefinition.ok) {
            // initial state of the fields is presumed to be valid,
            // so if JSON throws error, definition was changed
            return true;
        }
        const formattedDefinition = JSON.stringify(parsedDefinition.content, null, 4);
        return nameField !== initialNameField || formattedDefinition !== initialDefinitionField;
    }, [parsedDefinition, nameField, initialNameField, initialDefinitionField]);

    const validName = useMemo(() => nameField !== "", [nameField]);

    const validDefinition = parsedDefinition.ok;

    // A callback that throws must not crash the dialog, so it degrades to "nothing to report" and
    // the user can keep working.
    const runContentCheck = useCallback(
        (check: ((content: T) => string | undefined) | undefined, name: string): string | undefined => {
            if (!check || !parsedDefinition.ok) {
                return undefined;
            }
            try {
                return check(parsedDefinition.content);
            } catch (error) {
                console.error(`StylingEditorDialog: the provided ${name} callback threw.`, error);
                return undefined;
            }
        },
        [parsedDefinition],
    );

    const definitionContentError = useMemo(
        () => runContentCheck(validateDefinition, "validateDefinition"),
        [runContentCheck, validateDefinition],
    );

    const definitionContentWarning = useMemo(
        () => runContentCheck(validateDefinitionWarning, "validateDefinitionWarning"),
        [runContentCheck, validateDefinitionWarning],
    );

    const validFields = useMemo(
        () => validName && validDefinition && !definitionContentError,
        [validName, validDefinition, definitionContentError],
    );

    const isSubmitDisabled = useMemo(
        () => !validFields || !fieldsChanged || disableSubmit,
        [validFields, fieldsChanged, disableSubmit],
    );

    const emptyDefinition = useMemo(() => definitionField === "", [definitionField]);

    const errorMessage = useMemo((): string | undefined => {
        if (!validName) {
            return intl.formatMessage({ id: "stylingEditor.dialog.name.required" });
        }
        if (emptyDefinition) {
            return intl.formatMessage({ id: "stylingEditor.dialog.definition.required" });
        }
        if (!validDefinition) {
            if (stylingItem?.ref) {
                onInvalidDefinition?.(stylingItem.ref);
            }
            return intl.formatMessage({ id: "stylingEditor.dialog.definition.invalid" });
        }
        if (definitionContentError) {
            return definitionContentError;
        }
        return undefined;
    }, [
        validName,
        emptyDefinition,
        validDefinition,
        definitionContentError,
        onInvalidDefinition,
        stylingItem?.ref,
        intl,
    ]);

    const getFinalStylingItem = (
        original: IStylingPickerItem<T>,
        content: T,
        name: string,
    ): IStylingPickerItem<T> => {
        return {
            ...(original || {}),
            content,
            name,
        };
    };

    const titleElementId = useId();

    return (
        <Dialog
            className={cx(
                "gd-styling-editor-dialog",
                {
                    "gd-styling-editor-dialog-create": providedExamples,
                },
                className,
            )}
            onClose={() => {
                onExit?.(nameField, definitionField);
                onClose?.();
            }}
            displayCloseButton
            submitOnEnterKey={false}
            accessibilityConfig={{ titleElementId }}
        >
            <div className="gd-styling-editor-dialog-header">
                {showBackButton ? (
                    <div className="gd-styling-editor-dialog-header-back-button">
                        <Button
                            className={
                                "gd-button-primary gd-button-icon-only gd-icon-navigateleft s-navigate-back-button"
                            }
                            onClick={() => {
                                onExit?.(nameField, definitionField);
                                onClose?.();
                            }}
                        />
                    </div>
                ) : null}
                <Typography
                    tagName="h2"
                    className="gd-styling-editor-dialog-header-title"
                    id={titleElementId}
                >
                    {title}
                </Typography>
            </div>
            <div className="gd-styling-editor-dialog-content">
                <form className="gd-styling-editor-dialog-content-form" onSubmit={(e) => e.preventDefault()}>
                    <label className="gd-styling-editor-dialog-content-form-input">
                        {intl.formatMessage({ id: "stylingEditor.dialog.name" })}
                        <input
                            aria-label="Styling item name"
                            className="gd-input-field s-input-field"
                            type="text"
                            value={nameField}
                            onChange={(e) => setNameField(e.target.value)}
                        />
                    </label>
                    {renderDefinitionEditor ? (
                        // Not a <label>: a custom editor brings its own controls, and a label
                        // wrapping them would route clicks on those to the labelled element. The
                        // editor is expected to carry its own accessible name instead.
                        <div className="gd-styling-editor-dialog-content-form-textarea">
                            {intl.formatMessage({ id: "stylingEditor.dialog.definition" })}
                            {renderDefinitionEditor({
                                value: definitionField,
                                onChange: setDefinitionField,
                            })}
                        </div>
                    ) : (
                        <label className="gd-styling-editor-dialog-content-form-textarea">
                            {intl.formatMessage({ id: "stylingEditor.dialog.definition" })}
                            <textarea
                                aria-label="Styling item definition"
                                className="gd-input-field s-textarea-field"
                                wrap={"off"}
                                value={definitionField}
                                onChange={(e) => setDefinitionField(e.target.value)}
                            />
                        </label>
                    )}
                    {definitionContentWarning && !definitionContentError ? (
                        <Message
                            type="warning"
                            className="gd-styling-editor-dialog-content-form-warning s-styling-editor-warning"
                        >
                            {definitionContentWarning}
                        </Message>
                    ) : null}
                </form>
                {providedExamples ? (
                    <div
                        className={cx(
                            "gd-styling-editor-dialog-content-examples",
                            "s-gd-styling-editor-dialog-content-examples",
                        )}
                    >
                        <BubbleHeaderSeparator
                            title={intl.formatMessage({ id: "stylingEditor.dialog.examples" })}
                            message={tooltip}
                        />
                        <div className="gd-styling-editor-dialog-content-examples-list">
                            {examples.map((example, index) => (
                                <StylingExample
                                    key={index}
                                    name={example.name ?? ""}
                                    colors={exampleToColorPreview(example.content)}
                                    onClick={() => {
                                        setNameField(example.name ?? "");
                                        setDefinitionField(JSON.stringify(example.content, null, 4));
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                ) : null}
            </div>
            <StylingEditorDialogFooter
                disableSubmit={isSubmitDisabled}
                showProgressIndicator={showProgressIndicator}
                link={link}
                errorMessage={errorMessage}
                onSubmit={() => {
                    // Submission is disabled while the definition does not parse, so this only
                    // narrows the type rather than guarding a reachable state.
                    if (parsedDefinition.ok) {
                        onSubmit?.(getFinalStylingItem(stylingItem!, parsedDefinition.content, nameField));
                    }
                }}
                onCancel={() => {
                    onExit?.(nameField, definitionField);
                    onCancel?.();
                }}
                onHelpClick={onHelpClick}
            />
        </Dialog>
    );
}
