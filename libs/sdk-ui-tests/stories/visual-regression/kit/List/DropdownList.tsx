// (C) 2021 GoodData Corporation
import React from "react";
import { storiesOf } from "@storybook/react";
import { withIntl } from "@gooddata/sdk-ui";
import { DropdownList, SingleSelectListItem, ISingleSelectListItemProps } from "@gooddata/sdk-ui-kit";

import { UiKit } from "../../../_infra/storyGroups";
import { withScreenshot } from "../../../_infra/backstopWrapper";
import { wrapWithTheme } from "../../themeWrapper";

const items: ISingleSelectListItemProps[] = [
    {
        title: "Section 1",
        type: "header",
    },
    {
        title: "First",
    },
    {
        title: "Second",
    },
    {
        title: "Section 2",
        type: "header",
    },
    {
        title: "Third",
    },
    {
        type: "separator",
    },
    {
        title: "Fourth",
    },
];

const DropdownListExamples: React.FC = () => {
    return (
        <div className="library-component screenshot-target">
            <DropdownList
                width={200}
                items={items}
                renderItem={({ item }) => (
                    <SingleSelectListItem
                        title={item.title}
                        isSelected={item.title === "Second"}
                        type={item.type}
                    />
                )}
            />
        </div>
    );
};

const WithIntl = withIntl<unknown>(DropdownListExamples, undefined, {});

storiesOf(`${UiKit}/DropdownList`, module).add("full-featured", () => withScreenshot(<WithIntl />));
storiesOf(`${UiKit}/DropdownList`, module).add("themed", () => withScreenshot(wrapWithTheme(<WithIntl />)));
