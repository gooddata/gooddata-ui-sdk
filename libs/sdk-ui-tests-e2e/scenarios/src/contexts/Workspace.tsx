// (C) 2022-2025 GoodData Corporation

import React, { createContext, useContext, useEffect, useState } from "react";

import identity from "lodash/identity";

import { WorkspaceProvider as DefaultWorkspaceProvider } from "@gooddata/sdk-ui";

import { useWorkspaceList } from "./WorkspaceList";
import { workspace as defaultWorkspace } from "../constants";

interface IWorkspaceContext {
    workspace: string;
    setWorkspace: (workspace: string) => void;
}

const WorkspaceContext = createContext<IWorkspaceContext>({
    workspace: defaultWorkspace,
    setWorkspace: identity,
});

export function WorkspaceProvider({ children }: { children?: React.ReactNode }) {
    const workspaceList = useWorkspaceList();
    const [workspace, setWorkspace] = useState<string>(defaultWorkspace);

    // if workspace was not set yet then try to use first workspace available
    useEffect(() => {
        if (!workspace && workspaceList.firstWorkspace) setWorkspace(workspaceList.firstWorkspace);
    }, [workspace, workspaceList]);

    return (
        <WorkspaceContext.Provider value={{ workspace, setWorkspace }}>
            <DefaultWorkspaceProvider workspace={workspace}>{children}</DefaultWorkspaceProvider>
        </WorkspaceContext.Provider>
    );
}

export const useWorkspace = () => useContext(WorkspaceContext);
