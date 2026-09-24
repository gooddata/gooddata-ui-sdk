// (C) 2022-2026 GoodData Corporation

import { type ComponentType, useCallback, useEffect, useState } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { type IFilter, type IInsight, type ObjRef } from "@gooddata/sdk-model";
import { type IAlignPoint, RichTextWithTooltip } from "@gooddata/sdk-ui-kit";

import { useRichTextInputs } from "../../../../../_staging/sharedHooks/useRichTextInputs.js";
import {
    RestrictedReferencesDialog,
    useHasRestrictedReferences,
} from "../../../richText/RestrictedReferencesDialog.js";

const richTextTooltipAlignPoints: IAlignPoint[] = [
    { align: "bl tl", offset: { x: 4, y: 5 } },
    { align: "tl bl", offset: { x: 4, y: -5 } },
];

interface IInsightDescriptionProps {
    description: string;
    readOnly?: boolean;
    setDescription: (newDescription: string) => void;
    LoadingComponent?: ComponentType;
    insightFilters?: IFilter[];
    widgetRef: ObjRef;
    insight?: IInsight;
}

export function InsightDescription({
    description,
    setDescription,
    readOnly = false,
    LoadingComponent,
    insightFilters,
    widgetRef,
    insight,
}: IInsightDescriptionProps) {
    const intl = useIntl();
    const placeholder = intl.formatMessage({
        id: "configurationPanel.visualprops.descriptionPlaceholder",
    });
    // what the editor asked for; whether it is the question or the editor follows from the text
    const [isEditingRequested, setIsEditingRequested] = useState(false);
    const [richTextValue, setRichTextValue] = useState(description);

    useEffect(() => {
        setRichTextValue(description);
    }, [description]);

    const onChange = useCallback(
        (value: string): void => {
            setDescription(value.trim());
        },
        [setDescription],
    );

    const startEditing = useCallback(() => setIsEditingRequested(true), []);

    const onRichTextChange = useCallback((value: string) => {
        setRichTextValue(value);
    }, []);

    const hasRestrictedReferences = useHasRestrictedReferences(richTextValue);
    const isRichTextEditing = isEditingRequested && !hasRestrictedReferences;
    const isAskingToSanitize = isEditingRequested && hasRestrictedReferences;

    // the editor shows no evaluated references, so a keystroke asks for no parameter dependencies
    const richTextInputs = useRichTextInputs(
        isRichTextEditing ? description : richTextValue,
        insightFilters,
        { widgetRef, insight },
    );

    // the rewrite is committed at once: it was confirmed, and it is not a keystroke. The editor was
    // already asked for, so the description opens as soon as the text no longer holds a reference
    const onSanitized = useCallback(
        (sanitized: string) => {
            setRichTextValue(sanitized);
            onChange(sanitized);
        },
        [onChange],
    );

    const stopEditing = useCallback(() => setIsEditingRequested(false), []);

    const onDescriptionBlur = useCallback(() => {
        // the confirmation takes the focus out of the description, and that is not the editor
        // leaving it: nothing is decided yet
        if (isAskingToSanitize) {
            return;
        }
        setIsEditingRequested(false);
        onChange(richTextValue);
    }, [onChange, richTextValue, isAskingToSanitize]);

    const onDescriptionClick = useCallback(() => {
        if (!isEditingRequested && !readOnly) {
            startEditing();
        }
    }, [isEditingRequested, readOnly, startEditing]);

    return (
        <label className="gd-input">
            <div
                className={cx("gd-input-field gd-rich-text-insight-description", { disabled: readOnly })}
                onClick={onDescriptionClick}
                onBlur={onDescriptionBlur}
            >
                <RichTextWithTooltip
                    value={richTextValue}
                    renderMode={isRichTextEditing ? "edit" : "view"}
                    onChange={onRichTextChange}
                    editRows={4}
                    editPlaceholder={placeholder}
                    emptyElement={
                        readOnly ? undefined : (
                            <div className="gd-editable-label-richtext-empty">{placeholder}</div>
                        )
                    }
                    showTooltip={isRichTextEditing}
                    tooltipAlignPoints={richTextTooltipAlignPoints}
                    referencesEnabled
                    LoadingComponent={LoadingComponent}
                    {...richTextInputs}
                />
            </div>
            {isAskingToSanitize ? (
                <RestrictedReferencesDialog
                    value={richTextValue}
                    onSanitized={onSanitized}
                    onCancel={stopEditing}
                />
            ) : null}
        </label>
    );
}
