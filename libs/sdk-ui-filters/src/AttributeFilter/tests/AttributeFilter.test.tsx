// (C) 2019 GoodData Corporation
import { ReferenceMd, ReferenceRecordings } from "@gooddata/reference-workspace";
import React from "react";
import { mount } from "enzyme";
import noop from "lodash/noop";
import { recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import { AttributeFilter } from "../AttributeFilter";
import { AttributeDropdown } from "../AttributeDropdown/AttributeDropdown";
import {
    newPositiveAttributeFilter,
    newNegativeAttributeFilter,
    attributeIdentifier,
} from "@gooddata/sdk-model";

/*
 * TODO: find a common place for this; possibly test support lib?
 */
const waitForAsync = () => new Promise((resolve: (...args: any[]) => void) => setTimeout(resolve, 0));

describe("AttributeFilter", () => {
    const backend = recordedBackend(ReferenceRecordings.Recordings);
    const workspace = "testWorkspace";

    it("should download attribute title", async () => {
        const rendered = mount(
            <AttributeFilter
                filter={newPositiveAttributeFilter(ReferenceMd.Product.Name, [])}
                backend={backend}
                onApply={noop}
                workspace={workspace}
            />,
        );

        await waitForAsync();
        rendered.update();

        expect(rendered.find(AttributeDropdown).prop("title")).toEqual("Product");
    });

    it("should display error if attribute title load fails", async () => {
        const rendered = mount(
            <AttributeFilter
                filter={newPositiveAttributeFilter("non existing display form", [])}
                backend={backend}
                onApply={noop}
                workspace={workspace}
                onError={noop}
            />,
        );

        await waitForAsync();
        rendered.update();

        expect(rendered.exists(".s-button-error")).toEqual(true);
    });

    it("should detect deprecated attribute definition", () => {
        const warnMock = jest.fn();
        // eslint-disable-next-line no-console
        console.warn = warnMock;
        mount(
            <AttributeFilter
                identifier={attributeIdentifier(ReferenceMd.Product.Name)}
                backend={backend}
                onApply={noop}
                workspace={workspace}
            />,
        );
        expect(warnMock).toHaveBeenCalledWith(
            "Definition of an attribute using 'identifier' is deprecated, use 'filter' property instead. Please see the documentation of [AttributeFilter component](https://sdk.gooddata.com/gooddata-ui/docs/attribute_filter_component.html) for further details.",
        );
        warnMock.mockRestore();
    });

    it("should detect multiple attribute definition", () => {
        expect(() => {
            mount(
                <AttributeFilter
                    filter={newPositiveAttributeFilter(ReferenceMd.Product.Name, [])}
                    identifier={attributeIdentifier(ReferenceMd.Product.Name)}
                    backend={backend}
                    onApply={noop}
                    workspace={workspace}
                    onError={noop}
                />,
            );
        }).toThrow();
    });

    it("should extract selection from filter definition with text values", async () => {
        const rendered = mount(
            <AttributeFilter
                filter={newPositiveAttributeFilter(ReferenceMd.Product.Name, ["CompuSci"])}
                backend={backend}
                onApply={noop}
                workspace={workspace}
            />,
        );

        await waitForAsync();
        rendered.update();

        expect(rendered.find(AttributeDropdown).prop("selectedItems")).toEqual([{ title: "CompuSci" }]);
    });

    it("should extract selection from filter definition with uri values", async () => {
        const rendered = mount(
            <AttributeFilter
                filter={newPositiveAttributeFilter(ReferenceMd.Product.Name, {
                    uris: ["/gdc/md/toxhzx243k4c1u04nby9pnewvsnxt3lp/obj/1054/elements?id=165678"],
                })}
                backend={backend}
                onApply={noop}
                workspace={workspace}
            />,
        );

        await waitForAsync();
        rendered.update();

        expect(rendered.find(AttributeDropdown).prop("selectedItems")).toEqual([
            { uri: "/gdc/md/toxhzx243k4c1u04nby9pnewvsnxt3lp/obj/1054/elements?id=165678" },
        ]);
    });

    it("should run onApply with current selection as attribute value filter", async () => {
        const onApply = jest.fn();
        const rendered = mount(
            <AttributeFilter
                filter={newPositiveAttributeFilter(ReferenceMd.Product.Name, ["CompuSci"])}
                backend={backend}
                onApply={onApply}
                workspace={workspace}
            />,
        );

        await waitForAsync();
        rendered.update();

        rendered.find(AttributeDropdown).prop("onApply")(
            [
                {
                    title: "CompuSci",
                    uri: "/gdc/md/toxhzx243k4c1u04nby9pnewvsnxt3lp/obj/1054/elements?id=165678",
                },
            ],
            false,
        );

        const expectedFilter = newPositiveAttributeFilter(ReferenceMd.Product.Name, ["CompuSci"]);

        expect(onApply).toHaveBeenCalledWith(expectedFilter);
    });

    it("should run onApply with current selection as attribute value filter when isInverted is true", async () => {
        const onApply = jest.fn();
        const rendered = mount(
            <AttributeFilter
                filter={newPositiveAttributeFilter(ReferenceMd.Product.Name, ["CompuSci"])}
                backend={backend}
                onApply={onApply}
                workspace={workspace}
            />,
        );

        await waitForAsync();
        rendered.update();

        rendered.find(AttributeDropdown).prop("onApply")(
            [
                {
                    title: "CompuSci",
                    uri: "/gdc/md/toxhzx243k4c1u04nby9pnewvsnxt3lp/obj/1054/elements?id=165678",
                },
            ],
            true,
        );

        const expectedFilter = newNegativeAttributeFilter(ReferenceMd.Product.Name, ["CompuSci"]);

        expect(onApply).toHaveBeenCalledWith(expectedFilter);
    });

    it("should run onApply with current selection as attribute uri filter if specified using uris in the first place", async () => {
        const onApply = jest.fn();
        const rendered = mount(
            <AttributeFilter
                filter={newPositiveAttributeFilter(ReferenceMd.Product.Name, {
                    uris: ["/gdc/md/toxhzx243k4c1u04nby9pnewvsnxt3lp/obj/1054/elements?id=165678"],
                })}
                backend={backend}
                onApply={onApply}
                workspace={workspace}
            />,
        );

        await waitForAsync();
        rendered.update();

        rendered.find(AttributeDropdown).prop("onApply")(
            [
                {
                    title: "CompuSci",
                    uri: "/gdc/md/toxhzx243k4c1u04nby9pnewvsnxt3lp/obj/1054/elements?id=165678",
                },
            ],
            false,
        );

        const expectedFilter = newPositiveAttributeFilter(ReferenceMd.Product.Name, {
            uris: ["/gdc/md/toxhzx243k4c1u04nby9pnewvsnxt3lp/obj/1054/elements?id=165678"],
        });

        expect(onApply).toHaveBeenCalledWith(expectedFilter);
    });
});
