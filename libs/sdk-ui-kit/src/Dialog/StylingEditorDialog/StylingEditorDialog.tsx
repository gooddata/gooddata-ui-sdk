// (C) 2022 GoodData Corporation
import React, { useMemo, useState } from "react";
import { Dialog } from "../Dialog";
import { Typography } from "../../Typography";
import cx from "classnames";
import { StylingExample } from "./StylingExample";
import { IColorPalette, ITheme, ObjRef } from "@gooddata/sdk-model";
import { BubbleHeaderSeparator } from "./BubbleHeaderSeparator";
import { StylingEditorDialogFooter, IStylingEditorDialogFooterProps } from "./StylingEditorDialogFooter";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { useIntl } from "react-intl";
import { Message } from "../../Messages";

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
export interface IStylingEditorDialogProps<T> extends IStylingEditorDialogFooterProps {
    title: string;
    tooltip?: string;
    stylingItem?: IStylingPickerItem<T>;
    examples?: IStylingPickerItem<T>[];
    exampleToColorPreview?: (example: T) => string[];
    locale?: string;
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
    } = props;
    const providedExamples = !!examples && examples.length !== 0 && !!exampleToColorPreview;
    const [nameField, setNameField] = useState(stylingItem?.name ?? "");

    const [definitionField, setDefinitionField] = useState(
        stylingItem?.content ? JSON.stringify(stylingItem.content, null, 4) : "",
    );
    const [invalidDefinition, setInvalidDefinition] = useState(false);
    const isSubmitDisabled = useMemo(
        () => nameField === "" || definitionField === "" || invalidDefinition || disableSubmit,
        [nameField, definitionField, invalidDefinition, disableSubmit],
    );
    const intl = useIntl();
    const validateDefinition = (value: string): boolean => {
        try {
            JSON.parse(value);
            return true;
        } catch (e) {
            setInvalidDefinition(true);
            return false;
        }
    };
    const handleDefinitionFieldChange = (value: string) => {
        if (invalidDefinition && validateDefinition(value)) {
            setInvalidDefinition(false);
        }
        setDefinitionField(value);
    };

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
            className={cx("gd-styling-editor-dialog", {
                "gd-styling-editor-dialog-create": providedExamples,
            })}
            onClose={onClose}
            displayCloseButton={true}
            submitOnEnterKey={false}
        >
            <Typography tagName="h2" className="gd-styling-editor-dialog-header">
                {title}
            </Typography>
            <div className="gd-styling-editor-dialog-content">
                <form className="gd-styling-editor-dialog-content-form" onSubmit={(e) => e.preventDefault()}>
                    <label className="gd-styling-editor-dialog-content-form-input">
                        {intl.formatMessage({ id: "stylingEditor.dialog.name" })}
                        <input
                            className="gd-input-field s-input-field"
                            type="text"
                            value={nameField}
                            onChange={(e) => setNameField(e.target.value)}
                        />
                    </label>
                    <label
                        className={cx("gd-styling-editor-dialog-content-form-textarea", {
                            "gd-styling-editor-dialog-content-form-invalid": invalidDefinition,
                        })}
                    >
                        {intl.formatMessage({ id: "stylingEditor.dialog.definition" })}
                        <textarea
                            className="gd-input-field s-textarea-field"
                            wrap={"off"}
                            value={definitionField}
                            onChange={(e) => handleDefinitionFieldChange(e.target.value)}
                        />
                    </label>
                    {invalidDefinition && (
                        <Message
                            className={cx(
                                "gd-styling-editor-dialog-content-form-error",
                                "s-gd-styling-editor-dialog-content-form-error",
                            )}
                            type="error"
                        >
                            <strong>Invalid definition.</strong> Please provide valid JSON object.
                        </Message>
                    )}
                </form>
                {providedExamples && (
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
                )}
            </div>
            <StylingEditorDialogFooter
                disableSubmit={isSubmitDisabled}
                showProgressIndicator={showProgressIndicator}
                link={link}
                onSubmit={() =>
                    validateDefinition(definitionField)
                        ? onSubmit(getFinalStylingItem(stylingItem, definitionField, nameField))
                        : undefined
                }
                onCancel={onCancel}
            />
        </Dialog>
    );
};
