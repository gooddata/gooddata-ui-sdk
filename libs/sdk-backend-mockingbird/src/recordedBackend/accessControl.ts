// (C) 2019-2021 GoodData Corporation
import {
    AccessGranteeDetail,
    IAccessGrantee,
    IWorkspaceAccessControlService,
} from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";
import noop from "lodash/noop";
import { RecordedBackendConfig } from "./types";

/**
 * @internal
 */
export function recordedAccessControlFactory(
    implConfig: RecordedBackendConfig,
): IWorkspaceAccessControlService {
    return {
        getAccessList: (_sharedObjectRef: ObjRef): Promise<AccessGranteeDetail[]> => {
            const result = implConfig.accessControl?.accessList ?? [];

            return Promise.resolve(result);
        },
        grantAccess: noop as (sharedObject: ObjRef, grantees: IAccessGrantee[]) => Promise<void>,
        revokeAccess: noop as (sharedObject: ObjRef, grantess: IAccessGrantee[]) => Promise<void>,
    };
}
