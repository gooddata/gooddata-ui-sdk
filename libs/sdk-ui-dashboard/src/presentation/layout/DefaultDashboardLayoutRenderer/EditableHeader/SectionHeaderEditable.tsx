// (C) 2019-2022 GoodData Corporation
import React, { useCallback } from "react";
import { useIntl } from "react-intl";

import { EditableLabelWithBubble } from "./EditableLabelWithBubble.js";
import {
    getTitle,
    getDescription,
    MAX_TITLE_LENGTH,
    TITLE_LENGTH_WARNING_LIMIT,
    MAX_DESCRIPTION_LENGTH,
    DESCRIPTION_LENGTH_WARNING_LIMIT,
} from "./sectionHeaderHelper.js";
import { changeLayoutSectionHeader, uiActions, useDashboardDispatch } from "../../../../model/index.js";
import { Icon } from "@gooddata/sdk-ui-kit";

export interface ISectionHeaderEditableProps {
    title: string;
    description: string;
    index: number;
    dashboardId: string;
}

export function SectionHeaderEditable(props: ISectionHeaderEditableProps): JSX.Element {
    const [editing, setEditing] = React.useState(false);
    const description = getDescription(props.description);
    const title = getTitle(props.title);
    const { index, dashboardId } = props;
    const intl = useIntl();

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
        dispatch(uiActions.setActiveSectionIndex(index));
        setEditing(true);
    }, [dispatch, index]);

    const onEditingEnd = useCallback(() => {
        dispatch(uiActions.clearActiveSectionIndex());
        setEditing(false);
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

    const applySectionDescription = useCallback(
        (e: { detail: { dashboardId: string; sectionIndex: number; description: string } }) => {
            const { dashboardId: dId, sectionIndex, description } = e.detail;

            if (dashboardId === dId && sectionIndex === index) {
                onDescriptionSubmit(description);
                document.dispatchEvent(new CustomEvent("gdc-llm-chat-clear"));
                document.dispatchEvent(new CustomEvent("gdc-llm-chat-close"));
            }
        },
        [dashboardId, index, onDescriptionSubmit],
    );

    React.useEffect(() => {
        // Listen to events from chat and apply changes to dashboard
        document.addEventListener(
            "gdc-llm-chat-apply-dashboard-section-description",
            applySectionDescription,
        );

        return () => {
            document.removeEventListener(
                "gdc-llm-chat-apply-dashboard-section-description",
                applySectionDescription,
            );
        };
    }, []);

    const onAutoGenerate = useCallback(() => {
        document.dispatchEvent(new CustomEvent("gdc-llm-chat-open"));
        document.dispatchEvent(
            new CustomEvent("gdc-llm-chat-generate-dashboard-section-description", {
                detail: {
                    dashboardId,
                    sectionIndex: index,
                },
            }),
        );
    }, [dashboardId, index]);

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
                <EditableLabelWithBubble
                    className={`gd-description-for-${index} s-fluid-layout-row-description-input description`}
                    alignTo={`.gd-description-for-${index}`}
                    maxRows={15}
                    value={description || ""}
                    maxLength={MAX_DESCRIPTION_LENGTH}
                    warningLimit={DESCRIPTION_LENGTH_WARNING_LIMIT}
                    placeholderMessage={intl.formatMessage({
                        id: "layout.header.add.description.placeholder",
                    })}
                    onSubmit={onDescriptionSubmit}
                    onEditingStart={onEditingStart}
                    onCancel={onEditingEnd}
                />
            </div>
            {editing ? (
                <div className="gd-icon-section-suggest" onMouseDown={onAutoGenerate}>
                    <Icon.Magic color="rgb(20,178,226)" />
                </div>
            ) : null}
        </div>
    );
}
