// (C) 2019 GoodData Corporation
import { ReferenceLdm, ReferenceRecordings } from "@gooddata/reference-workspace";
import { attributeIdentifier, idRef } from "@gooddata/sdk-model";
import React from "react";
import { mount } from "enzyme";
import { recordedBackend } from "@gooddata/sdk-backend-mockingbird";

import { AttributeElements } from "../AttributeElements";

/*
 * TODO: find a common place for this; possibly test support lib?
 */
const waitForAsync = () => new Promise((resolve: (...args: any[]) => void) => setTimeout(resolve, 0));

describe("AttributeElements", () => {
    const backend = recordedBackend(ReferenceRecordings.Recordings);
    const workspace = "testWorkspace";
    const identifier = attributeIdentifier(ReferenceLdm.Product.Name);
    const anotherIdentifier = attributeIdentifier(ReferenceLdm.Department);

    const renderComponent = (props: any = {}) =>
        mount(
            <AttributeElements
                {...props}
                backend={backend}
                workspace={workspace}
                displayForm={idRef(identifier)}
            />,
        );

    it("should load attribute elements by display form identifier", async () => {
        const children = jest.fn().mockReturnValue(<div />);
        renderComponent({ children });

        expect(children).toHaveBeenCalledTimes(1);
        expect(children.mock.calls[0][0].isLoading).toEqual(true);

        await waitForAsync();

        expect(children).toHaveBeenCalledTimes(2);
        expect(children.mock.calls[1][0].isLoading).toEqual(false);
        expect(children.mock.calls[1][0].validElements.items.length).toEqual(7);
        expect(children.mock.calls[1][0].validElements.items[0].title).toEqual("CompuSci");
    });

    it("should load more attribute elements using the loadMore function", async () => {
        const children = jest.fn().mockReturnValue(<div />);
        renderComponent({ children, limit: 1 });

        await waitForAsync();

        expect(children.mock.calls[1][0].isLoading).toEqual(false);
        expect(children.mock.calls[1][0].validElements.items.length).toEqual(1);
        expect(children.mock.calls[1][0].validElements.items[0].title).toEqual("CompuSci");

        await children.mock.calls[1][0].loadMore();

        expect(children.mock.calls[2][0].isLoading).toEqual(true);

        expect(children.mock.calls[3][0].isLoading).toEqual(false);
        expect(children.mock.calls[3][0].validElements.items.length).toEqual(2);
        expect(children.mock.calls[3][0].validElements.items[1].title).toEqual("Educationly");
    });

    it("should load different attribute when identifier prop changes", async () => {
        const children = jest.fn().mockReturnValue(<div />);
        const wrapper = renderComponent({ children });

        expect(children).toHaveBeenCalledTimes(1);
        expect(children.mock.calls[0][0].isLoading).toEqual(true);

        await waitForAsync();

        expect(children).toHaveBeenCalledTimes(2);
        expect(children.mock.calls[1][0].isLoading).toEqual(false);
        expect(children.mock.calls[1][0].validElements.items[0].title).toEqual("CompuSci");

        wrapper.setProps({ displayForm: idRef(anotherIdentifier) });

        await waitForAsync();

        const lastCallArguments = children.mock.calls[children.mock.calls.length - 1][0];
        expect(lastCallArguments.isLoading).toEqual(false);
        expect(lastCallArguments.validElements.items[0].title).toEqual("Direct Sales");
    });
});
