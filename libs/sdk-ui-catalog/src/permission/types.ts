// (C) 2025 GoodData Corporation

import type { AnalyticalBackendError } from "@gooddata/sdk-backend-spi";
import type { IWorkspacePermissions } from "@gooddata/sdk-model";
import type { UseCancelablePromiseState } from "@gooddata/sdk-ui";

export type PermissionsState = UseCancelablePromiseState<IWorkspacePermissions, AnalyticalBackendError>;
