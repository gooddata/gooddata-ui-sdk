// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";
import { testUtils } from "@gooddata/js-utils";
import { AttributeLoader, IAttributeLoaderProps } from "../AttributeLoader";
import {
    createMetadataMock,
    ATTRIBUTE_DISPLAY_FORM_URI,
    ATTRIBUTE_DISPLAY_FORM_IDENTIFIER,
    ATTRIBUTE_DISPLAY_FORM_IDENTIFIER_2,
} from "./utils";
import noop = require("lodash/noop");

describe("AttributeLoader", () => {
    function renderComponent(props: IAttributeLoaderProps) {
        return mount(
            <AttributeLoader {...props}>
                {props =>
                    !props.isLoading && (
                        <div className={`s-is-using-${props.isUsingIdentifier ? "identifier" : "uri"}`}>
                            {props.attributeDisplayForm.meta.title}
                        </div>
                    )
                }
            </AttributeLoader>,
        );
    }

    it("should load attribute defined by uri", () => {
        const metadata = createMetadataMock();
        const wrapper = renderComponent({
            projectId: "1",
            metadata,
            uri: ATTRIBUTE_DISPLAY_FORM_URI,
            children: noop,
        });

        expect(wrapper.isEmptyRender()).toEqual(true);
        return testUtils.delay().then(() => {
            wrapper.update();
            expect(wrapper.isEmptyRender()).toEqual(false);
            expect(metadata.getObjectUri).toHaveBeenCalledTimes(0);
            expect(metadata.getObjectDetails).toHaveBeenCalledTimes(1);
            expect(wrapper.find(".s-is-using-uri")).toHaveLength(1);
            expect(wrapper.text()).toEqual("Attribute");
        });
    });

    it("should load attribute defined by identifier", () => {
        const metadata = createMetadataMock();
        const wrapper = renderComponent({
            projectId: "1",
            metadata,
            identifier: ATTRIBUTE_DISPLAY_FORM_IDENTIFIER,
            children: noop,
        });

        expect(wrapper.isEmptyRender()).toEqual(true);
        return testUtils.delay().then(() => {
            wrapper.update();
            expect(wrapper.isEmptyRender()).toEqual(false);
            expect(metadata.getObjectUri).toHaveBeenCalledTimes(1);
            expect(metadata.getObjectDetails).toHaveBeenCalledTimes(1);
            expect(wrapper.find(".s-is-using-identifier")).toHaveLength(1);
            expect(wrapper.text()).toEqual("Attribute");
        });
    });

    it("should load another attribute on prop change", () => {
        const metadata = createMetadataMock();
        const wrapper = renderComponent({
            projectId: "1",
            metadata,
            identifier: ATTRIBUTE_DISPLAY_FORM_IDENTIFIER,
            children: noop,
        });

        expect(wrapper.isEmptyRender()).toEqual(true);
        return testUtils.delay().then(() => {
            wrapper.update();
            expect(wrapper.isEmptyRender()).toEqual(false);
            expect(metadata.getObjectUri).toHaveBeenCalledTimes(1);
            expect(metadata.getObjectDetails).toHaveBeenCalledTimes(1);
            expect(wrapper.text()).toEqual("Attribute");

            wrapper.setProps({
                projectId: "1",
                metadata,
                identifier: ATTRIBUTE_DISPLAY_FORM_IDENTIFIER_2,
            });

            return testUtils.delay().then(() => {
                wrapper.update();
                expect(metadata.getObjectUri).toHaveBeenCalledTimes(2);
                expect(metadata.getObjectDetails).toHaveBeenCalledTimes(2);
                expect(wrapper.text()).toEqual("Attribute 2");
            });
        });
    });
});
