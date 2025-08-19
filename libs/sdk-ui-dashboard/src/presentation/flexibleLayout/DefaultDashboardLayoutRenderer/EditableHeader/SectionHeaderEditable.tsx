// (C) 2019-2025 GoodData Corporation
import React, { ReactElement, useCallback, useEffect, useState } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { IAlignPoint, RichTextWithTooltip } from "@gooddata/sdk-ui-kit";

import { EditableLabelWithBubble } from "./EditableLabelWithBubble.js";
import {
    DESCRIPTION_LENGTH_WARNING_LIMIT,
    MAX_DESCRIPTION_LENGTH,
    MAX_TITLE_LENGTH,
    TITLE_LENGTH_WARNING_LIMIT,
    getDescription,
    getTitle,
} from "./sectionHeaderHelper.js";
import { IDashboardLayoutSectionFacade } from "../../../../_staging/dashboard/flexibleLayout/index.js";
import { serializeLayoutSectionPath } from "../../../../_staging/layout/coordinates.js";
import { useRichTextFilters } from "../../../../_staging/sharedHooks/useRichTextFilters.js";
import {
    changeNestedLayoutSectionHeader,
    selectEnableRichTextDescriptions,
    selectEnableRichTextDynamicReferences,
    selectExecutionTimestamp,
    selectSeparators,
    uiActions,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../model/index.js";
import { useDashboardComponentsContext } from "../../../dashboardContexts/index.js";

const richTextTooltipAlignPoints: IAlignPoint[] = [{ align: "tl bl", offset: { x: 6, y: -4 } }];

export interface ISectionHeaderEditableProps {
    title: string | undefined;
    description: string | undefined;
    section: IDashboardLayoutSectionFacade<unknown>;
}

export function SectionHeaderEditable({
    title: rawTitle = "",
    description: rawDescription = "",
    section,
}: ISectionHeaderEditableProps): ReactElement {
    const useRichText = useDashboardSelector(selectEnableRichTextDescriptions);
    const isRichTextReferencesEnabled = useDashboardSelector(selectEnableRichTextDynamicReferences);

    const { LoadingComponent } = useDashboardComponentsContext();
    const { filters, loading } = useRichTextFilters(false);
    const separators = useDashboardSelector(selectSeparators);

    const description = useRichText ? rawDescription : getDescription(rawDescription);
    const title = getTitle(rawTitle);
    const intl = useIntl();
    const placeholder = intl.formatMessage({
        id: "layout.header.add.description.placeholder",
    });

    const dispatch = useDashboardDispatch();
    const changeTitle = useCallback(
        (title: string) => dispatch(changeNestedLayoutSectionHeader(section.index(), { title }, true)),
        [dispatch, section],
    );
    const changeDescription = useCallback(
        (description: string) =>
            dispatch(changeNestedLayoutSectionHeader(section.index(), { description }, true)),
        [dispatch, section],
    );

    const onEditingStart = useCallback(() => {
        dispatch(uiActions.setActiveSection(section.index()));
    }, [dispatch, section]);

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

    const serializedSectionIndex = serializeLayoutSectionPath(section.index());
    const isNestedLayout = section.layout().path() !== undefined;

    const executionTimestamp = useDashboardSelector(selectExecutionTimestamp);

    return (
        <div className={cx("gd-row-header-edit", { "gd-row-header-edit--nested": isNestedLayout })}>
            <div className="gd-editable-label-container gd-row-header-title-wrapper">
                <EditableLabelWithBubble
                    className={cx(
                        `gd-title-for-${serializedSectionIndex}`,
                        "s-fluid-layout-row-title-input",
                        "title",
                        {
                            "gd-heading-2": !isNestedLayout,
                            "gd-heading-3": isNestedLayout,
                        },
                    )}
                    maxRows={10}
                    value={title || ""}
                    maxLength={MAX_TITLE_LENGTH}
                    warningLimit={TITLE_LENGTH_WARNING_LIMIT}
                    placeholderMessage={intl.formatMessage({ id: "layout.header.add.title.placeholder" })}
                    alignTo={`.gd-title-for-${serializedSectionIndex}`}
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
                            tooltipAlignPoints={richTextTooltipAlignPoints}
                            autoResize={true}
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
                        className={`gd-description-for-${serializedSectionIndex} s-fluid-layout-row-description-input description`}
                        alignTo={`.gd-description-for-${serializedSectionIndex}`}
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
