// (C) 2021 GoodData Corporation
import { useCallback } from "react";
import { useBackendStrict, useCancelablePromise, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { AccessGranteeDetail } from "@gooddata/sdk-backend-spi";
import { mapAccessGranteeDetailToGrantee } from "../../shareDialogMappers";
import { ObjRef } from "@gooddata/sdk-model";
import { GranteeItem } from "../types";

/**
 * @internal
 */
interface IUseGetAccessListProps {
    sharedObjectRef: ObjRef;
    onSuccess: (result: GranteeItem[]) => void;
    onError: (err: Error) => void;
}

/**
 * @internal
 */
export const useGetAccessList = (props: IUseGetAccessListProps): void => {
    const { sharedObjectRef, onSuccess, onError } = props;
    const effectiveBackend = useBackendStrict();
    const effectiveWorkspace = useWorkspaceStrict();

    const promise = () =>
        effectiveBackend.workspace(effectiveWorkspace).accessControl().getAccessList(sharedObjectRef);

    const onSuccessCallBack = useCallback(
        (result: AccessGranteeDetail[]) => {
            const grantees = result.map(mapAccessGranteeDetailToGrantee);
            onSuccess(grantees);
        },
        [onSuccess],
    );

    useCancelablePromise({ promise, onError, onSuccess: onSuccessCallBack }, [
        effectiveBackend,
        effectiveWorkspace,
        sharedObjectRef,
        onSuccessCallBack,
    ]);
};
