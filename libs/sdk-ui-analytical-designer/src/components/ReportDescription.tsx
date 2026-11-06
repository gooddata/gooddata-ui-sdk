// (C) 2022-2026 GoodData Corporation

import { useCallback, useEffect, useMemo, useState } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";

import { Bubble, type IAlignPoint, RichText, RichTextWithTooltip } from "@gooddata/sdk-ui-kit";
import { _isEmpty } from "@gooddata/util";

import { reportDescriptionChange } from "../actions/report_actions.js";
import {
    type IAnalyticalDesignerHeaderContext,
    type IAnalyticalDesignerVisualizationDescriptionProps,
} from "../embedding/editorHeaderSlotTypes.js";
import { reportDescriptionSelector } from "../selectors/report_description_selector.js";
import { reportTitleSelector } from "../selectors/report_title_selector.js";
import { type AppDispatch, type IAppState } from "../store/types.js";

import { useGuardedCallback } from "./header/editorHeaderContext.js";
import { ReportDescriptionTrigger } from "./ReportDescriptionTrigger.js";

const ALIGN_POINTS = [{ align: "bl tl" }];
const ARROW_OFFSETS = { "bl tl": [0, 5] };
const ARROW_STYLE = { display: "none" };

const richTextTooltipAlignPoints: IAlignPoint[] = [
    { align: "bc tc", offset: { x: 0, y: 5 } },
    { align: "tc bc", offset: { x: 0, y: -5 } },
];

// The description follows the title: it can change unless the visualization is locked or AD is read-only.
const canEditDescription = (state: IAppState) => reportTitleSelector(state).canEditTitle;
const runDescriptionChange = (dispatch: AppDispatch, _state: IAppState, description: string) =>
    dispatch(reportDescriptionChange(description));

export function useVisualizationDescriptionProps(
    context: IAnalyticalDesignerHeaderContext,
): IAnalyticalDesignerVisualizationDescriptionProps {
    const intl = useIntl();
    const { currentDescription, filters, separators } = useSelector(reportDescriptionSelector);
    const { canEditTitle: isEditable } = useSelector(reportTitleSelector);
    const onDescriptionChange = useGuardedCallback<[string]>(canEditDescription, runDescriptionChange);
    const addLabel = intl.formatMessage({ id: "report.description.add" });

    return useMemo(
        () => ({
            ...context,
            description: currentDescription,
            addLabel,
            placeholder: addLabel,
            isEditable,
            filters,
            ...(separators ? { separators } : {}),
            onDescriptionChange,
        }),
        [context, currentDescription, addLabel, isEditable, filters, separators, onDescriptionChange],
    );
}

/**
 * Default of the VisualizationDescription slot: an icon with a bubble that shows the description and edits it
 * in place. The draft is committed when the bubble closes. Renders nothing for an empty description that cannot
 * be changed.
 */
export function DefaultVisualizationDescription({
    description: currentDescription,
    addLabel,
    placeholder,
    isEditable,
    filters,
    separators,
    onDescriptionChange,
}: IAnalyticalDesignerVisualizationDescriptionProps) {
    const currentDescriptionTrimmed = currentDescription.trim();
    const [description, setDescription] = useState(currentDescriptionTrimmed);
    const [preventClose, setPreventClose] = useState(false);
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        setDescription(currentDescriptionTrimmed);
    }, [currentDescriptionTrimmed]);

    const handleSave = () => {
        const trimmedDescription = description.trim();
        setDescription(trimmedDescription);
        setPreventClose(false);
        setEditMode(false);
        if (trimmedDescription !== currentDescriptionTrimmed) {
            onDescriptionChange(trimmedDescription);
        }
    };

    const handleBlur = () => {
        setPreventClose(false);
        setEditMode(false);
    };

    const handleClick = () => {
        if (!isEditable) {
            return;
        }
        setPreventClose(true);
        setEditMode(true);
    };

    const onRichTextChange = useCallback((value: string) => {
        setDescription(value);
    }, []);

    // nothing to read and nothing to add
    if (!isEditable && _isEmpty(currentDescriptionTrimmed)) {
        return null;
    }

    const renderContent = () => {
        const getClassNames = (ownClass: string) => {
            return cx("adi-description-tooltip-base", "s-adi-description-tooltip-content", ownClass);
        };

        if (_isEmpty(description) && !editMode) {
            return (
                <div className={getClassNames("adi-description-tooltip-placeholder")} onClick={handleClick}>
                    {addLabel}
                </div>
            );
        }

        if (editMode) {
            return (
                <div
                    className="adi-description-tooltip-rich-text s-adi-description-tooltip-content"
                    onBlur={handleBlur}
                >
                    <RichTextWithTooltip
                        className="adi-description-tooltip-rich-text-content"
                        value={description}
                        renderMode={editMode ? "edit" : "view"}
                        onChange={onRichTextChange}
                        editRows={20}
                        tooltipAlignPoints={richTextTooltipAlignPoints}
                        showTooltip={editMode}
                        editPlaceholder={placeholder}
                        emptyElement={<>{placeholder}</>}
                        referencesEnabled
                        filters={filters}
                        separators={separators}
                    />
                </div>
            );
        }

        return (
            <div className={getClassNames("adi-description-tooltip-text")} onClick={handleClick}>
                <RichText
                    referencesEnabled
                    className="adi-description-tooltip-rich-text"
                    value={description}
                    renderMode="view"
                    filters={filters}
                    separators={separators}
                />
            </div>
        );
    };

    return (
        <div className="adi-description-tooltip-wrapper">
            <ReportDescriptionTrigger isCloseBlocked={() => preventClose} onBubbleClose={handleSave}>
                <div className="gd-icon-circle-question adi-description-tooltip-icon s-adi-description-tooltip-icon" />
                <Bubble
                    className="bubble-light adi-description-tooltip-content"
                    arrowStyle={ARROW_STYLE}
                    arrowOffsets={ARROW_OFFSETS}
                    alignPoints={ALIGN_POINTS}
                    closeOnOutsideClick
                >
                    {renderContent()}
                </Bubble>
            </ReportDescriptionTrigger>
        </div>
    );
}
