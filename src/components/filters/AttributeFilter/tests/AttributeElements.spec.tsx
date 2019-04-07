// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";
import { testUtils } from "@gooddata/js-utils";
import { AttributeElements, IAttributeElementsProps, IAttributeElementsChildren } from "../AttributeElements";
import {
    createMetadataMock,
    ATTRIBUTE_DISPLAY_FORM_URI,
    ATTRIBUTE_DISPLAY_FORM_URI_2,
    ATTRIBUTE_DISPLAY_FORM_IDENTIFIER,
    COUNTRIES,
} from "./utils";

describe("AttributeElements", () => {
    function createProps(customProps = {}) {
        const sdk = {
            md: createMetadataMock(),
            clone: () => sdk,
            config: {
                setJsPackage: () => false,
                setRequestHeader: () => false,
            },
        };

        return {
            projectId: "1",
            sdk,
            options: { limit: 1 },
            uri: ATTRIBUTE_DISPLAY_FORM_URI,
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

    it("should load attribute values by uri", () => {
        const props = createProps();
        renderComponent(props as any); // because mocked metadata don't match

        expect(props.children).toHaveBeenCalledTimes(1);
        expect(props.children.mock.calls[0][0].isLoading).toBe(true);

        return testUtils.delay().then(() => {
            expect(props.children).toHaveBeenCalledTimes(2);
            expect(props.sdk.md.getIdentifiersFromUris).toHaveBeenCalledTimes(0);
            expect(props.children.mock.calls[1][0].validElements).toEqual({
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
            expect(props.children.mock.calls[1][0].isLoading).toBe(false);
            expect(props.children.mock.calls[1][0].error).toBe(null);
        });
    });

    it("should load attribute defined by identifier", () => {
        const props = createProps({
            uri: undefined,
            identifier: ATTRIBUTE_DISPLAY_FORM_IDENTIFIER,
        });
        renderComponent(props as any); // because mocked metadata don't match

        expect(props.children).toHaveBeenCalledTimes(1);
        expect(props.children.mock.calls[0][0].isLoading).toBe(true);

        return testUtils.delay().then(() => {
            expect(props.sdk.md.getUrisFromIdentifiers).toHaveBeenCalledTimes(1);
            expect(props.sdk.md.getValidElements).toHaveBeenCalledTimes(1);
            expect(props.children).toHaveBeenCalledTimes(2);
            expect(props.children.mock.calls[1][0].validElements).toEqual({
                items: [{ element: { title: "Afghanistan", uri: "/gdc/md/projectId/object/foo?id=0" } }],
                paging: { count: 1, offset: 0, total: 198 },
            });
            expect(props.children.mock.calls[1][0].isLoading).toBe(false);
            expect(props.children.mock.calls[1][0].error).toBe(null);
        });
    });

    it("should load all entries if no options.limit is defined", () => {
        const props = createProps({
            uri: undefined,
            identifier: ATTRIBUTE_DISPLAY_FORM_IDENTIFIER,
            options: undefined,
        });
        renderComponent(props as any); // because mocked metadata don't match

        return testUtils.delay().then(() => {
            expect(props.sdk.md.getUrisFromIdentifiers).toHaveBeenCalledTimes(1);
            expect(props.sdk.md.getValidElements).toHaveBeenCalledTimes(1);
            expect(props.children).toHaveBeenCalledTimes(2);
            expect(props.children.mock.calls[1][0].validElements.items.length).toEqual(COUNTRIES.length);
        });
    });

    it("should load more results with loadMore function", () => {
        const props = createProps({
            uri: undefined,
            identifier: ATTRIBUTE_DISPLAY_FORM_IDENTIFIER,
        });
        renderComponent(props as any); // because mocked metadata don't match

        return testUtils.delay().then(() => {
            expect(props.children.mock.calls[1][0].validElements).toEqual({
                items: [{ element: { title: "Afghanistan", uri: "/gdc/md/projectId/object/foo?id=0" } }],
                paging: { count: 1, offset: 0, total: 198 },
            });
            props.children.mock.calls[1][0].loadMore();

            expect(props.children).toHaveBeenCalledTimes(3);
            expect(props.children.mock.calls[2][0].isLoading).toBe(true);

            return testUtils.delay().then(() => {
                expect(props.children).toHaveBeenCalledTimes(4);
                expect(props.sdk.md.getValidElements).toHaveBeenCalledTimes(2);
                expect(props.children).toHaveBeenCalledTimes(4);
                expect(props.children.mock.calls[3][0].isLoading).toBe(false);
                expect(props.children.mock.calls[3][0].validElements).toEqual({
                    items: [
                        { element: { title: "Afghanistan", uri: "/gdc/md/projectId/object/foo?id=0" } },
                        { element: { title: "Albania", uri: "/gdc/md/projectId/object/foo?id=1" } },
                    ],
                    paging: { count: 2, offset: 0, total: 198 },
                });
            });
        });
    });

    it("should load another attribute on prop change", () => {
        const props = createProps({
            uri: ATTRIBUTE_DISPLAY_FORM_URI_2,
        });
        const wrapper = renderComponent(props as any); // because mocked metadata don't match

        return testUtils.delay().then(() => {
            expect(props.children).toHaveBeenCalledTimes(2);
            expect(props.sdk.md.getIdentifiersFromUris).toHaveBeenCalledTimes(0);
            expect(props.sdk.md.getValidElements).toHaveBeenCalledTimes(1);
            expect(props.children.mock.calls[1][0].validElements).toEqual({
                items: [
                    { element: { title: "Abundant Ammunition", uri: "/gdc/md/projectId/object/baz?id=0" } },
                ],
                paging: { count: 1, offset: 0, total: 167 },
            });
            expect(props.children.mock.calls[1][0].isLoading).toBe(false);
            wrapper.setProps({
                identifier: ATTRIBUTE_DISPLAY_FORM_IDENTIFIER,
                uri: null,
            });
            expect(props.children).toHaveBeenCalledTimes(3);
            expect(props.children.mock.calls[2][0].isLoading).toBe(true);

            return testUtils.delay().then(() => {
                expect(props.children).toHaveBeenCalledTimes(4);
                expect(props.sdk.md.getUrisFromIdentifiers).toHaveBeenCalledTimes(1);
                expect(props.sdk.md.getValidElements).toHaveBeenCalledTimes(2);
                expect(props.children).toHaveBeenCalledTimes(4);
                expect(props.children.mock.calls[3][0].isLoading).toBe(false);
                expect(props.children.mock.calls[3][0].validElements).toEqual({
                    items: [{ element: { title: "Afghanistan", uri: "/gdc/md/projectId/object/foo?id=0" } }],
                    paging: { count: 1, offset: 0, total: 198 },
                });
            });
        });
    });
});
