// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";
import { testUtils } from "@gooddata/js-utils";
import { AttributeElements, IAttributeElementsProps } from "../AttributeElements";
import { IAttributeElementsChildren } from "../model";
import { ATTRIBUTE_DISPLAY_FORM_IDENTIFIER, COUNTRIES } from "./utils";
import { recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import { MasterIndex } from "../../../../__mocks__/recordings/playlist";

describe("AttributeElements", () => {
    function createProps(customProps: Partial<IAttributeElementsProps> = {}): IAttributeElementsProps {
        const backend = recordedBackend(MasterIndex);
        return {
            backend,
            identifier: "AAA.TODO",
            workspace: "BBB.TODO",
            children: jest.fn().mockReturnValue(<div />),
            ...customProps,
        };
    }

    function renderComponent(props: IAttributeElementsProps) {
        const children = (params: IAttributeElementsChildren) => {
            return props.children(params);
        };
        return mount(<AttributeElements {...props} children={children} />);
    }

    it("should load attribute values by identifier", () => {
        const children = jest.fn().mockReturnValue(<div />);
        const props = createProps({ children });
        renderComponent(props);

        expect(children).toHaveBeenCalledTimes(1);
        expect(children.mock.calls[0][0].isLoading).toBe(true);

        return testUtils.delay().then(() => {
            expect(children).toHaveBeenCalledTimes(2);
            expect(children.mock.calls[1][0].validElements).toEqual({
                items: [
                    {
                        element: {
                            title: "Afghanistan",
                            uri: "/gdc/md/projectId/object/foo?id=0",
                        },
                    },
                ],
                paging: { count: 1, offset: 0, total: 198 },
            });
            expect(children.mock.calls[1][0].isLoading).toBe(false);
            expect(children.mock.calls[1][0].error).toBe(null);
        });
    });

    it("should load all entries if no options.limit is defined", () => {
        const children = jest.fn().mockReturnValue(<div />);
        const props = createProps({
            identifier: ATTRIBUTE_DISPLAY_FORM_IDENTIFIER,
            options: undefined,
            children,
        });
        renderComponent(props);

        return testUtils.delay().then(() => {
            expect(children).toHaveBeenCalledTimes(2);
            expect(children.mock.calls[1][0].validElements.items.length).toEqual(COUNTRIES.length);
        });
    });

    it("should load more results with loadMore function", () => {
        const children = jest.fn().mockReturnValue(<div />);
        const props = createProps({
            children,
            identifier: ATTRIBUTE_DISPLAY_FORM_IDENTIFIER,
        });
        renderComponent(props);

        return testUtils.delay().then(() => {
            expect(children.mock.calls[1][0].validElements).toEqual({
                items: [{ element: { title: "Afghanistan", uri: "/gdc/md/projectId/object/foo?id=0" } }],
                paging: { count: 1, offset: 0, total: 198 },
            });
            children.mock.calls[1][0].loadMore();

            expect(props.children).toHaveBeenCalledTimes(3);
            expect(children.mock.calls[2][0].isLoading).toBe(true);

            return testUtils.delay().then(() => {
                expect(children).toHaveBeenCalledTimes(4);
                expect(children.mock.calls[3][0].isLoading).toBe(false);
                expect(children.mock.calls[3][0].validElements).toEqual({
                    items: [
                        { element: { title: "Afghanistan", uri: "/gdc/md/projectId/object/foo?id=0" } },
                        { element: { title: "Albania", uri: "/gdc/md/projectId/object/foo?id=1" } },
                    ],
                    paging: { count: 2, offset: 0, total: 198 },
                });
            });
        });
    });

    // it("should load another attribute on prop change", () => {
    //     const props = createProps({
    //         uri: ATTRIBUTE_DISPLAY_FORM_URI_2,
    //     });
    //     const wrapper = renderComponent(props as any); // because mocked metadata don't match

    //     return testUtils.delay().then(() => {
    //         expect(props.children).toHaveBeenCalledTimes(2);
    //         expect(props.sdk.md.getIdentifiersFromUris).toHaveBeenCalledTimes(0);
    //         expect(props.sdk.md.getValidElements).toHaveBeenCalledTimes(1);
    //         expect(props.children.mock.calls[1][0].validElements).toEqual({
    //             items: [
    //                 { element: { title: "Abundant Ammunition", uri: "/gdc/md/projectId/object/baz?id=0" } },
    //             ],
    //             paging: { count: 1, offset: 0, total: 167 },
    //         });
    //         expect(props.children.mock.calls[1][0].isLoading).toBe(false);
    //         wrapper.setProps({
    //             identifier: ATTRIBUTE_DISPLAY_FORM_IDENTIFIER,
    //             uri: null,
    //         });
    //         expect(props.children).toHaveBeenCalledTimes(3);
    //         expect(props.children.mock.calls[2][0].isLoading).toBe(true);

    //         return testUtils.delay().then(() => {
    //             expect(props.children).toHaveBeenCalledTimes(4);
    //             expect(props.sdk.md.getUrisFromIdentifiers).toHaveBeenCalledTimes(1);
    //             expect(props.sdk.md.getValidElements).toHaveBeenCalledTimes(2);
    //             expect(props.children).toHaveBeenCalledTimes(4);
    //             expect(props.children.mock.calls[3][0].isLoading).toBe(false);
    //             expect(props.children.mock.calls[3][0].validElements).toEqual({
    //                 items: [{ element: { title: "Afghanistan", uri: "/gdc/md/projectId/object/foo?id=0" } }],
    //                 paging: { count: 1, offset: 0, total: 198 },
    //             });
    //         });
    //     });
    // });
});
