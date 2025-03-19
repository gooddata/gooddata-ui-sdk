// (C) 2023-2024 GoodData Corporation

import React from "react";
import { IAlignPoint, Overlay } from "@gooddata/sdk-ui-kit";

import { AddWorkspace } from "./Workspace/AddWorkspace.js";
import { IGrantedWorkspace, WorkspacePermissionSubject } from "./types.js";
import { OrganizationIdProvider } from "./OrganizationIdContext.js";
import { IWithTelemetryProps, withTelemetry } from "./TelemetryContext.js";

const alignPoints: IAlignPoint[] = [{ align: "cc cc" }];
const noGrantedWorkspaces: IGrantedWorkspace[] = [];

/**
 * @internal
 */
export interface IAddWorkspaceToSubjectsProps extends IWithTelemetryProps {
    ids: string[];
    subjectType: WorkspacePermissionSubject;
    organizationId: string;
    onSuccess: () => void;
    onClose: () => void;
    areFilterViewsEnabled?: boolean;
}

const AddWorkspaceToSubjectsComponent: React.FC<IAddWorkspaceToSubjectsProps> = ({
    ids,
    subjectType,
    organizationId,
    onSuccess,
    onClose,
    areFilterViewsEnabled = false,
}) => {
    return (
        <OrganizationIdProvider organizationId={organizationId}>
            <Overlay
                alignPoints={alignPoints}
                isModal={true}
                positionType="fixed"
                className="gd-user-management-dialog"
                resizeObserverThreshold={0.2}
            >
                <AddWorkspace
                    ids={ids}
                    subjectType={subjectType}
                    grantedWorkspaces={noGrantedWorkspaces}
                    enableBackButton={false}
                    onSubmit={onSuccess}
                    onCancel={onClose}
                    onClose={onClose}
                    areFilterViewsEnabled={areFilterViewsEnabled}
                />
            </Overlay>
        </OrganizationIdProvider>
    );
};

/**
 * @internal
 */
export const AddWorkspaceToSubjects = withTelemetry(AddWorkspaceToSubjectsComponent);
