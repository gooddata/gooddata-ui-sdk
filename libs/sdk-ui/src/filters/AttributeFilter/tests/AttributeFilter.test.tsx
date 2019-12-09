// (C) 2019 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";
import noop = require("lodash/noop");
import { legacyRecordedBackend } from "@gooddata/sdk-backend-mockingbird";
import { MasterIndex } from "../../../../__mocks__/recordings/playlist";
import { waitForAsync } from "../../../../testUtils/synchronization";

import { AttributeFilter } from "../AttributeFilter";
import { AttributeDropdown } from "../AttributeDropdown/AttributeDropdown";
import { newPositiveAttributeFilter, newNegativeAttributeFilter } from "@gooddata/sdk-model";

describe("AttributeFilter", () => {
    const backend = legacyRecordedBackend(MasterIndex);
    const workspace = "testWorkspace";

    it("should be in loading state until attribute display form title is loaded", async () => {
        const rendered = mount(
            <AttributeFilter
                filter={newPositiveAttributeFilter("label.method.method", [])}
                backend={backend}
                onApply={noop}
                workspace={workspace}
            />,
        );

        expect(rendered.exists(".s-button-loading")).toEqual(true);
    });

    it("should download attribute display form title", async () => {
        const rendered = mount(
            <AttributeFilter
                filter={newPositiveAttributeFilter("label.method.method", [])}
                backend={backend}
                onApply={noop}
                workspace={workspace}
            />,
        );

        await waitForAsync();
        rendered.update();

        expect(rendered.find(AttributeDropdown).prop("title")).toEqual("Method");
    });

    it("should display error if attribute display form title load fails", async () => {
        const rendered = mount(
            <AttributeFilter
                filter={newPositiveAttributeFilter("non existing display form", [])}
                backend={backend}
                onApply={noop}
                workspace={workspace}
            />,
        );

        await waitForAsync();
        rendered.update();

        expect(rendered.exists(".s-button-error")).toEqual(true);
    });

    it("should detect deprecated attribute definition", () => {
        const warnMock = jest.fn();
        // tslint:disable-next-line:no-console
        console.warn = warnMock;
        mount(
            <AttributeFilter
                identifier="label.method.method"
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
                    filter={newPositiveAttributeFilter("label.method.method", [])}
                    identifier="label.method.method"
                    backend={backend}
                    onApply={noop}
                    workspace={workspace}
                />,
            );
        }).toThrow();
    });

    it("should extract selection from filter definition with text values", async () => {
        const rendered = mount(
            <AttributeFilter
                filter={newPositiveAttributeFilter("label.method.method", ["DELETE"])}
                backend={backend}
                onApply={noop}
                workspace={workspace}
            />,
        );

        await waitForAsync();
        rendered.update();

        expect(rendered.find(AttributeDropdown).prop("selectedItems")).toEqual([{ title: "DELETE" }]);
    });

    it("should extract selection from filter definition with uri values", async () => {
        const rendered = mount(
            <AttributeFilter
                filter={newPositiveAttributeFilter("label.method.method", {
                    uris: ["/gdc/md/gtl83h4doozbp26q0kf5qg8uiyu4glyn/obj/375/elements?id=110"],
                })}
                backend={backend}
                onApply={noop}
                workspace={workspace}
            />,
        );

        await waitForAsync();
        rendered.update();

        expect(rendered.find(AttributeDropdown).prop("selectedItems")).toEqual([
            { uri: "/gdc/md/gtl83h4doozbp26q0kf5qg8uiyu4glyn/obj/375/elements?id=110" },
        ]);
    });

    it("should run onApply with current selection as attribute value filter", async () => {
        const onApply = jest.fn();
        const rendered = mount(
            <AttributeFilter
                filter={newPositiveAttributeFilter("label.method.method", ["DELETE"])}
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
                    title: "DELETE",
                    uri: "/gdc/md/gtl83h4doozbp26q0kf5qg8uiyu4glyn/obj/375/elements?id=110",
                },
            ],
            false,
        );

        const expectedFilter = newPositiveAttributeFilter("label.method.method", ["DELETE"]);

        expect(onApply).toHaveBeenCalledWith(expectedFilter);
    });

    it("should run onApply with current selection as attribute value filter when isInverted is true", async () => {
        const onApply = jest.fn();
        const rendered = mount(
            <AttributeFilter
                filter={newPositiveAttributeFilter("label.method.method", ["DELETE"])}
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
                    title: "DELETE",
                    uri: "/gdc/md/gtl83h4doozbp26q0kf5qg8uiyu4glyn/obj/375/elements?id=110",
                },
            ],
            true,
        );

        const expectedFilter = newNegativeAttributeFilter("label.method.method", ["DELETE"]);

        expect(onApply).toHaveBeenCalledWith(expectedFilter);
    });

    it("should run onApply with current selection as attribute uri filter if specified using uris in the first place", async () => {
        const onApply = jest.fn();
        const rendered = mount(
            <AttributeFilter
                filter={newPositiveAttributeFilter("label.method.method", {
                    uris: ["/gdc/md/gtl83h4doozbp26q0kf5qg8uiyu4glyn/obj/375/elements?id=110"],
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
                    title: "DELETE",
                    uri: "/gdc/md/gtl83h4doozbp26q0kf5qg8uiyu4glyn/obj/375/elements?id=110",
                },
            ],
            false,
        );

        const expectedFilter = newPositiveAttributeFilter("label.method.method", {
            uris: ["/gdc/md/gtl83h4doozbp26q0kf5qg8uiyu4glyn/obj/375/elements?id=110"],
        });

        expect(onApply).toHaveBeenCalledWith(expectedFilter);
    });
});
