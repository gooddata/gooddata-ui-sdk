// (C) 2023-2025 GoodData Corporation
import React, { ReactNode } from "react";

import isEmpty from "lodash/isEmpty.js";
import { FormattedMessage, useIntl } from "react-intl";

import { messages } from "@gooddata/sdk-ui";
import { Button } from "@gooddata/sdk-ui-kit";

import { useAttributeHierarchyDialog } from "./AttributeHierarchyDialogProvider.js";

const HOW_TO_WORK_DOCUMENTATION_LINK =
    "https://www.gooddata.com/docs/cloud/create-dashboards/drilling-in-dashboards/set-drill-down/";

const AttributeHierarchyDialogFooter: React.FC = () => {
    const { formatMessage } = useIntl();
    const {
        isEditing,
        isDirty,
        isLoading,
        attributes,
        onSaveAttributeHierarchy,
        onClose,
        setDisplayDeleteConfirmation,
    } = useAttributeHierarchyDialog();

    const isSaveDisabled = isEmpty(attributes) || !isDirty;

    const onDelete = () => {
        setDisplayDeleteConfirmation(true);
    };

    const deleteText = formatMessage(messages.hierarchyDeleteButton);
    const cancelText = formatMessage(messages.hierarchyCancelButton);
    const saveText = formatMessage(isEditing ? messages.hierarchySaveButton : messages.hierarchyCreateButton);

    return (
        <div className="gd-dialog-footer">
            <div className="attribute-hierarchy-note-message s-attribute-hierarchy-note-message">
                <div className="gd-message progress">
                    <FormattedMessage
                        id={messages.hierarchyAttributeNoteMessage.id}
                        values={{
                            b: (chunks: ReactNode) => <strong>{chunks}</strong>,
                            br: () => <br />,
                        }}
                        tagName="div"
                    />
                </div>
            </div>
            <div className="attribute-hierarchy-footer-actions-wrapper s-attribute-hierarchy-footer-actions-wrapper">
                <div className="gd-dialog-footer-tip">
                    <span className="gd-icon-circle-question s-gd-icon-circle-question" />
                    <a
                        href={HOW_TO_WORK_DOCUMENTATION_LINK}
                        className="gd-button-link-dimmed"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <FormattedMessage id={messages.hierarchyAttributeHowToWork.id} />
                    </a>
                </div>
                <div className="gd-dialog-footer-actions s-gd-dialog-footer-actions">
                    {isEditing ? (
                        <Button
                            className="gd-button-link-dimmed attribute-hierarchy-delete-button s-attribute-hierarchy-delete-button"
                            value={deleteText}
                            onClick={onDelete}
                            disabled={isLoading}
                        />
                    ) : null}
                    <Button
                        className="gd-button-secondary attribute-hierarchy-cancel-button s-attribute-hierarchy-cancel-button"
                        value={cancelText}
                        onClick={onClose}
                        disabled={isLoading}
                    />
                    <Button
                        className="gd-button-action attribute-hierarchy-save-button s-attribute-hierarchy-save-button"
                        value={saveText}
                        disabled={isSaveDisabled || isLoading}
                        onClick={onSaveAttributeHierarchy}
                    />
                </div>
            </div>
        </div>
    );
};

export default AttributeHierarchyDialogFooter;
