// (C) 2019-2023 GoodData Corporation
import React from "react";
import { mount, ReactWrapper } from "enzyme";
import { AddGranteeSelect } from "../AddGranteeSelect";
import { IAddGranteeSelectProps } from "../types";
import { noop } from "lodash";
import { BackendProvider, withIntl, WorkspaceProvider } from "@gooddata/sdk-ui";
import { recordedBackend, RecordedBackendConfig } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import {
    availableUserAccessGrantee,
    availableUserGroupAccessGrantee,
    defaultUser,
    groupAll,
} from "./GranteeMock";
import { mapWorkspaceUserToGrantee, mapWorkspaceUserGroupToGrantee } from "../../shareDialogMappers";
import { getGranteeItemTestId } from "../utils";
import {
    uriRef,
    IAvailableUserAccessGrantee,
    IAvailableUserGroupAccessGrantee,
    IAvailableAccessGrantee,
} from "@gooddata/sdk-model";
import { act } from "react-dom/test-utils";

const defaultProps: IAddGranteeSelectProps = {
    onSelectGrantee: noop,
    appliedGrantees: [],
    currentUser: defaultUser,
    sharedObjectRef: uriRef("shared-object"),
};

const createComponent = (
    customProps: Partial<IAddGranteeSelectProps> = {},
    availableGrantees: IAvailableAccessGrantee[] = [],
): ReactWrapper => {
    const props: IAddGranteeSelectProps = { ...defaultProps, ...customProps };
    const config: RecordedBackendConfig = {
        userManagement: {
            accessControl: {
                availableGrantees,
            },
        },
    };

    const backend = recordedBackend(ReferenceRecordings.Recordings, config);
    const Wrapped = withIntl(AddGranteeSelect);

    return mount(
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace={"foo"}>
                <Wrapped {...props} />
            </WorkspaceProvider>
        </BackendProvider>,
    );
};

function isMenuIsVisible(wrapper: ReactWrapper) {
    return wrapper.find(".s-gd-share-dialog-menu").hostNodes().length === 1;
}

function isGroupAllOptionVisible(wrapper: ReactWrapper) {
    return wrapper.find(".s-gd-grantee-item-id-option-groupall").hostNodes().length === 1;
}

function isNoMatchingMessageVisible(wrapper: ReactWrapper) {
    return wrapper.find(".s-gd-share-dialog-no-option").hostNodes().length === 1;
}

function isErrorMessageVisible(wrapper: ReactWrapper) {
    return wrapper.find(".s-gd-share-dialog-option-error").hostNodes().length === 1;
}

function getUserOptionSelector(user: IAvailableUserAccessGrantee): string {
    return `.${getGranteeItemTestId(mapWorkspaceUserToGrantee(user, defaultUser), "option")}`;
}

function getGroupOptionSelector(group: IAvailableUserGroupAccessGrantee): string {
    return `.${getGranteeItemTestId(mapWorkspaceUserGroupToGrantee(group), "option")}`;
}

function isOptionVisible(wrapper: ReactWrapper, selector: string) {
    return wrapper.find(selector).hostNodes().length === 1;
}

function clickOnOption(wrapper: ReactWrapper, selector: string) {
    wrapper.find(selector).simulate("click");
}

const flushPromises = async () =>
    act(
        () =>
            new Promise((resolve) => {
                // setImmediate is
                setTimeout(() => {
                    resolve();
                }, 10);
            }),
    );

describe("AddGranteeSelect", () => {
    it("it should render open menu and close outside click", async () => {
        const wrapper = createComponent();
        await flushPromises();
        expect(isMenuIsVisible(wrapper)).toBe(true);
    });

    it("it should render one all group option when is not specified in appliedGrantees", async () => {
        const wrapper = createComponent();
        await flushPromises();
        wrapper.update();
        expect(isGroupAllOptionVisible(wrapper)).toBe(true);
    });

    it("it should not render all group option when is specified in appliedGrantees", async () => {
        const wrapper = createComponent({ appliedGrantees: [groupAll] });
        await flushPromises();
        wrapper.update();
        expect(isGroupAllOptionVisible(wrapper)).toBe(false);
    });

    it("it should render no matching message when backend return empty array", async () => {
        const wrapper = createComponent({ appliedGrantees: [groupAll] });
        await flushPromises();
        wrapper.update();
        expect(isNoMatchingMessageVisible(wrapper)).toBe(true);
    });

    it("it should render error message when backend return error or invalid data", async () => {
        //error is simulated by mocking not valid IWorkspaceUser ({})
        //and it filed and component should show error message
        const wrapper = createComponent({ appliedGrantees: [groupAll] }, {} as IAvailableAccessGrantee[]);
        await flushPromises();
        wrapper.update();

        expect(isErrorMessageVisible(wrapper)).toBe(true);
    });

    it("it should render one user and group as option", async () => {
        const wrapper = createComponent({ appliedGrantees: [groupAll] }, [
            availableUserAccessGrantee,
            availableUserGroupAccessGrantee,
        ]);
        await flushPromises();
        wrapper.update();
        expect(isOptionVisible(wrapper, getUserOptionSelector(availableUserAccessGrantee))).toBe(true);
        expect(isOptionVisible(wrapper, getGroupOptionSelector(availableUserGroupAccessGrantee))).toBe(true);
    });

    it("it should close options and call onSelectGrantee when option is selected", async () => {
        const onSelectGrantee = jest.fn();

        const wrapper = createComponent({ appliedGrantees: [groupAll], onSelectGrantee }, [
            availableUserAccessGrantee,
            availableUserGroupAccessGrantee,
        ]);
        await flushPromises();
        wrapper.update();

        const userSelector = getUserOptionSelector(availableUserAccessGrantee);
        const expectedPayload = mapWorkspaceUserToGrantee(availableUserAccessGrantee, defaultUser);

        clickOnOption(wrapper, userSelector);
        wrapper.update();

        expect(onSelectGrantee).toHaveBeenCalledTimes(1);
        expect(onSelectGrantee).toHaveBeenLastCalledWith(expectedPayload);
        expect(isMenuIsVisible(wrapper)).toBe(false);
    });
});
