// (C) 2022 GoodData Corporation
import React from "react";

import { FilterStories } from "../../../../_infra/storyGroups";
import { storiesOf } from "../../../../_infra/storyRepository";
import { wrapWithTheme } from "../../../themeWrapper";

import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/dist/internal/utils/internalIntlProvider";
import { AttributeFilterButton } from "@gooddata/sdk-ui-filters/dist/AttributeFilter@next/Components/AttributeFilterButton";
import { action } from "@storybook/addon-actions";

const attributeTitle = "Product";

const AttributeFilterButtonExamples = (): JSX.Element => {
    return (
        <InternalIntlWrapper>
            <div style={{ width: 500 }}>
                <div className="library-component screenshot-target">
                    <h4>AttributeFilterButton closed</h4>
                    <AttributeFilterButton
                        isMobile={false}
                        isOpen={false}
                        title={attributeTitle}
                        subtitleText={"All"}
                        subtitleItemCount={10}
                        isFiltering={false}
                        isLoaded={true}
                        onClick={action("onClick")}
                    />
                    <h4>AttributeFilterButton opened</h4>
                    <AttributeFilterButton
                        isMobile={false}
                        isOpen={true}
                        title={attributeTitle}
                        subtitleText={"All"}
                        subtitleItemCount={10}
                        isFiltering={false}
                        isLoaded={true}
                        onClick={action("onClick")}
                    />
                    <h4>AttributeFilterButton filtering</h4>
                    <AttributeFilterButton
                        isMobile={false}
                        isOpen={false}
                        title={attributeTitle}
                        subtitleText={"All"}
                        subtitleItemCount={10}
                        isFiltering={true}
                        isLoaded={true}
                        onClick={action("onClick")}
                    />
                    <h4>AttributeFilterButton long subtitle and item count 3</h4>
                    <AttributeFilterButton
                        isMobile={false}
                        isOpen={false}
                        title={attributeTitle}
                        subtitleText={"All except Educationally, PhoenixSoft, WonderKid"}
                        subtitleItemCount={3}
                        isFiltering={false}
                        isLoaded={true}
                        onClick={action("onClick")}
                    />
                    <h4>AttributeFilterButton shortened title</h4>
                    <div style={{ width: 100 }}>
                        <AttributeFilterButton
                            isMobile={false}
                            isOpen={false}
                            title={"Long Attribute name"}
                            subtitleText={"All except Educationally, PhoenixSoft, WonderKid"}
                            subtitleItemCount={3}
                            isFiltering={false}
                            isLoaded={true}
                            onClick={action("onClick")}
                        />
                    </div>
                    <h4>AttributeFilterButton not fit in container</h4>
                    <div style={{ width: 60 }}>
                        <AttributeFilterButton
                            isMobile={false}
                            isOpen={false}
                            title={attributeTitle}
                            subtitleText={"All except Educationally, PhoenixSoft, WonderKid"}
                            subtitleItemCount={3}
                            isFiltering={false}
                            isLoaded={true}
                            onClick={action("onClick")}
                        />
                    </div>
                </div>
            </div>
        </InternalIntlWrapper>
    );
};

// TODO fix mobile view or remove it
export const AttributeFilterButtonMobileExamples = (): JSX.Element => {
    return (
        <InternalIntlWrapper>
            <div className="library-component screenshot-target">
                <h4>AttributeFilterButton closed</h4>
                <AttributeFilterButton
                    isMobile={true}
                    isOpen={false}
                    title={attributeTitle}
                    subtitleText={"All"}
                    subtitleItemCount={10}
                    isFiltering={false}
                    isLoaded={true}
                    onClick={action("onClick")}
                />
                <h4>AttributeFilterButton opened</h4>
                <AttributeFilterButton
                    isMobile={true}
                    isOpen={true}
                    title={attributeTitle}
                    subtitleText={"All"}
                    subtitleItemCount={10}
                    isFiltering={false}
                    isLoaded={true}
                    onClick={action("onClick")}
                />
            </div>
        </InternalIntlWrapper>
    );
};

storiesOf(`${FilterStories}@next/Components/AttributeFilterButton`)
    .add("full-featured", () => <AttributeFilterButtonExamples />, {})
    .add("themed", () => wrapWithTheme(<AttributeFilterButtonExamples />), {});
//TODO fix mobile view or remove it
// .add("mobile", () => <AttributeFilterButtonMobileExamples />, { screenshot: true });
