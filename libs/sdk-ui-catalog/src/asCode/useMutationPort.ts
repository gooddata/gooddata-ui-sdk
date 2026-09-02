// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { useFeatureFlags } from "../permission/PermissionsContext.js";

import type { IAsCodeDescriptor, IAsCodeMutationPort } from "./descriptor.js";

/** @internal */
export function useMutationPort(descriptor: IAsCodeDescriptor): IAsCodeMutationPort {
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();
    const settings = useFeatureFlags();
    return useMemo(
        () => descriptor.createMutationPort(backend, workspace, settings),
        [backend, descriptor, workspace, settings],
    );
}
