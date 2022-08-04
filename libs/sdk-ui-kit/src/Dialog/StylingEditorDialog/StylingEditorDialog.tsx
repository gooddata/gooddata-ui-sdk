// (C) 2022 GoodData Corporation
import React, { useMemo, useState } from "react";
import { Dialog } from "../Dialog";
import { Typography } from "../../Typography";
import cx from "classnames";
import { StylingExample } from "./StylingExample";
import { IThemeMetadataObject } from "@gooddata/sdk-model";
import { BubbleHeaderSeparator } from "./BubbleHeaderSeparator";
import { StylingEditorDialogFooter, IStylingEditorDialogFooterProps } from "./StylingEditorDialogFooter";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { useIntl } from "react-intl";
import { Message } from "../../Messages";

/**
 * @internal
 */
export type StylingPickerItem = IThemeMetadataObject;

/**
 * @internal
 */
export interface IStylingEditorDialogProps extends IStylingEditorDialogFooterProps {
    title: string;
    tooltip?: string;
    stylingContent?: StylingPickerItem;
    examples?: StylingPickerItem[];
    exampleToColorPreview?: (example: StylingPickerItem) => string[];
    locale?: string;
}

/**
 * @internal
 */
export const StylingEditorDialog = (props: IStylingEditorDialogProps) => {
    return (
        <IntlWrapper locale={props.locale}>
            <StylingEditorDialogCore {...props} />
        </IntlWrapper>
    );
};

const StylingEditorDialogCore = (props: IStylingEditorDialogProps) => {
    const {
        title,
        tooltip,
        link,
        stylingContent,
        examples,
        exampleToColorPreview,
        onClose,
        onSubmit,
        onCancel,
    } = props;
    const providedExamples = !!examples && examples.length !== 0 && !!exampleToColorPreview;
    const [nameField, setNameField] = useState(stylingContent?.title ?? "");
    const [definitionField, setDefinitionField] = useState(
        stylingContent?.theme ? JSON.stringify(stylingContent?.theme, null, 4) : "",
    );
    const [invalidDefinition, setInvalidDefinition] = useState(false);
    const isSubmitDisabled = useMemo(
        () => nameField === "" || definitionField === "" || invalidDefinition,
        [nameField, definitionField, invalidDefinition],
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
                        {intl.formatMessage({ id: "styling.editor.dialog.name" })}
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
                        {intl.formatMessage({ id: "styling.editor.dialog.definition" })}
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
                            title={intl.formatMessage({ id: "styling.editor.dialog.examples" })}
                            message={tooltip}
                        />
                        <div className="gd-styling-editor-dialog-content-examples-list">
                            {examples.map((example, index) => (
                                <StylingExample
                                    key={index}
                                    name={example.title}
                                    colors={exampleToColorPreview(example)}
                                    onClick={() => {
                                        setNameField(example.title);
                                        setDefinitionField(JSON.stringify(example.theme, null, 4));
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <StylingEditorDialogFooter
                disableSubmit={isSubmitDisabled}
                link={link}
                onSubmit={() => (validateDefinition(definitionField) ? onSubmit() : undefined)}
                onCancel={onCancel}
            />
        </Dialog>
    );
};
