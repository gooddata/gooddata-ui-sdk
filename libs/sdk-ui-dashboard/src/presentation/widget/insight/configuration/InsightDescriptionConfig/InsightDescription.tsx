// (C) 2022-2025 GoodData Corporation
import React, { useCallback, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import cx from "classnames";
import { TextAreaWithSubmit, IAlignPoint, RichTextWithTooltip } from "@gooddata/sdk-ui-kit";
import { IFilter, ISeparators } from "@gooddata/sdk-model";
import {
    selectEnableRichTextDescriptions,
    selectEnableRichTextDynamicReferences,
    selectExecutionTimestamp,
    useDashboardSelector,
} from "../../../../../model/index.js";

const richTextTooltipAlignPoints: IAlignPoint[] = [
    { align: "bl tl", offset: { x: 4, y: 5 } },
    { align: "tl bl", offset: { x: 4, y: -5 } },
];

interface IInsightDescriptionProps {
    description: string;
    readOnly?: boolean;
    setDescription: (newDescription: string) => void;
    LoadingComponent?: React.ComponentType;
    insightFilters?: IFilter[];
    separators?: ISeparators;
}

export function InsightDescription(props: IInsightDescriptionProps) {
    const {
        description,
        setDescription,
        readOnly = false,
        LoadingComponent,
        insightFilters,
        separators,
    } = props;
    const isRichTextReferencesEnabled = useDashboardSelector(selectEnableRichTextDynamicReferences);

    const intl = useIntl();
    const placeholder = intl.formatMessage({
        id: "configurationPanel.visualprops.descriptionPlaceholder",
    });
    const useRichText = useDashboardSelector(selectEnableRichTextDescriptions);
    const [isRichTextEditing, setIsRichTextEditing] = useState(false);
    const [richTextValue, setRichTextValue] = useState(description);

    const executionTimestamp = useDashboardSelector(selectExecutionTimestamp);

    useEffect(() => {
        setRichTextValue(description);
    }, [description]);

    const onChange = useCallback(
        (value: string): void => {
            setDescription(value.trim());
        },
        [setDescription],
    );

    const onDescriptionClick = useCallback(() => {
        if (!isRichTextEditing && !readOnly) {
            setIsRichTextEditing(true);
        }
    }, [isRichTextEditing, readOnly]);

    const onDescriptionBlur = useCallback(() => {
        setIsRichTextEditing(false);
        onChange(richTextValue);
    }, [onChange, richTextValue]);

    const onRichTextChange = useCallback((value: string) => {
        setRichTextValue(value);
    }, []);

    return (
        <label className="gd-input">
            {useRichText ? (
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
                        referencesEnabled={isRichTextReferencesEnabled}
                        LoadingComponent={LoadingComponent}
                        filters={insightFilters}
                        separators={separators}
                        execConfig={{
                            timestamp: executionTimestamp,
                        }}
                    />
                </div>
            ) : (
                <TextAreaWithSubmit
                    className={cx("gd-input-field description gd-widget-description-input")}
                    rows={4}
                    defaultValue={(description || "").trim()}
                    maxLength={2000}
                    placeholder={readOnly ? undefined : placeholder}
                    onSubmit={onChange}
                    disabled={readOnly}
                />
            )}
        </label>
    );
}
