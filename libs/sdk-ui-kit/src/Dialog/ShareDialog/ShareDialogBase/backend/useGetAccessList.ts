// (C) 2021-2023 GoodData Corporation
import { useCallback } from "react";
import { useBackendStrict, useCancelablePromise, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { mapAccessGranteeDetailToGrantee } from "../../shareDialogMappers.js";
import { ObjRef, AccessGranteeDetail, IUser } from "@gooddata/sdk-model";
import { GranteeItem } from "../types.js";

/**
 * @internal
 */
interface IUseGetAccessListProps {
    sharedObjectRef: ObjRef;
    currentUser: IUser;
    onSuccess: (result: GranteeItem[]) => void;
    onError: (err: Error) => void;
}

/**
 * @internal
 */
export const useGetAccessList = (props: IUseGetAccessListProps): void => {
    const { sharedObjectRef, currentUser, onSuccess, onError } = props;
    const effectiveBackend = useBackendStrict();
    const effectiveWorkspace = useWorkspaceStrict();

    const promise = () =>
        effectiveBackend.workspace(effectiveWorkspace).accessControl().getAccessList(sharedObjectRef);

    const onSuccessCallBack = useCallback(
        (result: AccessGranteeDetail[]) => {
            const grantees = result.map((item) => mapAccessGranteeDetailToGrantee(item, currentUser));
            onSuccess(grantees);
        },
        [currentUser, onSuccess],
    );

    useCancelablePromise({ promise, onError, onSuccess: onSuccessCallBack }, [
        effectiveBackend,
        effectiveWorkspace,
        sharedObjectRef,
        onSuccessCallBack,
    ]);
};
