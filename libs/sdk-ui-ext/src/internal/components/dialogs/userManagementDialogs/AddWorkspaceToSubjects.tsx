// (C) 2023 GoodData Corporation

import React from "react";
import { IAlignPoint, Overlay } from "@gooddata/sdk-ui-kit";

import { AddWorkspace } from "./Workspace/AddWorkspace.js";
import { IGrantedWorkspace, WorkspacePermissionSubject } from "./types.js";
import { OrganizationIdProvider } from "./OrganizationIdContext.js";

const alignPoints: IAlignPoint[] = [{ align: "cc cc" }];
const noGrantedWorkspaces: IGrantedWorkspace[] = [];

/**
 * @internal
 */
export interface IAddWorkspaceToSubjectsProps {
    ids: string[];
    subjectType: WorkspacePermissionSubject;
    organizationId: string;
    onSuccess: () => void;
    onClose: () => void;
}

/**
 * @internal
 */
export const AddWorkspaceToSubjects: React.FC<IAddWorkspaceToSubjectsProps> = ({
    ids,
    subjectType,
    organizationId,
    onSuccess,
    onClose,
}) => {
    return (
        <OrganizationIdProvider organizationId={organizationId}>
            <Overlay alignPoints={alignPoints} isModal={true} positionType="fixed">
                <AddWorkspace
                    ids={ids}
                    subjectType={subjectType}
                    grantedWorkspaces={noGrantedWorkspaces}
                    enableBackButton={false}
                    onSubmit={onSuccess}
                    onCancel={onClose}
                    onClose={onClose}
                />
            </Overlay>
        </OrganizationIdProvider>
    );
};
