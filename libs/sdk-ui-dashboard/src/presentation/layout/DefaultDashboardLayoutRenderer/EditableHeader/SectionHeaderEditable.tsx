// (C) 2019-2025 GoodData Corporation
import React, { ReactElement, useCallback, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import cx from "classnames";
import { IAlignPoint, RichTextWithTooltip } from "@gooddata/sdk-ui-kit";

import {
    changeLayoutSectionHeader,
    selectEnableRichTextDescriptions,
    uiActions,
    useDashboardDispatch,
    useDashboardSelector,
    selectEnableDashboardDescriptionDynamicHeight,
    selectEnableRichTextDynamicReferences,
    selectSeparators,
    selectExecutionTimestamp,
} from "../../../../model/index.js";
import { useDashboardComponentsContext } from "../../../dashboardContexts/index.js";
import { useRichTextFilters } from "../../../../_staging/sharedHooks/useRichTextFilters.js";

import { EditableLabelWithBubble } from "./EditableLabelWithBubble.js";
import {
    getTitle,
    getDescription,
    MAX_TITLE_LENGTH,
    TITLE_LENGTH_WARNING_LIMIT,
    MAX_DESCRIPTION_LENGTH,
    DESCRIPTION_LENGTH_WARNING_LIMIT,
} from "./sectionHeaderHelper.js";

const richTextTooltipAlignPoints: IAlignPoint[] = [
    { align: "bl tl", offset: { x: 6, y: 1 } },
    { align: "tl bl", offset: { x: 6, y: -1 } },
];

const dynamicRichTextTooltipAlignPoints: IAlignPoint[] = [{ align: "tl bl", offset: { x: 6, y: -4 } }];

export interface ISectionHeaderEditableProps {
    title: string;
    description: string;
    index: number;
}

export function SectionHeaderEditable(props: ISectionHeaderEditableProps): ReactElement {
    const useRichText = useDashboardSelector(selectEnableRichTextDescriptions);
    const isRichTextReferencesEnabled = useDashboardSelector(selectEnableRichTextDynamicReferences);

    const isDescriptionDynamicHeightEnabled = useDashboardSelector(
        selectEnableDashboardDescriptionDynamicHeight,
    );

    const { LoadingComponent } = useDashboardComponentsContext();
    const { filters, loading } = useRichTextFilters(false);
    const separators = useDashboardSelector(selectSeparators);

    const executionTimestamp = useDashboardSelector(selectExecutionTimestamp);

    const description = useRichText ? props.description : getDescription(props.description);
    const title = getTitle(props.title);
    const { index } = props;
    const intl = useIntl();
    const placeholder = intl.formatMessage({
        id: "layout.header.add.description.placeholder",
    });

    const dispatch = useDashboardDispatch();
    const changeTitle = useCallback(
        (title: string) => dispatch(changeLayoutSectionHeader(index, { title }, true)),
        [dispatch, index],
    );
    const changeDescription = useCallback(
        (description: string) => dispatch(changeLayoutSectionHeader(index, { description }, true)),
        [dispatch, index],
    );

    const onEditingStart = useCallback(() => {
        dispatch(
            uiActions.setActiveSection({
                parent: undefined, // root layout
                sectionIndex: index,
            }),
        );
    }, [dispatch, index]);

    const onEditingEnd = useCallback(() => {
        dispatch(uiActions.clearActiveSection());
    }, [dispatch]);

    const onTitleSubmit = useCallback(
        (title: string) => {
            changeTitle(title);
            onEditingEnd();
        },
        [changeTitle, onEditingEnd],
    );

    const onDescriptionSubmit = useCallback(
        (description: string) => {
            changeDescription(description);
            onEditingEnd();
        },
        [changeDescription, onEditingEnd],
    );

    const [isRichTextEditing, setIsRichTextEditing] = useState(false);
    const [richTextValue, setRichTextValue] = useState<string>("");

    const onDescriptionClick = useCallback(() => {
        if (!isRichTextEditing) {
            onEditingStart();
            setIsRichTextEditing(true);
        }
    }, [isRichTextEditing, onEditingStart]);

    const onDescriptionBlur = useCallback(() => {
        changeDescription(richTextValue);
        onEditingEnd();
        setIsRichTextEditing(false);
    }, [changeDescription, onEditingEnd, richTextValue]);

    const onRichTextChange = useCallback((value: string) => {
        setRichTextValue(value);
    }, []);

    useEffect(() => {
        setRichTextValue(description);
    }, [description]);

    return (
        <div className="gd-row-header-edit">
            <div className="gd-editable-label-container gd-row-header-title-wrapper">
                <EditableLabelWithBubble
                    className={`gd-title-for-${index} s-fluid-layout-row-title-input title gd-heading-2`}
                    maxRows={10}
                    value={title || ""}
                    maxLength={MAX_TITLE_LENGTH}
                    warningLimit={TITLE_LENGTH_WARNING_LIMIT}
                    placeholderMessage={intl.formatMessage({ id: "layout.header.add.title.placeholder" })}
                    alignTo={`.gd-title-for-${index}`}
                    onSubmit={onTitleSubmit}
                    onEditingStart={onEditingStart}
                    onCancel={onEditingEnd}
                />
            </div>
            <div className="gd-editable-label-container gd-row-header-description-wrapper">
                {useRichText ? (
                    <div
                        className={cx("gd-editable-label-richtext s-fluid-layout-row-description-input", {
                            "is-editing": isRichTextEditing,
                        })}
                        onClick={onDescriptionClick}
                        onBlur={onDescriptionBlur}
                    >
                        <RichTextWithTooltip
                            value={richTextValue}
                            renderMode={isRichTextEditing ? "edit" : "view"}
                            onChange={onRichTextChange}
                            editRows={10}
                            editPlaceholder={placeholder}
                            emptyElement={
                                <div className="gd-editable-label-richtext-empty">{placeholder}</div>
                            }
                            showTooltip={isRichTextEditing}
                            tooltipAlignPoints={
                                isDescriptionDynamicHeightEnabled
                                    ? dynamicRichTextTooltipAlignPoints
                                    : richTextTooltipAlignPoints
                            }
                            autoResize={isDescriptionDynamicHeightEnabled}
                            referencesEnabled={isRichTextReferencesEnabled}
                            filters={filters}
                            isFiltersLoading={loading}
                            separators={separators}
                            LoadingComponent={LoadingComponent}
                            execConfig={{
                                timestamp: executionTimestamp,
                            }}
                        />
                    </div>
                ) : (
                    <EditableLabelWithBubble
                        className={`gd-description-for-${index} s-fluid-layout-row-description-input description`}
                        alignTo={`.gd-description-for-${index}`}
                        maxRows={15}
                        value={description || ""}
                        maxLength={MAX_DESCRIPTION_LENGTH}
                        warningLimit={DESCRIPTION_LENGTH_WARNING_LIMIT}
                        placeholderMessage={placeholder}
                        onSubmit={onDescriptionSubmit}
                        onEditingStart={onEditingStart}
                        onCancel={onEditingEnd}
                    />
                )}
            </div>
        </div>
    );
}
