// (C) 2021-2023 GoodData Corporation
import { useCallback, useMemo, useState } from "react";
import { areObjRefsEqual } from "@gooddata/sdk-model";
import {
    DialogModeType,
    GranteeItem,
    IGranteeGroupAll,
    isGranteeUserInactive,
    IShareDialogBaseProps,
} from "./types";
import { notInArrayFilter, getAppliedGrantees } from "./utils";
import { useGetAccessList } from "./backend/useGetAccessList";
import { mapShareStatusToGroupAll } from "../shareDialogMappers";

/**
 * @internal
 */
interface IUseShareDialogStateReturnType {
    dialogMode: DialogModeType;
    isGranteesLoading: boolean;
    grantees: GranteeItem[];
    granteesToAdd: GranteeItem[];
    granteesToDelete: GranteeItem[];
    isUnderLenientControlNow: boolean;
    isLockedNow: boolean;
    hasGranularPermissionsChanged: boolean;
    onLoadGrantees: (grantees: GranteeItem[], groupAll: IGranteeGroupAll | undefined) => void;
    onSharedGranteeDelete: (grantee: GranteeItem) => void;
    onAddedGranteeDelete: (grantee: GranteeItem) => void;
    onGranteeAdd: (grantee: GranteeItem) => void;
    onAddGranteeButtonClick: () => void;
    onAddGranteeBackClick: () => void;
    onUnderLenientControlChange: (isUnderLenientControl: boolean) => void;
    onLockChange: (isLocked: boolean) => void;
    onGranularGranteeShareChange?: (grantee: GranteeItem) => void;
    onGranularGranteeAddChange?: (grantee: GranteeItem) => void;
}

/**
 * @internal
 */
const useShareDialogState = (
    isUnderLenientControl: boolean,
    isLocked: boolean,
): IUseShareDialogStateReturnType => {
    const [dialogMode, setDialogMode] = useState<DialogModeType>("ShareGrantee");
    const [isGranteesLoading, setIsGranteesLoading] = useState(true);
    const [grantees, setGrantees] = useState<GranteeItem[]>([]);
    const [granteesToAdd, setGranteesToAdd] = useState<GranteeItem[]>([]);
    const [granteesToDelete, setGranteesToDelete] = useState<GranteeItem[]>([]);
    const [isUnderLenientControlNow, setUnderLenientControlNow] = useState(isUnderLenientControl);
    const [isLockedNow, setLockedNow] = useState(isLocked);
    const [hasGranularPermissionsChanged, setHasGranularPermissionsChanged] = useState<boolean>(false);

    const onGranularGranteeAddChange = useCallback((grantee: GranteeItem) => {
        setGranteesToAdd((state) => state.map((s) => (areObjRefsEqual(s.id, grantee.id) ? grantee : s)));
    }, []);

    const onSharedGranteeDelete = useCallback((grantee: GranteeItem) => {
        setGranteesToDelete((state) => [...state, grantee]);
        setGrantees((state) => state.map((s) => (areObjRefsEqual(s.id, grantee.id) ? grantee : s)));
    }, []);

    const onAddedGranteeDelete = useCallback((grantee: GranteeItem) => {
        setGranteesToAdd((state) => state.filter((g) => !areObjRefsEqual(g.id, grantee.id)));
    }, []);

    const onGranteeAdd = useCallback((grantee: GranteeItem) => {
        setGranteesToAdd((state) => [...state, grantee]);
    }, []);

    const onGranularGranteeShareChange = useCallback(
        (grantee: GranteeItem) => {
            onGranteeAdd(grantee);
            setGrantees((state) => state.map((s) => (areObjRefsEqual(s.id, grantee.id) ? grantee : s)));
            setHasGranularPermissionsChanged(true);
        },
        [onGranteeAdd],
    );

    const onAddGranteeButtonClick = useCallback(() => {
        setDialogMode("AddGrantee");
    }, []);

    const onAddGranteeBackClick = useCallback(() => {
        setDialogMode("ShareGrantee");
        setGranteesToAdd([]);
    }, []);

    const onLoadGrantees = useCallback((grantees: GranteeItem[], groupAll: IGranteeGroupAll | undefined) => {
        if (groupAll) {
            setGrantees([...grantees, groupAll]);
        } else {
            setGrantees(grantees);
        }

        setIsGranteesLoading(false);
    }, []);

    const onUnderLenientControlChange = useCallback((isUnderLenientControl: boolean) => {
        setUnderLenientControlNow(isUnderLenientControl);
    }, []);

    const onLockChange = useCallback((isLocked: boolean) => {
        setLockedNow(isLocked);
    }, []);

    return {
        dialogMode,
        isGranteesLoading,
        grantees,
        granteesToAdd,
        granteesToDelete,
        onLoadGrantees,
        onSharedGranteeDelete,
        onAddedGranteeDelete,
        onGranteeAdd,
        onAddGranteeButtonClick,
        onAddGranteeBackClick,
        isUnderLenientControlNow,
        isLockedNow,
        hasGranularPermissionsChanged,
        onUnderLenientControlChange,
        onLockChange,
        onGranularGranteeShareChange,
        onGranularGranteeAddChange,
    };
};

/**
 * @internal
 */
export interface IUseShareDialogBaseReturnType {
    onAddedGranteeDelete: (grantee: GranteeItem) => void;
    onSharedGranteeDelete: (grantee: GranteeItem) => void;
    onAddGranteeBackClick: () => void;
    onAddGranteeButtonClick: () => void;
    onGranteeAdd: (grantee: GranteeItem) => void;
    onSubmitShareGrantee: () => void;
    onSubmitAddGrantee: () => void;
    isGranteesLoading: boolean;
    granteesToAdd: GranteeItem[];
    dialogMode: DialogModeType;
    isShareDialogDirty: boolean;
    isAddDialogDirty: boolean;
    sharedGrantees: GranteeItem[];
    appliedGranteesWithOwner: GranteeItem[];
    isLockedNow: boolean;
    isUnderLenientControlNow: boolean;
    onLockChange: (locked: boolean) => void;
    onUnderLenientControlChange: (isUnderLenientControl: boolean) => void;
    onGranularGranteeShareChange?: (grantee: GranteeItem) => void;
    onGranularGranteeAddChange?: (grantee: GranteeItem) => void;
}

/**
 * @internal
 */
export const useShareDialogBase = (props: IShareDialogBaseProps): IUseShareDialogBaseReturnType => {
    const { sharedObject, currentUserRef, onSubmit, onError } = props;
    const { ref, shareStatus, owner, isUnderLenientControl, isLocked, areGranularPermissionsSupported } =
        sharedObject;

    const {
        dialogMode,
        isGranteesLoading,
        isLockedNow,
        isUnderLenientControlNow,
        grantees,
        granteesToAdd,
        granteesToDelete,
        hasGranularPermissionsChanged,
        onLoadGrantees,
        onSharedGranteeDelete,
        onAddedGranteeDelete,
        onGranteeAdd,
        onAddGranteeButtonClick,
        onAddGranteeBackClick,
        onLockChange,
        onUnderLenientControlChange,
        onGranularGranteeAddChange,
        onGranularGranteeShareChange,
    } = useShareDialogState(isUnderLenientControl, isLocked);

    const onLoadGranteesSuccess = useCallback(
        (result: GranteeItem[]) => {
            if (areGranularPermissionsSupported) {
                onLoadGrantees(result, undefined);
            } else {
                const groupAll = mapShareStatusToGroupAll(shareStatus);
                onLoadGrantees(result, groupAll);
            }
        },
        [onLoadGrantees, shareStatus, areGranularPermissionsSupported],
    );

    useGetAccessList({ currentUserRef, sharedObjectRef: ref, onSuccess: onLoadGranteesSuccess, onError });

    const isShareDialogDirty = useMemo(() => {
        if (areGranularPermissionsSupported) {
            return granteesToDelete.length !== 0 || hasGranularPermissionsChanged;
        } else {
            return (
                granteesToDelete.length !== 0 ||
                isLocked !== isLockedNow ||
                isUnderLenientControl !== isUnderLenientControlNow
            );
        }
    }, [
        granteesToDelete,
        isLocked,
        isLockedNow,
        isUnderLenientControl,
        isUnderLenientControlNow,
        hasGranularPermissionsChanged,
        areGranularPermissionsSupported,
    ]);

    const isAddDialogDirty = useMemo(() => {
        return granteesToAdd.length !== 0;
    }, [granteesToAdd]);

    const onSubmitShareGrantee = useCallback(() => {
        if (!isShareDialogDirty) {
            return;
        }
        onSubmit(grantees, granteesToAdd, granteesToDelete, isUnderLenientControlNow, isLockedNow);
    }, [
        grantees,
        granteesToAdd,
        granteesToDelete,
        isShareDialogDirty,
        isUnderLenientControlNow,
        isLockedNow,
        onSubmit,
    ]);

    const onSubmitAddGrantee = useCallback(() => {
        if (!isAddDialogDirty) {
            return;
        }
        onSubmit(grantees, granteesToAdd, granteesToDelete, isUnderLenientControlNow, isLockedNow);
    }, [
        grantees,
        granteesToAdd,
        granteesToDelete,
        isAddDialogDirty,
        isUnderLenientControlNow,
        isLockedNow,
        onSubmit,
    ]);

    const sharedGrantees = useMemo(() => {
        return notInArrayFilter(grantees, granteesToDelete);
    }, [grantees, granteesToDelete]);

    const appliedGranteesWithOwner = useMemo(() => {
        const appliedGrantees = getAppliedGrantees(grantees, granteesToAdd, granteesToDelete);
        if (isGranteeUserInactive(owner) || areGranularPermissionsSupported) {
            return appliedGrantees;
        }
        return [...appliedGrantees, owner];
    }, [grantees, granteesToDelete, granteesToAdd, areGranularPermissionsSupported, owner]);

    return {
        onAddedGranteeDelete,
        onSharedGranteeDelete,
        onAddGranteeBackClick,
        onAddGranteeButtonClick,
        onGranteeAdd,
        onSubmitShareGrantee,
        onSubmitAddGrantee,
        isGranteesLoading,
        granteesToAdd,
        dialogMode,
        isShareDialogDirty,
        isAddDialogDirty,
        sharedGrantees,
        appliedGranteesWithOwner,
        onLockChange,
        onUnderLenientControlChange,
        onGranularGranteeShareChange,
        onGranularGranteeAddChange,
        isUnderLenientControlNow,
        isLockedNow,
    };
};
