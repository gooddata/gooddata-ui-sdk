// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { useCancelablePromise } from "@gooddata/sdk-ui";
import { WorkspacePicker } from "@gooddata/sdk-ui-application-header";
import { type IHeaderWorkspace } from "@gooddata/sdk-ui-kit";

export interface IAppHeaderWorkspacePickerProps {
    backend: IAnalyticalBackend;
    userId: string;
    workspaceId: string;
    onWorkspaceSelect: (workspace: IHeaderWorkspace) => void;
}

function useWorkspaceDescriptor(
    backend: IAnalyticalBackend,
    workspaceId: string,
): IHeaderWorkspace | undefined {
    const { result } = useCancelablePromise(
        {
            promise: workspaceId
                ? () => {
                      return backend.workspace(workspaceId).getDescriptor();
                  }
                : null,
        },
        [workspaceId, backend],
    );

    return useMemo<IHeaderWorkspace | undefined>(() => {
        if (!result) {
            return undefined;
        }
        return {
            id: result.id,
            title: result.title ?? "",
            description: result.description ?? "",
            isDemo: result.isDemo,
        };
    }, [result]);
}

export function AppHeaderWorkspacePicker({
    backend,
    userId,
    workspaceId,
    onWorkspaceSelect,
}: IAppHeaderWorkspacePickerProps) {
    const workspaceDescriptor = useWorkspaceDescriptor(backend, workspaceId);

    return (
        <WorkspacePicker
            backend={backend}
            userId={userId}
            selectedWorkspace={workspaceDescriptor}
            onWorkspaceSelect={onWorkspaceSelect}
        />
    );
}
