// (C) 2019 GoodData Corporation
import * as React from "react";
import { shallow } from "enzyme";
import { recordedBackend } from "@gooddata/sdk-backend-mockingbird";

import { AttributeElements } from "../AttributeElements";
import { MasterIndex } from "../../../../__mocks__/recordings/playlist";

describe("AttributeElements", () => {
    const backend = recordedBackend(MasterIndex);
    const workspace = "testWorkspace";
    const identifier = "label.method.method";
    const anotherIdentifier = "label.status.status";

    // waits for any async methods resolution
    // tslint:disable-next-line: no-string-based-set-immediate
    const waitForAsync = () => new Promise(resolve => setImmediate(resolve));

    const renderComponent = (props: any = {}) =>
        shallow(
            <AttributeElements {...props} backend={backend} workspace={workspace} identifier={identifier} />,
        );

    it("should load attribute elements by display form identifier", async () => {
        const children = jest.fn().mockReturnValue(<div />);
        renderComponent({ children });

        expect(children).toHaveBeenCalledTimes(1);
        expect(children.mock.calls[0][0].isLoading).toEqual(true);

        await waitForAsync();

        expect(children).toHaveBeenCalledTimes(2);
        expect(children.mock.calls[1][0].isLoading).toEqual(false);
        expect(children.mock.calls[1][0].validElements.elements.length).toEqual(8);
        expect(children.mock.calls[1][0].validElements.elements[0].title).toEqual("DELETE");
    });

    it("should load more attribute elements using the loadMore function", async () => {
        const children = jest.fn().mockReturnValue(<div />);
        renderComponent({ children, limit: 1 });

        await waitForAsync();

        expect(children.mock.calls[1][0].isLoading).toEqual(false);
        expect(children.mock.calls[1][0].validElements.elements.length).toEqual(1);
        expect(children.mock.calls[1][0].validElements.elements[0].title).toEqual("DELETE");

        await children.mock.calls[1][0].loadMore();

        expect(children.mock.calls[2][0].isLoading).toEqual(true);

        expect(children.mock.calls[3][0].isLoading).toEqual(false);
        expect(children.mock.calls[3][0].validElements.elements.length).toEqual(2);
        expect(children.mock.calls[3][0].validElements.elements[1].title).toEqual("GET");
    });

    it("should load different attribute when identifier prop changes", async () => {
        const children = jest.fn().mockReturnValue(<div />);
        const wrapper = renderComponent({ children });

        expect(children).toHaveBeenCalledTimes(1);
        expect(children.mock.calls[0][0].isLoading).toEqual(true);

        await waitForAsync();

        expect(children).toHaveBeenCalledTimes(2);
        expect(children.mock.calls[1][0].isLoading).toEqual(false);
        expect(children.mock.calls[1][0].validElements.elements[0].title).toEqual("DELETE");

        wrapper.setProps({ identifier: anotherIdentifier });

        await waitForAsync();

        const lastCallArguments = children.mock.calls[children.mock.calls.length - 1][0];
        expect(lastCallArguments.isLoading).toEqual(false);
        expect(lastCallArguments.validElements.elements[0].title).toEqual("100");
    });
});
