// (C) 2019 GoodData Corporation
import React from "react";
import { mount, ReactWrapper } from "enzyme";
import { AddGranteeSelect } from "../AddGranteeSelect";
import { IAddGranteeSelectProps } from "../types";
import { noop } from "lodash";
import { BackendProvider, withIntl, WorkspaceProvider } from "@gooddata/sdk-ui";
import { recordedBackend, RecordedBackendConfig } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { IWorkspaceUser, IWorkspaceUserGroup } from "@gooddata/sdk-backend-spi";
import { groupAll, workSpaceGroup, workspaceUser } from "./GranteeMock";
import { mapWorkspaceUserGroupToGrantee, mapWorkspaceUserToGrantee } from "../../shareDialogMappers";
import { getGranteeItemTestId } from "../utils";

const defaultProps: IAddGranteeSelectProps = {
    onSelectGrantee: noop,
    appliedGrantees: [],
};

const createComponent = (
    customProps: Partial<IAddGranteeSelectProps> = {},
    users: IWorkspaceUser[] = [],
    groups: IWorkspaceUserGroup[] = [],
): ReactWrapper => {
    const props: IAddGranteeSelectProps = { ...defaultProps, ...customProps };
    const config: RecordedBackendConfig = {
        users: {
            users: users,
        },
        userGroup: {
            userGroups: groups,
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
    return wrapper.find(".s-gd-grantee-item-id-option-groupAll").hostNodes().length === 1;
}

function isNoMatchingMessageVisible(wrapper: ReactWrapper) {
    return wrapper.find(".s-gd-share-dialog-no-option").hostNodes().length === 1;
}

function isErrorMessageVisible(wrapper: ReactWrapper) {
    return wrapper.find(".s-gd-share-dialog-option-error").hostNodes().length === 1;
}

function getUserOptionSelector(user: IWorkspaceUser): string {
    return `.${getGranteeItemTestId(mapWorkspaceUserToGrantee(user), "option")}`;
}

function getGroupOptionSelector(group: IWorkspaceUserGroup): string {
    return `.${getGranteeItemTestId(mapWorkspaceUserGroupToGrantee(group), "option")}`;
}

function isOptionVisible(wrapper: ReactWrapper, selector: string) {
    return wrapper.find(selector).hostNodes().length === 1;
}

function clickOnOption(wrapper: ReactWrapper, selector: string) {
    wrapper.find(selector).simulate("click");
}

const flushPromises = () => new Promise(setImmediate);

describe("AddGranteeSelect", () => {
    it("should render without crash", () => {
        createComponent();
    });

    it("it should render open menu and close outside click", () => {
        const wrapper = createComponent();
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
        //error is simulated by mocking not valid IWorkspaceUser (null)
        //and it filed and component should show error message
        const wrapper = createComponent({ appliedGrantees: [groupAll] }, [null]);
        await flushPromises();
        wrapper.update();

        expect(isErrorMessageVisible(wrapper)).toBe(true);
    });

    it("it should render one user and group as option", async () => {
        const wrapper = createComponent({ appliedGrantees: [groupAll] }, [workspaceUser], [workSpaceGroup]);
        await flushPromises();
        wrapper.update();
        expect(isOptionVisible(wrapper, getUserOptionSelector(workspaceUser))).toBe(true);
        expect(isOptionVisible(wrapper, getGroupOptionSelector(workSpaceGroup))).toBe(true);
    });

    it("it should close options and call onSelectGrantee when option is selected", async () => {
        const onSelectGrantee = jest.fn();

        const wrapper = createComponent(
            { appliedGrantees: [groupAll], onSelectGrantee },
            [workspaceUser],
            [workSpaceGroup],
        );
        await flushPromises();
        wrapper.update();

        const userSelector = getUserOptionSelector(workspaceUser);
        const expectedPayload = mapWorkspaceUserToGrantee(workspaceUser);

        clickOnOption(wrapper, userSelector);
        wrapper.update();

        expect(onSelectGrantee).toHaveBeenCalledTimes(1);
        expect(onSelectGrantee).toHaveBeenLastCalledWith(expectedPayload);
        expect(isMenuIsVisible(wrapper)).toBe(false);
    });
});
