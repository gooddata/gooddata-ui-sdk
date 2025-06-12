// (C) 2023-2024 GoodData Corporation

import { useIntl } from "react-intl";
import React, { useCallback } from "react";
import { BackButton, ConfirmDialogBase } from "@gooddata/sdk-ui-kit";

import { IGrantedDataSource, DataSourcePermissionSubject } from "../types.js";
import { messages } from "../locales.js";

import { AddDataSourceSelect } from "./AddDataSourceSelect.js";
import { DataSourceList } from "./DataSourceList.js";
import { useAddDataSource } from "./useAddDataSource.js";

export interface IAddDataSourceProps {
    ids: string[];
    subjectType: DataSourcePermissionSubject;
    grantedDataSources: IGrantedDataSource[];
    enableBackButton?: boolean;
    onSubmit: (workspaces: IGrantedDataSource[]) => void;
    onCancel: () => void;
    onClose: () => void;
    renderDataSourceIcon: (dataSource: IGrantedDataSource) => JSX.Element;
}

export const AddDataSource: React.FC<IAddDataSourceProps> = ({
    ids,
    subjectType,
    grantedDataSources,
    enableBackButton,
    onSubmit,
    onCancel,
    onClose,
    renderDataSourceIcon,
}) => {
    const intl = useIntl();
    const { addedDataSources, isProcessing, onAdd, onDelete, onChange, onSelect } = useAddDataSource(
        ids,
        subjectType,
        onSubmit,
        onCancel,
    );

    const backButtonRenderer = useCallback(() => {
        return <BackButton onClick={onCancel} className="s-user-management-navigate-back" />;
    }, [onCancel]);

    return (
        <ConfirmDialogBase
            className="gd-share-dialog gd-share-dialog-add-users s-user-management-add-data-source"
            displayCloseButton={true}
            isPositive={true}
            isSubmitDisabled={addedDataSources.length === 0 || isProcessing}
            showProgressIndicator={isProcessing}
            headline={intl.formatMessage(messages.addDataSourceDialogTitle)}
            cancelButtonText={intl.formatMessage(messages.addWorkspaceDialogCloseButton)}
            submitButtonText={intl.formatMessage(messages.addWorkspaceDialogSaveButton)}
            onCancel={onCancel}
            onSubmit={onAdd}
            onClose={onClose}
            headerLeftButtonRenderer={enableBackButton ? backButtonRenderer : undefined}
        >
            <AddDataSourceSelect
                addedDataSources={addedDataSources}
                grantedDataSources={grantedDataSources}
                onSelectDataSource={onSelect}
            />
            <DataSourceList
                subjectType={subjectType}
                mode="EDIT"
                dataSources={addedDataSources}
                onDelete={onDelete}
                onChange={onChange}
                renderDataSourceIcon={renderDataSourceIcon}
            />
        </ConfirmDialogBase>
    );
};
