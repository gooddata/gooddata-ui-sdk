// (C) 2023-2024 GoodData Corporation
import * as Navigation from "../../tools/navigation";
import { FilterBar } from "../../tools/filterBar";
import { AttributeFilterTooltip } from "../../tools/attributeFilterTooltip";
import { InsightsCatalog } from "../../tools/insightsCatalog";
import { EditMode } from "../../tools/editMode";

// Can be removed once migrated to tiger or once decided that we don't want to migrate the test.
// eslint-disable-next-line jest/no-disabled-tests
describe.skip("Attribute selection tooltip", { tags: ["pre-merge_isolated_bear"] }, () => {
    it("should show attribute values, title and dataset on tooltip when item is hover", () => {
        Navigation.visit("dashboard/attribute-selection");

        new EditMode().isInEditMode();
        new InsightsCatalog().waitForCatalogLoad();
        new FilterBar()
            .dragAttributeToFilterBar()
            .searchAttributeName("Account")
            .showTooltipDialog("Account");

        new AttributeFilterTooltip()
            .hasHeading("Account")
            .hasDataSet("Account")
            .hasAttributeValues([".decimal", "(add)ventures", "(blank)", "(mt) Media Temple", "@properties"]);
    });
});
