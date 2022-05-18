// (C) 2019-2022 GoodData Corporation
import React, { useCallback } from "react";
import { useIntl } from "react-intl";

import { EditableLabelWithBubble } from "./EditableLabelWithBubble";
import {
    getTitle,
    getDescription,
    MAX_TITLE_LENGTH,
    TITLE_LENGTH_WARNING_LIMIT,
    MAX_DESCRIPTION_LENGTH,
    DESCRIPTION_LENGTH_WARNING_LIMIT,
} from "./sectionHeaderHelper";
import { changeLayoutSectionHeader, uiActions, useDashboardDispatch } from "../../../../model";

export interface ISectionHeaderEditOwnProps {
    title: string;
    description: string;
    index: number;
}

export interface ISectionHeaderEditDispatchProps {
    rowHeaderTitleChanged: (rowId: string, title: string) => void;
    rowHeaderDescriptionChanged: (rowId: string, description: string) => void;
    rowHeaderFocused: (rowId: string) => void;
    rowHeaderBlurred: (rowId: string) => void;
}

export type ISectionHeaderEditableProps = ISectionHeaderEditOwnProps & ISectionHeaderEditDispatchProps;

export function SectionHeaderEditable(props: ISectionHeaderEditOwnProps): JSX.Element {
    const description = getDescription(props.description);
    const title = getTitle(props.title);
    const { index } = props;
    const intl = useIntl();

    const dispatch = useDashboardDispatch();
    const setActiveHeaderIndex = useCallback(
        (index: number | null) => dispatch(uiActions.setActiveHeaderIndex(index)),
        [dispatch],
    );
    const changeTitle = useCallback(
        (title: string) => dispatch(changeLayoutSectionHeader(index, { title }, true)),
        [dispatch],
    );
    const changeDescription = useCallback(
        (description: string) => dispatch(changeLayoutSectionHeader(index, { description }, true)),
        [dispatch],
    );

    const onFocus = () => {
        setActiveHeaderIndex(index);
    };

    const onBlur = () => {
        setActiveHeaderIndex(null);
    };

    const onTitleSubmit = useCallback(
        (title: string) => {
            changeTitle(title);
            onBlur();
        },
        [changeTitle, onBlur],
    );

    const onDescriptionSubmit = useCallback(
        (description: string) => {
            changeDescription(description);
            onBlur();
        },
        [changeDescription, onBlur],
    );

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
                    onEditingStart={onFocus}
                    onCancel={onBlur}
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
                    onEditingStart={onFocus}
                    onCancel={onBlur}
                />
            </div>
        </div>
    );
}
