// (C) 2021-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { idRef } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

import { type ICacheItemDisplayForm } from "../../typings/state_objects.js";
import { withIntl } from "../../utils/with_intl.js";
import { withRedux } from "../../utils/with_redux.js";

import {
    AttributeBucketItemConfiguration,
    type IAttributeBucketItemConfigurationOwnProps,
} from "./AttributeBucketItemConfiguration.js";

const primaryDisplayForm: ICacheItemDisplayForm = {
    id: "dfId",
    title: "Primary",
    uri: "/md/primary.df",
    ref: idRef("dfId1"),
    type: undefined,
};

const renderComponent = (props: Partial<IAttributeBucketItemConfigurationOwnProps> = {}) => {
    const Wrapped = withRedux(withIntl(AttributeBucketItemConfiguration));
    return render(
        <Wrapped
            attribute={{
                title: "My Attribute",
                type: "attribute",
                identifier: "attrId",
                dfRef: idRef("df1"),
            }}
            displayForms={[primaryDisplayForm]}
            selectedDisplayForm={idRef("dfId1")}
            onSelectDisplayForm={vi.fn()}
            showAllValuesVisible={false}
            showAllValues={false}
            onChangeShowAllValues={vi.fn()}
            localIdentifier="localId"
            isStaticHyperLinkDisplayFormTextEnabled={false}
            {...props}
        />,
    );
};

describe("AttributeBucketItemConfiguration", () => {
    it("should render attribute title", () => {
        const { container } = renderComponent();
        expect(container.querySelector(".s-catalog-item-title").textContent).toEqual("My Attribute");
    });

    it("should not render display form dropdown when there is just one display form", () => {
        const { container } = renderComponent();
        expect(container.querySelectorAll(".s-attribute-display-form-button")).toHaveLength(0);
    });

    it("should render display form dropdown when there is more than one display form", () => {
        const { container } = renderComponent({
            displayForms: [
                primaryDisplayForm,
                {
                    id: "dfId2",
                    title: "Secondary",
                    uri: "/md/secondary.df",
                    ref: idRef("dfId2"),
                    type: undefined,
                },
            ],
        });
        expect(container.querySelector(".s-attribute-display-form-button").textContent).toBe(
            "Display as: Primary",
        );
    });

    it.each([BucketNames.LOCATION, BucketNames.AREA])(
        "should not render display form dropdown in %s bucket",
        (bucketLocalIdentifier) => {
            const { container } = renderComponent({
                bucketLocalIdentifier,
                displayForms: [
                    primaryDisplayForm,
                    {
                        id: "dfId2",
                        title: "Secondary",
                        uri: "/md/secondary.df",
                        ref: idRef("dfId2"),
                        type: undefined,
                    },
                ],
            });

            expect(container.querySelectorAll(".s-attribute-display-form-button")).toHaveLength(0);
        },
    );

    it("should not render Show all values checkbox by default", () => {
        const { container } = renderComponent();

        const showAllValuesCheckbox = container.querySelector(".s-show-all-values");

        expect(showAllValuesCheckbox).toBeFalsy();
    });

    it("should render Show all values checkbox when showAllValuesVisible is true", () => {
        const { container } = renderComponent({
            showAllValuesVisible: true,
        });

        const showAllValuesCheckbox = container.querySelector(".s-show-all-values");

        expect(showAllValuesCheckbox).toBeTruthy();
    });
});
