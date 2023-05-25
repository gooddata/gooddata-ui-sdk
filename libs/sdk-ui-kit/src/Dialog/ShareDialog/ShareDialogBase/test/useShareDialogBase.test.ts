// (C) 2023 GoodData Corporation

import { act, renderHook, waitFor } from "@testing-library/react";
import { idRef } from "@gooddata/sdk-model";
import noop from "lodash/noop.js";

import {
    defaultUser,
    granularGranteeGroup,
    granularGranteeItems,
    granularGranteesAccess,
    granularGranteeUser,
    granularGranteeUser2,
} from "./GranteeMock.js";

import { useShareDialogBase } from "../useShareDialogBase.js";
import { IGranularGranteeUser, IShareDialogBaseProps } from "../types.js";
import { recordedBackend, RecordedBackendConfig } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { describe, it, expect, vi, afterEach } from "vitest";

const recordedBackendConfig: RecordedBackendConfig = {
    userManagement: {
        accessControl: {
            accessList: granularGranteesAccess,
            availableGrantees: [],
        },
    },
};
const mockBackend = recordedBackend(ReferenceRecordings.Recordings, recordedBackendConfig);

vi.mock("@gooddata/sdk-ui", async () => ({
    ...((await vi.importActual("@gooddata/sdk-ui")) as object),
    useBackendStrict: () => mockBackend,
    useWorkspaceStrict: () => "workspace",
}));

const defaultProps: IShareDialogBaseProps = {
    sharedObject: {
        ref: idRef("sharedObject"),
        shareStatus: "shared",
        owner: undefined,
        isLeniencyControlSupported: false,
        isLocked: false,
        isUnderLenientControl: false,
        isLockingSupported: false,
        isMetadataObjectLockingSupported: false,
        areGranularPermissionsSupported: true,
    },
    currentUser: defaultUser,
    isCurrentUserWorkspaceManager: false,
    currentUserPermissions: {
        canViewAffectedObject: true,
        canShareAffectedObject: true,
        canShareLockedAffectedObject: true,
        canEditAffectedObject: true,
        canEditLockedAffectedObject: true,
    },
    onCancel: noop,
    onSubmit: noop,
    onError: noop,
};

const renderTestedHook = (props?: Partial<IShareDialogBaseProps>) => {
    return renderHook(() => useShareDialogBase({ ...defaultProps, ...props }));
};

describe("useShareDialogBase", () => {
    afterEach(() => {
        vi.resetAllMocks();
    });

    describe("granular permissions", () => {
        it("isShareDialogDirty should be true when granular permission is changed and onSubmitShareGrantee should be called with correct parameters", async () => {
            const onSubmit = vi.fn();
            const { result } = renderTestedHook({ onSubmit });
            await waitFor(() => {
                expect(result.current.isGranteesLoading).toEqual(false);
            });

            const updatedGrantee: IGranularGranteeUser = {
                ...granularGranteeUser,
                permissions: ["EDIT"],
            };

            expect(result.current.isShareDialogDirty).toEqual(false);
            act(() => result.current.onGranularGranteeShareChange(updatedGrantee));
            expect(result.current.isShareDialogDirty).toEqual(true);
            act(() => result.current.onSubmitShareGrantee());

            expect(onSubmit).toHaveBeenCalledWith(
                [updatedGrantee, granularGranteeGroup],
                [updatedGrantee],
                [],
                false,
                false,
            );
        });

        it("isShareDialogDirty should be true when grantee is removed and onSubmitShareGrantee should be called with correct parameters", async () => {
            const onSubmit = vi.fn();
            const { result } = renderTestedHook({ onSubmit });
            await waitFor(() => {
                expect(result.current.isGranteesLoading).toEqual(false);
            });

            expect(result.current.isShareDialogDirty).toEqual(false);
            act(() => result.current.onSharedGranteeDelete(granularGranteeUser));
            expect(result.current.isShareDialogDirty).toEqual(true);
            act(() => result.current.onSubmitShareGrantee());

            expect(onSubmit).toHaveBeenCalledWith(
                granularGranteeItems,
                [],
                [granularGranteeUser],
                false,
                false,
            );
        });

        it("isAddDialogDirty should be true when grantee is added and onSubmitAddGrantee should be called with correct parameters", async () => {
            const onSubmit = vi.fn();
            const { result } = renderTestedHook({ onSubmit });
            await waitFor(() => {
                expect(result.current.isGranteesLoading).toEqual(false);
            });

            expect(result.current.granteesToAdd).toEqual([]);

            act(() => result.current.onAddGranteeButtonClick());
            expect(result.current.isAddDialogDirty).toEqual(false);

            act(() => result.current.onGranteeAdd(granularGranteeUser2));
            expect(result.current.isAddDialogDirty).toEqual(true);
            expect(result.current.granteesToAdd).toEqual([granularGranteeUser2]);

            act(() => result.current.onSubmitAddGrantee());

            expect(onSubmit).toHaveBeenCalledWith(
                granularGranteeItems,
                [granularGranteeUser2],
                [],
                false,
                false,
            );
        });

        it("isShareDialogDirty should be true when granular permission is changed, grantee is added and back button action is used", async () => {
            const onSubmit = vi.fn();
            const { result } = renderTestedHook({ onSubmit });
            await waitFor(() => {
                expect(result.current.isGranteesLoading).toEqual(false);
            });

            const updatedGrantee: IGranularGranteeUser = {
                ...granularGranteeUser,
                permissions: ["EDIT"],
            };

            expect(result.current.granteesToAdd).toEqual([]);
            expect(result.current.isShareDialogDirty).toEqual(false);
            expect(result.current.isAddDialogDirty).toEqual(false);

            act(() => result.current.onGranularGranteeShareChange(updatedGrantee));
            expect(result.current.granteesToAdd).toEqual([]);
            expect(result.current.isShareDialogDirty).toEqual(true);
            expect(result.current.isAddDialogDirty).toEqual(false);

            act(() => result.current.onAddGranteeButtonClick());
            expect(result.current.granteesToAdd).toEqual([]);
            expect(result.current.isShareDialogDirty).toEqual(true);
            expect(result.current.isAddDialogDirty).toEqual(false);

            act(() => result.current.onGranteeAdd(granularGranteeUser2));
            expect(result.current.granteesToAdd).toEqual([granularGranteeUser2]);
            expect(result.current.isShareDialogDirty).toEqual(true);
            expect(result.current.isAddDialogDirty).toEqual(true);

            act(() => result.current.onAddGranteeBackClick());
            expect(result.current.granteesToAdd).toEqual([]);
            expect(result.current.isShareDialogDirty).toEqual(true);
            expect(result.current.isAddDialogDirty).toEqual(false);

            act(() => result.current.onSubmitShareGrantee());

            expect(onSubmit).toHaveBeenCalledWith(
                [updatedGrantee, granularGranteeGroup],
                [updatedGrantee],
                [],
                false,
                false,
            );
        });
    });
});
