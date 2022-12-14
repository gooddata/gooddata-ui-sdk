// (C) 2021-2022 GoodData Corporation
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
    hasGranularChanged: boolean;
    onLoadGrantees: (grantees: GranteeItem[], groupAll: IGranteeGroupAll | undefined) => void;
    onSharedGranteeDelete: (grantee: GranteeItem) => void;
    onAddedGranteeDelete: (grantee: GranteeItem) => void;
    onGranteeAdd: (grantee: GranteeItem) => void;
    onAddGranteeButtonClick: () => void;
    onAddGranteeBackClick: () => void;
    onUnderLenientControlChange: (isUnderLenientControl: boolean) => void;
    onLockChange: (isLocked: boolean) => void;
    onGranularGranteeChange?: (grantee: GranteeItem) => void;
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
    const [hasGranularChanged, setGranularChanged] = useState<boolean>(false);

    const onGranularGranteeChange = useCallback((grantee: GranteeItem) => {
        // TODO: is this proper way?
        if (dialogMode === "ShareGrantee") {
            setGrantees((state) => state.map((s) => (s.id === grantee.id ? grantee : s)));
        } else {
            setGranteesToAdd((state) => state.map((s) => (s.id === grantee.id ? grantee : s)));
        }

        setGranularChanged(true);
    }, []);

    const onSharedGranteeDelete = useCallback((grantee: GranteeItem) => {
        setGranteesToDelete((state) => [...state, grantee]);
    }, []);

    const onAddedGranteeDelete = useCallback((grantee: GranteeItem) => {
        setGranteesToAdd((state) => state.filter((g) => !areObjRefsEqual(g.id, grantee.id)));
    }, []);

    const onGranteeAdd = useCallback((grantee: GranteeItem) => {
        setGranteesToAdd((state) => [...state, grantee]);
    }, []);

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
        hasGranularChanged,
        onUnderLenientControlChange,
        onLockChange,
        onGranularGranteeChange,
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
    onGranularGranteeChange?: (grantee: GranteeItem) => void;
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
        hasGranularChanged,
        onLoadGrantees,
        onSharedGranteeDelete,
        onAddedGranteeDelete,
        onGranteeAdd,
        onAddGranteeButtonClick,
        onAddGranteeBackClick,
        onLockChange,
        onUnderLenientControlChange,
        onGranularGranteeChange,
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
        [onLoadGrantees, shareStatus],
    );

    useGetAccessList({ currentUserRef, sharedObjectRef: ref, onSuccess: onLoadGranteesSuccess, onError });

    const isShareDialogDirty = useMemo(() => {
        const isDirty =
            granteesToDelete.length !== 0 ||
            isLocked !== isLockedNow ||
            isUnderLenientControl !== isUnderLenientControlNow;

        if (areGranularPermissionsSupported) {
            return granteesToDelete.length !== 0 || hasGranularChanged;
        } else {
            return isDirty;
        }
    }, [
        granteesToDelete,
        isLocked,
        isLockedNow,
        isUnderLenientControl,
        isUnderLenientControlNow,
        hasGranularChanged,
        areGranularPermissionsSupported,
    ]);

    const isAddDialogDirty = useMemo(() => {
        return granteesToAdd.length !== 0;
    }, [granteesToDelete, granteesToAdd]);

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
    }, [grantees, granteesToDelete, granteesToAdd]);

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
        onGranularGranteeChange,
        isUnderLenientControlNow,
        isLockedNow,
    };
};
