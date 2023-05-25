// (C) 2022 GoodData Corporation
// import React from "react";

// import { FilterStories } from "../../../../_infra/storyGroups";
// import { storiesOf } from "../../../../_infra/storyRepository";

// import { IAttributeElement } from "@gooddata/sdk-model";
// import { action } from "@storybook/addon-actions";

// import { AttributeFilterListItem } from "@gooddata/sdk-ui-filters/dist/AttributeFilter@next/Components/AttributeFilterListItem";
// import { EmptyListItem } from "@gooddata/sdk-ui-filters/dist/AttributeFilter@next/Components/types";
// import { wrapWithTheme } from "../../../themeWrapper";
// import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/internal";

// const item: IAttributeElement = {
//     title: "Item title",
//     uri: "some uri",
// };

// const emptyItem: EmptyListItem = {
//     empty: true,
// };

// const longTitleItem: IAttributeElement = {
//     title: "Very long long long long long long long long long long long long title",
//     uri: "some uri",
// };

// const AttributeFilterListItemExamples = (): JSX.Element => {
//     return (
//         <InternalIntlWrapper>
//             <div style={{ width: 300 }}>
//                 <div className="library-component-light screenshot-target">
//                     <h4>AttributeFilterItem unselected</h4>
//                     <AttributeFilterListItem
//                         item={item}
//                         isSelected={false}
//                         onSelect={action("onSelect")}
//                         onSelectOnly={action("onSelectOnly")}
//                     />
//                     <h4>AttributeFilterItem selected</h4>
//                     <AttributeFilterListItem
//                         item={item}
//                         isSelected={true}
//                         onSelect={action("onSelect")}
//                         onSelectOnly={action("onSelectOnly")}
//                     />
//                     <h4>AttributeFilterItem empty</h4>
//                     <AttributeFilterListItem
//                         item={emptyItem}
//                         isSelected={false}
//                         onSelect={action("onSelect")}
//                         onSelectOnly={action("onSelectOnly")}
//                     />
//                     <h4>AttributeFilterItem long title </h4>
//                     <AttributeFilterListItem
//                         item={longTitleItem}
//                         isSelected={false}
//                         onSelect={action("onSelect")}
//                         onSelectOnly={action("onSelectOnly")}
//                     />
//                 </div>
//             </div>
//         </InternalIntlWrapper>
//     );
// };

// storiesOf(`${FilterStories}@next/Components/AttributeFilterItem`)
//     .add("full-featured", () => <AttributeFilterListItemExamples />, {})
//     .add("themed", () => wrapWithTheme(<AttributeFilterListItemExamples />), {});
