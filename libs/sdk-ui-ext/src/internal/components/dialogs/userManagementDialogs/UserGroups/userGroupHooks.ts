// (C) 2023 GoodData Corporation

import { useState } from "react";
import { useBackendStrict } from "@gooddata/sdk-ui";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import { IGrantedUserGroup } from "../types.js";
import { messages } from "../locales.js";
import { sortByName } from "../utils.js";
import { useOrganizationId } from "../OrganizationIdContext.js";
import { useTelemetry } from "../TelemetryContext.js";

export const useAddUserGroup = (
    userIds: string[],
    onSubmit: (userGroups: IGrantedUserGroup[]) => void,
    onCancel: () => void,
) => {
    const { addSuccess, addError } = useToastMessage();
    const backend = useBackendStrict();
    const organizationId = useOrganizationId();
    const [addedUserGroups, setAddedUserGroups] = useState<IGrantedUserGroup[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const trackEvent = useTelemetry();

    const onDelete = (userGroup: IGrantedUserGroup) => {
        setAddedUserGroups(addedUserGroups.filter((item) => item.id !== userGroup.id));
    };

    const onAdd = () => {
        setIsProcessing(true);
        if (userIds.length === 1) {
            backend
                .organization(organizationId)
                .users()
                .addUsersToUserGroups(
                    userIds,
                    addedUserGroups.map((userGroup) => userGroup.id),
                )
                .then(() => {
                    addSuccess(messages.userGroupAddedSuccess);
                    trackEvent("groups-added-to-single-user");
                    onSubmit(addedUserGroups);
                    onCancel();
                })
                .catch((error) => {
                    console.error("Addition of user group membership failed", error);
                    addError(messages.userGroupAddedFailure);
                })
                .finally(() => setIsProcessing(false));
        } else {
            backend
                .organization(organizationId)
                .users()
                .addUsersToUserGroups(
                    userIds,
                    addedUserGroups.map((userGroup) => userGroup.id),
                )
                .then(() => {
                    addSuccess(messages.userGroupsAddedSuccess);
                    trackEvent("groups-added-to-multiple-users");
                    onSubmit(addedUserGroups);
                    onCancel();
                })
                .catch((error) => {
                    console.error("Addition of user group memberships failed", error);
                    addError(messages.userGroupsAddedFailure);
                })
                .finally(() => setIsProcessing(false));
        }
    };

    const onSelect = ({ id, title }: IGrantedUserGroup) => {
        setAddedUserGroups(
            [
                ...addedUserGroups,
                {
                    id,
                    title,
                },
            ].sort(sortByName),
        );
    };

    return {
        addedUserGroups,
        onAdd,
        onDelete,
        onSelect,
        isProcessing,
    };
};
