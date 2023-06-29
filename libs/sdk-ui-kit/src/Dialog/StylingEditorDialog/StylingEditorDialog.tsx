// (C) 2022-2023 GoodData Corporation
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";
import cx from "classnames";
import noop from "lodash/noop.js";
import { IColorPalette, ITheme, ObjRef } from "@gooddata/sdk-model";
import { IntlWrapper } from "@gooddata/sdk-ui";

import { StylingExample } from "./StylingExample.js";
import { BubbleHeaderSeparator } from "./BubbleHeaderSeparator.js";
import { Button } from "../../Button/index.js";
import { Dialog } from "../Dialog.js";
import { Typography } from "../../Typography/index.js";
import { StylingEditorDialogFooter, IStylingEditorDialogFooterProps } from "./StylingEditorDialogFooter.js";

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
    extends IStylingEditorDialogFooterProps {
    title: string;
    tooltip?: string;
    stylingItem?: IStylingPickerItem<T>;
    examples?: IStylingPickerItem<T>[];
    exampleToColorPreview?: (example: T) => string[];
    locale?: string;
    onExit?: (name: string, definition: string) => void;
    onInvalidDefinition?: (ref: ObjRef) => void;
    showBackButton?: boolean;
}

/**
 * @internal
 */
export const StylingEditorDialog = <T extends StylingPickerItemContent>(
    props: IStylingEditorDialogProps<T>,
) => {
    return (
        <IntlWrapper locale={props.locale}>
            <StylingEditorDialogCore<T> {...props} />
        </IntlWrapper>
    );
};

const StylingEditorDialogCore = <T extends StylingPickerItemContent>(props: IStylingEditorDialogProps<T>) => {
    const {
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
        onExit = noop,
        className,
        onInvalidDefinition = noop,
    } = props;
    const intl = useIntl();
    const providedExamples = !!examples && examples.length !== 0 && !!exampleToColorPreview;
    const initialNameField = stylingItem?.name ?? "";
    const initialDefinitionField = stylingItem?.content ? JSON.stringify(stylingItem?.content, null, 4) : "";
    const [nameField, setNameField] = useState(initialNameField);
    const [definitionField, setDefinitionField] = useState(initialDefinitionField);

    const fieldsChanged = useMemo(() => {
        try {
            const parsedDefinition = JSON.parse(definitionField);
            const formattedDefinition = JSON.stringify(parsedDefinition, null, 4);
            return nameField !== initialNameField || formattedDefinition !== initialDefinitionField;
        } catch (e) {
            // initial state of the fields is presumed to be valid,
            // so if JSON throws error, definition was changed
            return true;
        }
    }, [nameField, initialNameField, definitionField, initialDefinitionField]);

    const validName = useMemo(() => nameField !== "", [nameField]);

    const validDefinition = useMemo(() => {
        try {
            JSON.parse(definitionField);
            return true;
        } catch (e) {
            return false;
        }
    }, [definitionField]);

    const validFields = useMemo(() => validName && validDefinition, [validName, validDefinition]);

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
            onInvalidDefinition(stylingItem?.ref);
            return intl.formatMessage({ id: "stylingEditor.dialog.definition.invalid" });
        }
        return undefined;
    }, [validName, emptyDefinition, validDefinition, onInvalidDefinition, stylingItem?.ref, intl]);

    const getFinalStylingItem = (
        original: IStylingPickerItem<T>,
        definition: string,
        name: string,
    ): IStylingPickerItem<T> => {
        return {
            ...(original ? original : {}),
            content: JSON.parse(definition),
            name,
        };
    };

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
                onExit(nameField, definitionField);
                onClose();
            }}
            displayCloseButton={true}
            submitOnEnterKey={false}
        >
            <div className="gd-styling-editor-dialog-header">
                {showBackButton ? (
                    <div className="gd-styling-editor-dialog-header-back-button">
                        <Button
                            className={
                                "gd-button-primary gd-button-icon-only gd-icon-navigateleft s-navigate-back-button"
                            }
                            onClick={() => {
                                onExit(nameField, definitionField);
                                onClose();
                            }}
                        />
                    </div>
                ) : null}
                <Typography tagName="h2" className="gd-styling-editor-dialog-header-title">
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
                                    name={example.name}
                                    colors={exampleToColorPreview(example.content)}
                                    onClick={() => {
                                        setNameField(example.name);
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
                onSubmit={() => onSubmit(getFinalStylingItem(stylingItem, definitionField, nameField))}
                onCancel={() => {
                    onExit(nameField, definitionField);
                    onCancel();
                }}
                onHelpClick={onHelpClick}
            />
        </Dialog>
    );
};
