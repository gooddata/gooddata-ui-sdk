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
            { type: "text", value: " WHERE NOT " },
            { type: "bracket", value: "(" },
            { type: "label", value: "label/customer.c_custkey" },
            { type: "text", value: " IN " },
            { type: "bracket", value: "(" },
            { type: "quoted_text", value: '"Returned"' },
            { type: "text", value: ", " },
            { type: "quoted_text", value: '"Canceled"' },
            { type: "bracket", value: "))" },
            { type: "text", value: " by all except " },
            { type: "attribute", value: "attribute/attr.customer.c_custkey" },
        ]);
    });

    it("parses MAQL without whitespace around operators (RAIL-3132)", () => {
        const tokens = tokenizeExpression("SELECT SUM({fact/order_lines.price}*{fact/order_lines.quantity})");
        expect(tokens).toEqual([
            { type: "text", value: "SELECT SUM" },
            { type: "bracket", value: "(" },
            { type: "fact", value: "fact/order_lines.price" },
            { type: "text", value: "*" },
            { type: "fact", value: "fact/order_lines.quantity" },
            { type: "bracket", value: ")" },
        ]);
    });

    it("parses MAQL with comments", () => {
        const tokens = tokenizeExpression(
            'SELECT SUM({fact/order_lines.price}*{fact/order_lines.quantity}) # WHERE NOT ({label/customer.c_custkey} IN ("Returned", "Canceled"))',
        );
        expect(tokens).toEqual([
            { type: "text", value: "SELECT SUM" },
            { type: "bracket", value: "(" },
            { type: "fact", value: "fact/order_lines.price" },
            { type: "text", value: "*" },
            { type: "fact", value: "fact/order_lines.quantity" },
            { type: "bracket", value: ")" },
            { type: "text", value: " " },
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
            { type: "text", value: "SELECT SUM" },
            { type: "bracket", value: "(" },
            { type: "fact", value: "fact/order_lines.price" },
            { type: "text", value: "*" },
            { type: "fact", value: "fact/order_lines.quantity" },
            { type: "bracket", value: ")" },
            { type: "text", value: " " },
            { type: "comment", value: "# WHERE NOT" },
            { type: "text", value: "\n\rWHERE " },
            { type: "bracket", value: "(" },
            { type: "label", value: "label/customer.c_custkey" },
            { type: "text", value: " IN " },
            { type: "bracket", value: "(" },
            { type: "quoted_text", value: '"Returned"' },
            { type: "text", value: ", " },
            { type: "quoted_text", value: '"Canceled"' },
            { type: "bracket", value: "))" },
            { type: "text", value: " " },
            { type: "comment", value: '# "Invalid"?' },
        ]);
    });

    it("parses MAQL with numbers", () => {
        const tokens = tokenizeExpression("SELECT 123 WHERE {fact/order_lines.quantity} > 5");
        expect(tokens).toEqual([
            { type: "text", value: "SELECT " },
            { type: "number", value: "123" },
            { type: "text", value: " WHERE " },
            { type: "fact", value: "fact/order_lines.quantity" },
            { type: "text", value: " > " },
            { type: "number", value: "5" },
        ]);
    });

    it("parses MAQL with decimal numbers", () => {
        const tokens = tokenizeExpression("SELECT 12.3 WHERE {fact/order_lines.quantity} > 5.8");
        expect(tokens).toEqual([
            { type: "text", value: "SELECT " },
            { type: "number", value: "12.3" },
            { type: "text", value: " WHERE " },
            { type: "fact", value: "fact/order_lines.quantity" },
            { type: "text", value: " > " },
            { type: "number", value: "5.8" },
        ]);
    });

    it("parses MAQL with brackets in comment", () => {
        const tokens = tokenizeExpression("SELECT 123 # WHERE SUM({fact/sum}) > 5");
        expect(tokens).toEqual([
            { type: "text", value: "SELECT " },
            { type: "number", value: "123" },
            { type: "text", value: " " },
            { type: "comment", value: "# WHERE SUM({fact/sum}) > 5" },
        ]);
    });

    it("parses MAQL with dataset", () => {
        const tokens = tokenizeExpression("SELECT COUNT({dataset/campaign_channels})");
        expect(tokens).toEqual([
            { type: "text", value: "SELECT COUNT" },
            { type: "bracket", value: "(" },
            { type: "dataset", value: "dataset/campaign_channels" },
            { type: "bracket", value: ")" },
        ]);
    });
});
