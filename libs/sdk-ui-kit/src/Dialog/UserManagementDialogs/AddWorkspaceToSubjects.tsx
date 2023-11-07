// (C) 2023 GoodData Corporation

import React from "react";
import { AddWorkspace } from "./Workspace/AddWorkspace.js";
import { IAlignPoint } from "../../typings/positioning.js";
import { IGrantedWorkspace, WorkspacePermissionSubject } from "./types.js";
import { Overlay } from "../../Overlay/index.js";
import { OrganizationIdProvider } from "./OrganizationIdContext.js";

const alignPoints: IAlignPoint[] = [{ align: "cc cc" }];
const noGrantedWorkspaces: IGrantedWorkspace[] = [];

/**
 * @alpha
 */
export interface IAddWorkspaceToSubjectsProps {
    ids: string[];
    subjectType: WorkspacePermissionSubject;
    organizationId: string;
    onSuccess: () => void;
    onClose: () => void;
}

/**
 * @alpha
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
