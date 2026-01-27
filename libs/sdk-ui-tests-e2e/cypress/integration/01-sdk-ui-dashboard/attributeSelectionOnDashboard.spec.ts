// (C) 2023-2026 GoodData Corporation

import { AttributeFilterTooltip } from "../../tools/attributeFilterTooltip";
import { EditMode } from "../../tools/editMode";
import { FilterBar } from "../../tools/filterBar";
import { InsightsCatalog } from "../../tools/insightsCatalog";
import { visit } from "../../tools/navigation";

// Can be removed once migrated to tiger or once decided that we don't want to migrate the test.
describe.skip("Attribute selection tooltip", { tags: ["pre-merge_isolated_bear"] }, () => {
    it("should show attribute values, title and dataset on tooltip when item is hover", () => {
        visit("dashboard/attribute-selection");

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
