// (C) 2022-2026 GoodData Corporation

import { useCallback, useEffect, useState } from "react";

import cx from "classnames";
import { isEmpty } from "lodash-es";
import { useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { Bubble, type IAlignPoint, RichText, RichTextWithTooltip } from "@gooddata/sdk-ui-kit";

import { reportDescriptionChange } from "../actions/report_actions.js";
import { reportDescriptionSelector } from "../selectors/report_description_selector.js";
import { type AppDispatch } from "../store/types.js";

import { ReportDescriptionTrigger } from "./ReportDescriptionTrigger.js";

const ALIGN_POINTS = [{ align: "bl tl" }];
const ARROW_OFFSETS = { "bl tl": [0, 5] };
const ARROW_STYLE = { display: "none" };

const richTextTooltipAlignPoints: IAlignPoint[] = [
    { align: "bc tc", offset: { x: 0, y: 5 } },
    { align: "tc bc", offset: { x: 0, y: -5 } },
];

export function ReportDescription() {
    const intl = useIntl();
    const dispatch = useDispatch<AppDispatch>();
    const { currentDescription, filters, separators } = useSelector(reportDescriptionSelector);

    const currentDescriptionTrimmed = currentDescription.trim();
    const [description, setDescription] = useState(currentDescriptionTrimmed);
    const [preventClose, setPreventClose] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const placeholder = intl.formatMessage({ id: "report.description.add" });

    useEffect(() => {
        setDescription(currentDescriptionTrimmed);
    }, [currentDescriptionTrimmed]);

    const handleSave = () => {
        const trimmedDescription = description.trim();
        setDescription(trimmedDescription);
        setPreventClose(false);
        setEditMode(false);
        if (trimmedDescription !== currentDescriptionTrimmed) {
            dispatch(reportDescriptionChange(trimmedDescription));
        }
    };

    const handleBlur = () => {
        setPreventClose(false);
        setEditMode(false);
    };

    const handleClick = () => {
        setPreventClose(true);
        setEditMode(true);
    };

    const onRichTextChange = useCallback((value: string) => {
        setDescription(value);
    }, []);

    const renderContent = () => {
        const getClassNames = (ownClass: string) => {
            return cx("adi-description-tooltip-base", "s-adi-description-tooltip-content", ownClass);
        };

        if (isEmpty(description) && !editMode) {
            return (
                <div className={getClassNames("adi-description-tooltip-placeholder")} onClick={handleClick}>
                    {intl.formatMessage({ id: "report.description.add" })}
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
