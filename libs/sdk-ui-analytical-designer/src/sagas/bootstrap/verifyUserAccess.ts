// (C) 2007-2026 GoodData Corporation

import { type SagaReturnType, call, select } from "redux-saga/effects";

import { type IWorkspacePermissions, canEditVisualization } from "@gooddata/sdk-model";

import { type BootstrapError } from "../../actions/app_context_actions.js";
import {
    ACCESS_DESIGNER_DENIED_ERROR as ACCESS_DESIGNER_DENIED_ERROR_CODE,
    ACCESS_WORKBENCH_DENIED_ERROR as ACCESS_WORKBENCH_DENIED_ERROR_CODE,
    CREATE_REPORT_DENIED_ERROR as CREATE_REPORT_DENIED_ERROR_CODE,
    NOT_AUTHENTICATED_ERROR as NOT_AUTHENTICATED_ERROR_CODE,
    NOT_AUTHORIZED_ERROR as NOT_AUTHORIZED_ERROR_CODE,
    NO_PROJECT_AVAILABLE_ERROR as NO_PROJECT_AVAILABLE_ERROR_CODE,
    PROJECT_NOT_FOUND_ERROR as PROJECT_NOT_FOUND_ERROR_CODE,
} from "../../constants/errors.js";
import {
    getCurrentProjectInfo,
    hasWorkspaceAccess,
    stashedProjectUri,
} from "../../selectors/bootstrap_selector.js";
import { enableVisualizationPermissions } from "../../selectors/feature_flag_selector.js";
import { getIsEmbedded } from "../../selectors/meta_selector.js";
import { workspacePermissions as workspacePermissionsSelector } from "../../selectors/permissions_selector.js";
import { type ICustomRouteParams } from "../../typings/location.js";
import { getRouteParams } from "../../utils/location.js";
import { getInsight } from "../open_report_sagas.js";

export const ACCESS_DESIGNER_DENIED_ERROR: BootstrapError = { type: ACCESS_DESIGNER_DENIED_ERROR_CODE };
export const NOT_AUTHORIZED_ERROR: BootstrapError = { type: NOT_AUTHORIZED_ERROR_CODE };
export const ACCESS_WORKBENCH_DENIED_ERROR: BootstrapError = { type: ACCESS_WORKBENCH_DENIED_ERROR_CODE };
export const CREATE_REPORT_DENIED_ERROR: BootstrapError = { type: CREATE_REPORT_DENIED_ERROR_CODE };
export const NO_PROJECT_AVAILABLE_ERROR: BootstrapError = { type: NO_PROJECT_AVAILABLE_ERROR_CODE };
export const PROJECT_NOT_FOUND_ERROR: BootstrapError = { type: PROJECT_NOT_FOUND_ERROR_CODE };
export const NOT_AUTHENTICATED_ERROR: BootstrapError = { type: NOT_AUTHENTICATED_ERROR_CODE };

export function* verifyUserAccess() {
    const routeParams: ReturnType<typeof getRouteParams> = yield select(getRouteParams);

    const currentProjectInfo: ReturnType<typeof getCurrentProjectInfo> = yield select(getCurrentProjectInfo);
    const hasWSAccess: ReturnType<typeof hasWorkspaceAccess> = yield select(hasWorkspaceAccess);
    const workspacePermissions: ReturnType<typeof workspacePermissionsSelector> = yield select(
        workspacePermissionsSelector,
    );
    const isEmbedded: ReturnType<typeof getIsEmbedded> = yield select(getIsEmbedded);

    const userStashedProjectUri: ReturnType<typeof stashedProjectUri> = yield select(stashedProjectUri);

    if (!hasWSAccess) {
        throw NOT_AUTHORIZED_ERROR;
    }

    if (!workspacePermissions.canAccessWorkbench && !isEmbedded) {
        throw ACCESS_WORKBENCH_DENIED_ERROR;
    }

    // ANALYZE always enters; embedded in a dashboard, the right to create visualizations is enough too.
    const mayEnter =
        workspacePermissions.canAnalyzeWorkspace ||
        (isEmbedded && workspacePermissions.canCreateVisualization);
    if (!mayEnter) {
        const holdsEdit: SagaReturnType<typeof holdsEditOnRoutedInsight> = yield call(
            holdsEditOnRoutedInsight,
            isEmbedded,
            routeParams,
            workspacePermissions,
        );
        if (!holdsEdit) {
            throw CREATE_REPORT_DENIED_ERROR;
        }
    }

    if (!routeParams.projectId && !userStashedProjectUri) {
        throw NO_PROJECT_AVAILABLE_ERROR;
    }

    if (!currentProjectInfo) {
        throw PROJECT_NOT_FOUND_ERROR;
    }
}

/**
 * Embedded in a dashboard, a user may also edit a visualization they hold EDIT on, without the ANALYZE
 * role or the right to create one. The visualization is read here because the editor loads it only
 * after this check (the same cached read, so the open flow makes no second request); a missing or
 * inaccessible visualization keeps the door shut.
 */
function* holdsEditOnRoutedInsight(
    isEmbedded: boolean,
    routeParams: ICustomRouteParams,
    workspacePermissions: IWorkspacePermissions,
) {
    const enabled: ReturnType<typeof enableVisualizationPermissions> = yield select(
        enableVisualizationPermissions,
    );
    if (!enabled || !isEmbedded || !routeParams.projectId || !routeParams.reportId) {
        return false;
    }
    try {
        const { insight }: SagaReturnType<typeof getInsight> = yield call(
            getInsight,
            routeParams.projectId,
            routeParams.reportId,
        );
        return canEditVisualization(insight.insight.permissions, workspacePermissions, true);
    } catch {
        return false;
    }
}
