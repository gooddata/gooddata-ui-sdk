// (C) 2020 GoodData Corporation
import { tokenizeExpression } from "../measureExpressionTokens";

describe("tokenizeExpression", () => {
    it("splits MAQL string to tokens", () => {
        const tokens = tokenizeExpression(
            'SELECT {metric/Volume} * {fact/customer.c_acctbal} WHERE NOT ({label/customer.c_custkey} IN ("Returned", "Canceled")) by all except {attribute/attr.customer.c_custkey}',
        );
        expect(tokens).toEqual([
            { type: "text", value: "SELECT " },
            { type: "metric", value: "metric/Volume" },
            { type: "text", value: " * " },
            { type: "fact", value: "fact/customer.c_acctbal" },
            { type: "text", value: " WHERE NOT (" },
            { type: "label", value: "label/customer.c_custkey" },
            { type: "text", value: " IN (" },
            { type: "quoted_text", value: '"Returned"' },
            { type: "text", value: ", " },
            { type: "quoted_text", value: '"Canceled"' },
            { type: "text", value: ")) by all except " },
            { type: "attribute", value: "attribute/attr.customer.c_custkey" },
        ]);
    });
});
