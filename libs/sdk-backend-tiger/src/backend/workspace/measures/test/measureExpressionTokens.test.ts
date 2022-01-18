// (C) 2020-2022 GoodData Corporation
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

    it("parses MAQL without whitespace around operators (RAIL-3132)", () => {
        const tokens = tokenizeExpression("SELECT SUM({fact/order_lines.price}*{fact/order_lines.quantity})");
        expect(tokens).toEqual([
            { type: "text", value: "SELECT SUM(" },
            { type: "fact", value: "fact/order_lines.price" },
            { type: "text", value: "*" },
            { type: "fact", value: "fact/order_lines.quantity" },
            { type: "text", value: ")" },
        ]);
    });

    it("parses MAQL with comments", () => {
        const tokens = tokenizeExpression(
            'SELECT SUM({fact/order_lines.price}*{fact/order_lines.quantity}) # WHERE NOT ({label/customer.c_custkey} IN ("Returned", "Canceled"))',
        );
        expect(tokens).toEqual([
            { type: "text", value: "SELECT SUM(" },
            { type: "fact", value: "fact/order_lines.price" },
            { type: "text", value: "*" },
            { type: "fact", value: "fact/order_lines.quantity" },
            { type: "text", value: ") " },
            {
                type: "comment",
                value: '# WHERE NOT ({label/customer.c_custkey} IN ("Returned", "Canceled"))',
            },
        ]);
    });

    it("parses MAQL with more comments", () => {
        const tokens = tokenizeExpression(
            'SELECT SUM({fact/order_lines.price}*{fact/order_lines.quantity}) # WHERE NOT\n\rWHERE ({label/customer.c_custkey} IN ("Returned", "Canceled")) # "Invalid"?',
        );
        expect(tokens).toEqual([
            { type: "text", value: "SELECT SUM(" },
            { type: "fact", value: "fact/order_lines.price" },
            { type: "text", value: "*" },
            { type: "fact", value: "fact/order_lines.quantity" },
            { type: "text", value: ") " },
            { type: "comment", value: "# WHERE NOT" },
            { type: "text", value: "\n\rWHERE (" },
            { type: "label", value: "label/customer.c_custkey" },
            { type: "text", value: " IN (" },
            { type: "quoted_text", value: '"Returned"' },
            { type: "text", value: ", " },
            { type: "quoted_text", value: '"Canceled"' },
            { type: "text", value: ")) " },
            { type: "comment", value: '# "Invalid"?' },
        ]);
    });
});
