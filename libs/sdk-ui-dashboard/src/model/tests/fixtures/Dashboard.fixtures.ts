// (C) 2021 GoodData Corporation

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { IDashboardWithReferences } from "@gooddata/sdk-backend-spi";
import { idRef, IDrillDownReference } from "@gooddata/sdk-model";

//
// Basic constants and building blocks used in tests
//

export const TestCorrelation = "testCorrelationId";
export const TestStash = "testStash";
export const BeforeTestCorrelation = "beforeTestId";

/**
 * Empty dashboard. No filter context, empty layout.
 */
export const EmptyDashboardIdentifier = "emptyDashboard";
export const EmptyDashboardWithReferences = ReferenceRecordings.Recordings.metadata.dashboards
    .dash_emptyDashboard.obj as IDashboardWithReferences;

export const ignoredHierarchies: IDrillDownReference[] = [
    {
        type: "attributeHierarchyReference",
        attributeHierarchy: idRef("test_attribute_hierarchies_1", "attributeHierarchy"),
        label: idRef("f_owner.department_id", "displayForm"),
    },
];
