// (C) 2021-2022 GoodData Corporation
import { useCallback } from "react";
import { useBackendStrict, useCancelablePromise, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { mapAccessGranteeDetailToGrantee } from "../../shareDialogMappers";
import { ObjRef, AccessGranteeDetail } from "@gooddata/sdk-model";
import { GranteeItem } from "../types";

/**
 * @internal
 */
interface IUseGetAccessListProps {
    sharedObjectRef: ObjRef;
    currentUserRef: ObjRef;
    onSuccess: (result: GranteeItem[]) => void;
    onError: (err: Error) => void;
}

/**
 * @internal
 */
export const useGetAccessList = (props: IUseGetAccessListProps): void => {
    const { sharedObjectRef, currentUserRef, onSuccess, onError } = props;
    const effectiveBackend = useBackendStrict();
    const effectiveWorkspace = useWorkspaceStrict();

    const promise = () =>
        effectiveBackend.workspace(effectiveWorkspace).accessControl().getAccessList(sharedObjectRef);

    const onSuccessCallBack = useCallback(
        (result: AccessGranteeDetail[]) => {
            const grantees = result.map((item) => mapAccessGranteeDetailToGrantee(item, currentUserRef));
            onSuccess(grantees);
        },
        [currentUserRef, onSuccess],
    );

    useCancelablePromise({ promise, onError, onSuccess: onSuccessCallBack }, [
        effectiveBackend,
        effectiveWorkspace,
        sharedObjectRef,
        onSuccessCallBack,
    ]);
};
