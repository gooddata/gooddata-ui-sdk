import React from "react";
import last from "lodash/last";
import { IWorkspaceDescriptor } from "@gooddata/sdk-backend-spi/esm/workspace";

import InlineLoading from "../InlineLoading";
import { useWorkspace } from "../../contexts/Workspace";
import { useWorkspaceList } from "../../contexts/WorkspaceList";

import styles from "./WorkspacePicker.module.scss";

const getWorkspaceId = (workspace: IWorkspaceDescriptor) => workspace && last(workspace.id.split("/"));

const isInList = (workspaceId: string, workspaceList: IWorkspaceDescriptor[]) => {
    return (
        workspaceId &&
        workspaceList &&
        workspaceList.some((workspace) => getWorkspaceId(workspace) === workspace.id)
    );
};

const workspaceOptions = (workspaces: IWorkspaceDescriptor[]) =>
    workspaces.map((workspace) => {
        const constWorkspace = getWorkspaceId(workspace);
        return (
            <option value={constWorkspace} key={constWorkspace}>
                {workspace.title}
            </option>
        );
    });

const WorkspacePicker: React.FC = () => {
    const { workspace, setWorkspace } = useWorkspace();
    const workspaceList = useWorkspaceList();

    if (workspaceList.isLoading) return <InlineLoading />;

    if (workspaceList.error) return <div>{"Error loading workspaces"}</div>;

    if (!workspaceList.data || !workspaceList.data.length) return <div>{"No workspaces available."}</div>;

    if (workspaceList.data.length === 1)
        return <div className={styles.OneWorkspace}>{workspaceList.data[0].title}</div>;

    return (
        <div className={styles.WorkspacePickerContainer}>
            <select
                value={workspace}
                onChange={(event) => setWorkspace(event.target.value)}
                className={styles.WorkspacePicker}
            >
                {!isInList(workspace, workspaceList.data) && (
                    <option value={""} key={"0"}>
                        Please select...
                    </option>
                )}
                {workspaceOptions(workspaceList.data)}
            </select>
        </div>
    );
};

export default WorkspacePicker;
