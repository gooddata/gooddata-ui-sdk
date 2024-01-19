// (C) 2020-2024 GoodData Corporation
import React, { useEffect, useState } from "react";
import cx from "classnames";

import { DashboardItem, DashboardItemBase } from "../../../presentationComponents/index.js";
import {
    changeRichTextWidgetContent,
    eagerRemoveSectionItemByWidgetRef,
    selectIsDashboardSaving,
    uiActions,
    useDashboardDispatch,
    useDashboardSelector,
    useWidgetSelection,
} from "../../../../model/index.js";
import { IDefaultDashboardRichTextWidgetProps } from "./types.js";
import { widgetRef } from "@gooddata/sdk-model";
import { RichText } from "./RichText.js";
import { Button } from "@gooddata/sdk-ui-kit";
import { FormattedMessage } from "react-intl";
import { usePrevious } from "@gooddata/sdk-ui";

export const EditableDashboardRichTextWidget: React.FC<IDefaultDashboardRichTextWidgetProps> = (props) => {
    return <EditableDashboardRichTextWidgetCore {...props} />;
};

/**
 * @internal
 */
const EditableDashboardRichTextWidgetCore: React.FC<IDefaultDashboardRichTextWidgetProps> = ({
    widget,
    screen,
    dashboardItemClasses,
}) => {
    const { isSelectable, isSelected, onSelected } = useWidgetSelection(widgetRef(widget));
    const previousIsSelected = usePrevious(isSelected);

    const dispatch = useDashboardDispatch();
    const isSaving = useDashboardSelector(selectIsDashboardSaving);
    const isEditable = !isSaving;

    const [richText, setRichText] = useState<string>(widget?.content);

    const [isRichTextEditing, setIsRichTextEditing] = useState(true);

    useEffect(() => {
        setIsRichTextEditing(isSelected);
    }, [isSelected]);

    useEffect(() => {
        // Deselect widget and commit updated markdown text "on blur"
        if (previousIsSelected === true && isSelected === false && richText !== widget?.content) {
            dispatch(changeRichTextWidgetContent(widget.ref, richText));
        }
    }, [richText, widget?.content, widget.ref, dispatch, isSelected, previousIsSelected]);

    return (
        <DashboardItem
            className={cx(
                dashboardItemClasses,
                "type-visualization",
                "gd-dashboard-view-widget",
                "is-edit-mode",
                { "is-selected": isSelected },
            )}
            screen={screen}
        >
            <DashboardItemBase
                isSelectable={isSelectable}
                isSelected={isSelected}
                onSelected={onSelected}
                contentClassName={cx({ "is-editable": isEditable })}
                visualizationClassName="gd-rich-text-wrapper"
            >
                {() => (
                    <>
                        <RichText text={richText} onChange={setRichText} editMode={isRichTextEditing} />
                        {isRichTextEditing ? (
                            <div className="gd-rich-text-footer">
                                <div className="gd-rich-text-footer-options">
                                    <div className="gd-hider-div" />
                                    <a
                                        className="gd-button-link-dimmed gd-icon-circle-question"
                                        href="https://www.gooddata.com/docs/cloud/create-dashboards/rich-text/"
                                        rel="noopener noreferrer"
                                        target="_blank"
                                    >
                                        <FormattedMessage id="richText.formattingOptions" />
                                    </a>
                                </div>
                                <div className="gd-rich-text-footer-actions">
                                    <Button
                                        className="gd-button-link gd-button-icon-only gd-icon-trash"
                                        onClick={() => {
                                            dispatch(eagerRemoveSectionItemByWidgetRef(widget.ref));
                                        }}
                                    />
                                    <span className="gd-divider" />
                                    <Button
                                        className="gd-button-link gd-button-icon-only gd-icon-checkmark"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            dispatch(uiActions.clearWidgetSelection());
                                            dispatch(changeRichTextWidgetContent(widget.ref, richText));
                                        }}
                                    />
                                </div>
                            </div>
                        ) : null}
                    </>
                )}
            </DashboardItemBase>
        </DashboardItem>
    );
};
