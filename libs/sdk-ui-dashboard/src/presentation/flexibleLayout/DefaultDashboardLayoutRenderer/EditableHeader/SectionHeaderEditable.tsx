// (C) 2019-2026 GoodData Corporation

import { type ReactElement, useCallback, useEffect, useState } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { type IAlignPoint, RichTextWithTooltip } from "@gooddata/sdk-ui-kit";

import { type IDashboardLayoutSectionFacade } from "../../../../_staging/dashboard/flexibleLayout/facade/interfaces.js";
import { serializeLayoutSectionPath } from "../../../../_staging/layout/coordinates.js";
import { useSectionDescriptionInputs } from "../../../../_staging/sharedHooks/useRichTextInputs.js";
import { changeNestedLayoutSectionHeader } from "../../../../model/commands/layout.js";
import { useDashboardDispatch } from "../../../../model/react/DashboardStoreProvider.js";
import { uiActions } from "../../../../model/store/ui/index.js";
import { useDashboardComponentsContext } from "../../../dashboardContexts/DashboardComponentsContext.js";
import {
    RestrictedReferencesDialog,
    useHasRestrictedReferences,
} from "../../../widget/richText/RestrictedReferencesDialog.js";

import { EditableLabelWithBubble } from "./EditableLabelWithBubble.js";
import { MAX_TITLE_LENGTH, TITLE_LENGTH_WARNING_LIMIT, getTitle } from "./sectionHeaderHelper.js";

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
    const { LoadingComponent } = useDashboardComponentsContext();

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

    // what the editor asked for; whether it is the question or the editor follows from the text
    const [isEditingRequested, setIsEditingRequested] = useState(false);
    const [richTextValue, setRichTextValue] = useState<string>("");

    const startEditing = useCallback(() => {
        onEditingStart();
        setIsEditingRequested(true);
    }, [onEditingStart]);

    const onRichTextChange = useCallback((value: string) => {
        setRichTextValue(value);
    }, []);

    const hasRestrictedReferences = useHasRestrictedReferences(richTextValue);
    const isRichTextEditing = isEditingRequested && !hasRestrictedReferences;
    const isAskingToSanitize = isEditingRequested && hasRestrictedReferences;

    // the rewrite is committed at once: it was confirmed, and it is not a keystroke. The editor was
    // already asked for, so the description opens as soon as the text no longer holds a reference
    const onSanitized = useCallback(
        (sanitized: string) => {
            setRichTextValue(sanitized);
            changeDescription(sanitized);
        },
        [changeDescription],
    );

    const stopEditing = useCallback(() => {
        setIsEditingRequested(false);
        onEditingEnd();
    }, [onEditingEnd]);

    const onDescriptionBlur = useCallback(() => {
        // the confirmation takes the focus out of the description, and that is not the editor
        // leaving it: nothing is decided yet
        if (isAskingToSanitize) {
            return;
        }
        changeDescription(richTextValue);
        stopEditing();
    }, [changeDescription, richTextValue, stopEditing, isAskingToSanitize]);

    const onDescriptionClick = useCallback(() => {
        if (!isEditingRequested) {
            startEditing();
        }
    }, [isEditingRequested, startEditing]);

    useEffect(() => {
        setRichTextValue(rawDescription);
    }, [rawDescription]);

    const serializedSectionIndex = serializeLayoutSectionPath(section.index());
    const isNestedLayout = section.layout().path() !== undefined;

    // the editor shows no evaluated references, so a keystroke asks for no parameter dependencies
    const richTextInputs = useSectionDescriptionInputs(isRichTextEditing ? rawDescription : richTextValue);

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
                        emptyElement={<div className="gd-editable-label-richtext-empty">{placeholder}</div>}
                        showTooltip={isRichTextEditing}
                        tooltipAlignPoints={richTextTooltipAlignPoints}
                        autoResize
                        referencesEnabled
                        {...richTextInputs}
                        LoadingComponent={LoadingComponent}
                    />
                </div>
            </div>
            {isAskingToSanitize ? (
                <RestrictedReferencesDialog
                    value={richTextValue}
                    onSanitized={onSanitized}
                    onCancel={stopEditing}
                />
            ) : null}
        </div>
    );
}
