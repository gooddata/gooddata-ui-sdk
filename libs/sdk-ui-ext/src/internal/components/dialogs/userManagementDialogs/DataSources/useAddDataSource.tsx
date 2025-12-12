// (C) 2023-2025 GoodData Corporation

import { useState } from "react";

import { type IDataSourceIdentifierDescriptor } from "@gooddata/sdk-model";
import { useBackendStrict } from "@gooddata/sdk-ui";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import { messages } from "../locales.js";
import { useOrganizationId } from "../OrganizationIdContext.js";
import { useTelemetry } from "../TelemetryContext.js";
import { type DataSourcePermissionSubject, type IGrantedDataSource } from "../types.js";
import { grantedDataSourceAsPermissionAssignment, sortByName } from "../utils.js";

export const useAddDataSource = (
    ids: string[],
    subjectType: DataSourcePermissionSubject,
    onSubmit: (dataSources: IGrantedDataSource[]) => void,
    onCancel: () => void,
) => {
    const { addSuccess, addError } = useToastMessage();
    const backend = useBackendStrict();
    const organizationId = useOrganizationId();
    const [addedDataSources, setAddedDataSources] = useState<IGrantedDataSource[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const trackEvent = useTelemetry();

    const onDelete = (workspace: IGrantedDataSource) => {
        setAddedDataSources(addedDataSources.filter((item) => item.id !== workspace.id));
    };

    const onChange = (workspace: IGrantedDataSource) => {
        const unchangedWorkspaces = addedDataSources.filter((item) => item.id !== workspace.id);
        setAddedDataSources([...unchangedWorkspaces, workspace].sort(sortByName));
    };

    const onAdd = () => {
        setIsProcessing(true);
        backend
            .organization(organizationId)
            .permissions()
            .assignPermissions({
                assignees: ids.map((id) => ({ id, type: subjectType })),
                dataSources: addedDataSources.map(grantedDataSourceAsPermissionAssignment),
            })
            .then(() => {
                if (ids.length === 1) {
                    addSuccess(messages.dataSourceAddedSuccess);
                    trackEvent(
                        subjectType === "user"
                            ? "permission-added-to-single-user"
                            : "permission-added-to-single-group",
                    );
                } else {
                    addSuccess(
                        subjectType === "user"
                            ? messages.dataSourcesAddedToUsersSuccess
                            : messages.dataSourcesAddedToUserGroupsSuccess,
                    );
                    trackEvent(
                        subjectType === "user"
                            ? "permission-added-to-multiple-users"
                            : "permission-added-to-multiple-groups",
                    );
                }

                onSubmit(addedDataSources);
                onCancel();
            })
            .catch((error) => {
                console.error("Addition of data source permission failed", error);
                if (ids.length === 1) {
                    addError(messages.dataSourceAddedError);
                } else {
                    addError(
                        subjectType === "user"
                            ? messages.dataSourcesAddedToUsersError
                            : messages.dataSourcesAddedToUserGroupsError,
                    );
                }
            })
            .finally(() => setIsProcessing(false));
    };

    const onSelect = ({ id, name }: IDataSourceIdentifierDescriptor) => {
        setAddedDataSources(
            [
                ...addedDataSources,
                {
                    id,
                    title: name,
                    permission: "USE" as const,
                },
            ].sort(sortByName),
        );
    };

    return {
        addedDataSources,
        onDelete,
        onChange,
        onSelect,
        onAdd,
        isProcessing,
    };
};
