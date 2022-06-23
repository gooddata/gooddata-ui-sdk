// (C) 2022 GoodData Corporation
import React from "react";

import { FilterStories } from "../../../../_infra/storyGroups";
import { storiesOf } from "../../../../_infra/storyRepository";
import { wrapWithTheme } from "../../../themeWrapper";

import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/dist/internal/utils/internalIntlProvider";
import { AttributeFilterDropdownBody } from "@gooddata/sdk-ui-filters/dist/AttributeFilter@next/Components/AttributeFilterDropdownBody";
import { action } from "@storybook/addon-actions";

const AttributeFilterButtonDefaultDropdownBodyExamples = (): JSX.Element => {
    return (
        <InternalIntlWrapper>
            <div style={{ width: 500 }}>
                <div className="library-component screenshot-target">
                    <h4>AttributeFilterButtonDefaultDropdownBody</h4>
                    <div style={{ width: 261, border: "1px solid black" }}>
                        <AttributeFilterDropdownBody
                            applyDisabled={false}
                            allElementsFiltered={false}
                            hasNoData={false}
                            onApplyButtonClicked={action("onApplyButtonClicked")}
                            closeDropdown={action("closeDropdown")}
                            bodyProps={{
                                totalCount: 2,
                                selectedItems: [],
                                items: [
                                    { title: "item 1", uri: "uri1" },
                                    { title: "item 2", uri: "uri2" },
                                ],
                                isInverted: false,
                                isLoading: false,
                                searchString: "",
                                hasNoData: false,
                                allElementsFiltered: false,
                                parentFilterTitles: ["Title1", "Title2"],
                                onSearch: action("onSearch"),
                                onSelect: action("onSelect"),
                                onRangeChange: action("onRangeChange"),
                            }}
                        />
                    </div>

                    <h4>AttributeFilterButtonDefaultDropdownBody with selection and search</h4>
                    <div style={{ width: 261, border: "1px solid black" }}>
                        <AttributeFilterDropdownBody
                            applyDisabled={false}
                            allElementsFiltered={false}
                            hasNoData={false}
                            onApplyButtonClicked={action("onApplyButtonClicked")}
                            closeDropdown={action("closeDropdown")}
                            bodyProps={{
                                totalCount: 2,
                                selectedItems: [{ title: "item 1", uri: "uri1" }],
                                items: [
                                    { title: "item 1", uri: "uri1" },
                                    { title: "item 2", uri: "uri2" },
                                ],
                                isInverted: false,
                                isLoading: false,
                                searchString: "bla",
                                hasNoData: false,
                                allElementsFiltered: false,
                                parentFilterTitles: ["Title1", "Title2"],
                                onSearch: action("onSearch"),
                                onSelect: action("onSelect"),
                                onRangeChange: action("onRangeChange"),
                            }}
                        />
                    </div>

                    <h4>AttributeFilterButtonDefaultDropdownBody all elements filtered</h4>
                    <div style={{ width: 261, border: "1px solid black" }}>
                        <AttributeFilterDropdownBody
                            applyDisabled={false}
                            allElementsFiltered={true}
                            hasNoData={false}
                            onApplyButtonClicked={action("onApplyButtonClicked")}
                            closeDropdown={action("closeDropdown")}
                            bodyProps={{
                                totalCount: 0,
                                selectedItems: [],
                                items: [],
                                isInverted: false,
                                isLoading: false,
                                searchString: "",
                                hasNoData: false,
                                allElementsFiltered: true,
                                parentFilterTitles: ["Title1", "Title2"],
                                onSearch: action("onSearch"),
                                onSelect: action("onSelect"),
                                onRangeChange: action("onRangeChange"),
                            }}
                        />
                    </div>

                    <h4>AttributeFilterButtonDefaultDropdownBody parent filtered</h4>
                    <div style={{ width: 261, border: "1px solid black" }}>
                        <AttributeFilterDropdownBody
                            applyDisabled={false}
                            allElementsFiltered={true}
                            hasNoData={false}
                            onApplyButtonClicked={action("onApplyButtonClicked")}
                            closeDropdown={action("closeDropdown")}
                            bodyProps={{
                                totalCount: 2,
                                selectedItems: [{ title: "item 1", uri: "uri1" }],
                                items: [
                                    { title: "item 1", uri: "uri1" },
                                    { title: "item 2", uri: "uri2" },
                                ],
                                isInverted: false,
                                isLoading: false,
                                searchString: "bla",
                                hasNoData: false,
                                allElementsFiltered: true,
                                parentFilterTitles: ["Title1", "Title2"],
                                showItemsFilteredMessage: true,
                                onSearch: action("onSearch"),
                                onSelect: action("onSelect"),
                                onRangeChange: action("onRangeChange"),
                            }}
                        />
                    </div>

                    <h4>AttributeFilterButtonDefaultDropdownBody no data</h4>
                    <div style={{ width: 261, border: "1px solid black" }}>
                        <AttributeFilterDropdownBody
                            applyDisabled={false}
                            allElementsFiltered={false}
                            hasNoData={true}
                            onApplyButtonClicked={action("onApplyButtonClicked")}
                            closeDropdown={action("closeDropdown")}
                            bodyProps={{
                                totalCount: 0,
                                selectedItems: [],
                                items: [],
                                isInverted: false,
                                isLoading: false,
                                searchString: "",
                                hasNoData: true,
                                allElementsFiltered: false,
                                parentFilterTitles: ["Title1", "Title2"],
                                onSearch: action("onSearch"),
                                onSelect: action("onSelect"),
                                onRangeChange: action("onRangeChange"),
                            }}
                        />
                    </div>

                    <h4>AttributeFilterButtonDefaultDropdownBody error in list</h4>
                    <div style={{ width: 261, border: "1px solid black" }}>
                        <AttributeFilterDropdownBody
                            applyDisabled={false}
                            allElementsFiltered={false}
                            hasNoData={false}
                            onApplyButtonClicked={action("onApplyButtonClicked")}
                            closeDropdown={action("closeDropdown")}
                            bodyProps={{
                                error: { err: true },
                                totalCount: 0,
                                selectedItems: [],
                                items: [],
                                isInverted: false,
                                isLoading: false,
                                searchString: "",
                                hasNoData: false,
                                allElementsFiltered: false,
                                parentFilterTitles: ["Title1", "Title2"],
                                onSearch: action("onSearch"),
                                onSelect: action("onSelect"),
                                onRangeChange: action("onRangeChange"),
                            }}
                        />
                    </div>
                </div>
            </div>
        </InternalIntlWrapper>
    );
};

storiesOf(`${FilterStories}@next/Components/AttributeFilterDropdownBody`)
    .add("full-featured", () => <AttributeFilterButtonDefaultDropdownBodyExamples />, {})
    .add("themed", () => wrapWithTheme(<AttributeFilterButtonDefaultDropdownBodyExamples />), {});
