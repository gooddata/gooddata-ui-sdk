import React, { createContext, useState, useContext, useEffect } from "react";
import { useQueryState } from "react-router-use-location-state";
import { WorkspaceProvider as DefaultWorkspaceProvider } from "@gooddata/sdk-ui";
import identity from "lodash/identity";

import { workspace as defaultWorkspace } from "../constants";

import { useWorkspaceList } from "./WorkspaceList";

interface IWorkspaceContext {
    workspace: string;
    setWorkspace: (workspace: string) => void;
}

const WorkspaceContext = createContext<IWorkspaceContext>({
    workspace: defaultWorkspace,
    setWorkspace: identity,
});

export const WorkspaceProvider: React.FC = ({ children }) => {
    const workspaceList = useWorkspaceList();
    const [queryWorkspace, setQueryWorkspace] = useQueryState<string>("workspace", defaultWorkspace);
    const [workspace, setWorkspace] = useState<string>(queryWorkspace);

    // update query string with actual workspace
    useEffect(() => {
        setQueryWorkspace(workspace);
        // Do not include setQueryWorkspace into effect dependencies
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [workspace, queryWorkspace]);

    // if workspace was not set yet then try to use first workspace available
    useEffect(() => {
        if (!workspace && workspaceList.firstWorkspace) setWorkspace(workspaceList.firstWorkspace);
    }, [workspace, workspaceList]);

    return (
        <WorkspaceContext.Provider value={{ workspace, setWorkspace }}>
            <DefaultWorkspaceProvider workspace={workspace}>{children}</DefaultWorkspaceProvider>
        </WorkspaceContext.Provider>
    );
};

export const useWorkspace = () => useContext(WorkspaceContext);
