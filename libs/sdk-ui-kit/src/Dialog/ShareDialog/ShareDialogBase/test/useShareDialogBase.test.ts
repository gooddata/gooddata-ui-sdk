// (C) 2023 GoodData Corporation

import { act, renderHook } from "@testing-library/react-hooks";
import { idRef } from "@gooddata/sdk-model";
import noop from "lodash/noop";

import {
    defaultUser,
    granularGranteeGroup,
    granularGranteeItems,
    granularGranteesAccess,
    granularGranteeUser,
    granularGranteeUser2,
} from "./GranteeMock";

import { useShareDialogBase } from "../useShareDialogBase";
import { IGranularGranteeUser, IShareDialogBaseProps } from "../types";
import { recordedBackend, RecordedBackendConfig } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";

const recordedBackendConfig: RecordedBackendConfig = {
    userManagement: {
        accessControl: {
            accessList: granularGranteesAccess,
            availableGrantees: [],
        },
    },
};
const mockBackend = recordedBackend(ReferenceRecordings.Recordings, recordedBackendConfig);

jest.mock("@gooddata/sdk-ui", () => ({
    ...jest.requireActual("@gooddata/sdk-ui"),
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
        jest.resetAllMocks();
    });

    describe("granular permissions", () => {
        it("isShareDialogDirty should be true when granular permission is changed and onSubmitShareGrantee should be called with correct parameters", async () => {
            const onSubmit = jest.fn();
            const { result, waitForNextUpdate } = renderTestedHook({ onSubmit });
            await waitForNextUpdate();

            const updatedGrantee: IGranularGranteeUser = {
                ...granularGranteeUser,
                permissions: ["EDIT"],
            };

            expect(result.current.isShareDialogDirty).toEqual(false);

            act(() => result.current.onGranularGranteeShareChange(updatedGrantee));
            expect(result.current.isShareDialogDirty).toEqual(true);

            result.current.onSubmitShareGrantee();
            expect(onSubmit).toHaveBeenCalledWith(
                [updatedGrantee, granularGranteeGroup],
                [updatedGrantee],
                [],
                false,
                false,
            );
        });

        it("isShareDialogDirty should be true when grantee is removed and onSubmitShareGrantee should be called with correct parameters", async () => {
            const onSubmit = jest.fn();
            const { result, waitForNextUpdate } = renderTestedHook({ onSubmit });
            await waitForNextUpdate();

            expect(result.current.isShareDialogDirty).toEqual(false);

            act(() => result.current.onSharedGranteeDelete(granularGranteeUser));
            expect(result.current.isShareDialogDirty).toEqual(true);

            result.current.onSubmitShareGrantee();
            expect(onSubmit).toHaveBeenCalledWith(
                granularGranteeItems,
                [],
                [granularGranteeUser],
                false,
                false,
            );
        });

        it("isAddDialogDirty should be true when grantee is added and onSubmitAddGrantee should be called with correct parameters", async () => {
            const onSubmit = jest.fn();
            const { result, waitForNextUpdate } = renderTestedHook({ onSubmit });
            await waitForNextUpdate();

            expect(result.current.granteesToAdd).toEqual([]);

            act(() => result.current.onAddGranteeButtonClick());
            expect(result.current.isAddDialogDirty).toEqual(false);

            act(() => result.current.onGranteeAdd(granularGranteeUser2));
            expect(result.current.isAddDialogDirty).toEqual(true);
            expect(result.current.granteesToAdd).toEqual([granularGranteeUser2]);

            result.current.onSubmitAddGrantee();
            expect(onSubmit).toHaveBeenCalledWith(
                granularGranteeItems,
                [granularGranteeUser2],
                [],
                false,
                false,
            );
        });

        it("isShareDialogDirty should be true when granular permission is changed, grantee is added and back button action is used", async () => {
            const onSubmit = jest.fn();
            const { result, waitForNextUpdate } = renderTestedHook({ onSubmit });
            await waitForNextUpdate();

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

            result.current.onSubmitShareGrantee();
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
