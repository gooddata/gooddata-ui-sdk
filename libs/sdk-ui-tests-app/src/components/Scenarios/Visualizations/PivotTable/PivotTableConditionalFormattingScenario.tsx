// (C) 2026 GoodData Corporation

import { modifyAttribute, modifyMeasure } from "@gooddata/sdk-model";
import "@gooddata/sdk-ui-pivot/styles/css/main.css";
import {
    PivotTableNext,
    type PivotTableNextConditionalFormattingConfig,
    type PivotTableNextConfig,
} from "@gooddata/sdk-ui-pivot";
import * as ReferenceMd from "@gooddata/sdk-ui-tests-reference-workspace/current_tiger";

// Stable local identifiers so the conditional-formatting rules can target these columns.
const amount = modifyMeasure(ReferenceMd.Amount, (m) => m.localId("cf_amount"));
const product = modifyAttribute(ReferenceMd.Product.Name, (a) => a.localId("cf_product"));

// Demo rules — deterministic regardless of the underlying data:
//  • a cell-scope rule on the Amount measure (ALL → matches every Amount cell)
//  • a row-scope rule on the Product attribute (ALL → matches every row)
// Result: the Amount column is red (cell-scope beats row-scope on its own cell),
// every other cell in the row — including the Product row-header — is green.
// This proves cell painting, whole-row painting that reaches the attribute column,
// and cell-beats-row precedence in one view.
// Intentionally non-pivoted: Increment-1 targets non-pivoted measure columns (a pivoted measure
// spans several columns, of which a rule resolves only the first — a documented v1 limitation).
const conditionalFormattingConfig: PivotTableNextConfig & PivotTableNextConditionalFormattingConfig = {
    conditionalFormatting: {
        enabled: true,
        rules: [
            {
                id: "amount-cell",
                target: { kind: "measure", measureIdentifier: "cf_amount" },
                conditions: [
                    {
                        id: "amount-all",
                        operator: "ALL",
                        value: { kind: "none" },
                        format: { backgroundColor: "#E54D40", color: "#FFFFFF", scope: "cell" },
                    },
                ],
            },
            {
                id: "product-row",
                target: { kind: "attribute", attributeIdentifier: "cf_product" },
                conditions: [
                    {
                        id: "product-all",
                        operator: "ALL",
                        value: { kind: "none" },
                        format: { backgroundColor: "#00C18D", color: "#FFFFFF", scope: "row" },
                    },
                ],
            },
        ],
    },
};

export function PivotTableConditionalFormatting() {
    return (
        <div style={{ width: 1000, height: 400, marginTop: 20 }} className="s-table-conditional-formatting">
            <PivotTableNext measures={[amount]} rows={[product]} config={conditionalFormattingConfig} />
        </div>
    );
}
