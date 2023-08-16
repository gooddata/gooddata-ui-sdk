// (C) 2019-2023 GoodData Corporation
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AddGranteeSelect } from "../AddGranteeSelect.js";
import { IAddGranteeSelectProps } from "../types.js";
import { noop } from "lodash";
import { BackendProvider, withIntl, WorkspaceProvider } from "@gooddata/sdk-ui";
import {
    defaultRecordedBackendCapabilities,
    recordedBackend,
    RecordedBackendConfig,
} from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import {
    availableUserAccessGrantee,
    availableUserGroupAccessGrantee,
    defaultUser,
    groupAll,
} from "./GranteeMock.js";
import { mapWorkspaceUserToGrantee } from "../../shareDialogMappers.js";
import { uriRef, IAvailableAccessGrantee } from "@gooddata/sdk-model";
import { describe, it, expect, vi } from "vitest";
import { IBackendCapabilities } from "sdk-backend-spi/esm/index.js";

const defaultProps: IAddGranteeSelectProps = {
    onSelectGrantee: noop,
    appliedGrantees: [],
    currentUser: defaultUser,
    sharedObjectRef: uriRef("shared-object"),
};

const createComponent = (
    customProps: Partial<IAddGranteeSelectProps> = {},
    availableGrantees: IAvailableAccessGrantee[] = [],
    backendCapabilities: Partial<IBackendCapabilities> = {},
) => {
    const props: IAddGranteeSelectProps = { ...defaultProps, ...customProps };
    const config: RecordedBackendConfig = {
        userManagement: {
            accessControl: {
                availableGrantees,
            },
        },
    };

    const backend = recordedBackend(ReferenceRecordings.Recordings, config, {
        ...defaultRecordedBackendCapabilities,
        ...backendCapabilities,
    });
    const Wrapped = withIntl(AddGranteeSelect);

    return render(
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace={"foo"}>
                <Wrapped {...props} />
            </WorkspaceProvider>
        </BackendProvider>,
    );
};

function getMenuList() {
    return screen.queryByLabelText("Share dialog menu list");
}

function getGroupAll() {
    return screen.queryByText("All users");
}

function getGrantee(name: string) {
    return screen.queryByText(name);
}

describe("AddGranteeSelect", () => {
    it("it should render open menu", async () => {
        createComponent();

        await waitFor(() => {
            expect(getMenuList()).toBeInTheDocument();
        });
    });

    it("it should render one all group option when is not specified in appliedGrantees", async () => {
        createComponent();

        await waitFor(() => {
            expect(getGroupAll()).toBeInTheDocument();
        });
    });

    it("it should render one all group option when is not specified in appliedGrantees and the supportsGranularAccessControl is enabled", async () => {
        createComponent({}, [], { supportsGranularAccessControl: true });

        await waitFor(() => {
            expect(getGroupAll()).toBeInTheDocument();
        });
    });

    it("it should not render all group option when is specified in appliedGrantees", async () => {
        createComponent({ appliedGrantees: [groupAll] });

        await waitFor(() => {
            expect(getGroupAll()).not.toBeInTheDocument();
        });
    });

    it("it should not render all group option when is specified in appliedGrantees and the supportsGranularAccessControl is enabled", async () => {
        createComponent({ appliedGrantees: [groupAll] }, [], { supportsGranularAccessControl: true });

        await waitFor(() => {
            expect(getGroupAll()).not.toBeInTheDocument();
        });
    });

    it("it should render no matching message when backend return empty array", async () => {
        createComponent({ appliedGrantees: [groupAll] });

        await waitFor(() => {
            expect(screen.queryByLabelText("Share dialog no match")).toBeInTheDocument();
        });
    });

    it("it should render error message when backend return error or invalid data", async () => {
        //error is simulated by mocking not valid IWorkspaceUser ({})
        //and it filed and component should show error message
        createComponent({ appliedGrantees: [groupAll] }, {} as IAvailableAccessGrantee[]);

        await waitFor(() => {
            expect(screen.queryByLabelText("Share dialog error")).toBeInTheDocument();
        });
    });

    it("it should render one user and group as option", async () => {
        createComponent({ appliedGrantees: [groupAll] }, [
            availableUserAccessGrantee,
            availableUserGroupAccessGrantee,
        ]);

        await waitFor(() => {
            expect(getGrantee(availableUserAccessGrantee.name)).toBeInTheDocument();
            expect(getGrantee(availableUserGroupAccessGrantee.name)).toBeInTheDocument();
        });
    });

    it("it should close options and call onSelectGrantee when option is selected", async () => {
        const onSelectGrantee = vi.fn();

        createComponent({ appliedGrantees: [groupAll], onSelectGrantee }, [
            availableUserAccessGrantee,
            availableUserGroupAccessGrantee,
        ]);

        const expectedPayload = mapWorkspaceUserToGrantee(availableUserAccessGrantee, defaultUser);

        const grantee = await screen.findByText(availableUserAccessGrantee.name);
        fireEvent.click(grantee);

        await waitFor(() => {
            expect(onSelectGrantee).toHaveBeenCalledTimes(1);
            expect(onSelectGrantee).toHaveBeenLastCalledWith(expectedPayload);
            expect(getMenuList()).not.toBeInTheDocument();
        });
    });
});
