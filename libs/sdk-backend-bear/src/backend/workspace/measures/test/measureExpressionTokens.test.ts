// (C) 2020-2022 GoodData Corporation
import { tokenizeExpression } from "../measureExpressionTokens";

describe("tokenizeExpression", () => {
    it("splits MAQL with more than one identifier to tokens (RAIL-2577)", () => {
        const expression =
            "select avg({fact.opportunitysnapshot.amount}) where {attr.account.id} in ([/gdc/md/projectId/obj/969/elements?id=123]) and {snapshot.year} > 2011";

        const tokens = tokenizeExpression(expression);

        expect(tokens).toEqual([
            { type: "text", value: "select avg" },
            { type: "bracket", value: "(" },
            { type: "identifier", value: "fact.opportunitysnapshot.amount" },
            { type: "bracket", value: ")" },
            { type: "text", value: " where " },
            { type: "identifier", value: "attr.account.id" },
            { type: "text", value: " in " },
            { type: "bracket", value: "(" },
            {
                type: "element_uri",
                value: "/gdc/md/projectId/obj/969/elements?id=123",
            },
            { type: "bracket", value: ")" },
            { type: "text", value: " and " },
            { type: "identifier", value: "snapshot.year" },
            { type: "text", value: " > " },
            { type: "number", value: "2011" },
        ]);
    });

    it("parses MAQL without whitespace around operators (RAIL-3132)", () => {
        const tokens = tokenizeExpression(
            "SELECT SUM({fact.opportunitysnapshot.amount}*{fact.opportunitysnapshot.amount2})",
        );
        expect(tokens).toEqual([
            { type: "text", value: "SELECT SUM" },
            { type: "bracket", value: "(" },
            { type: "identifier", value: "fact.opportunitysnapshot.amount" },
            { type: "text", value: "*" },
            { type: "identifier", value: "fact.opportunitysnapshot.amount2" },
            { type: "bracket", value: ")" },
        ]);
    });

    it("parses MAQL with comments", () => {
        const expression =
            "select avg({fact.opportunitysnapshot.amount}) where {attr.account.id} in ([/gdc/md/projectId/obj/969/elements?id=123]) and {snapshot.year} > 2011 #test comment";

        const tokens = tokenizeExpression(expression);

        expect(tokens).toEqual([
            { type: "text", value: "select avg" },
            { type: "bracket", value: "(" },
            { type: "identifier", value: "fact.opportunitysnapshot.amount" },
            { type: "bracket", value: ")" },
            { type: "text", value: " where " },
            { type: "identifier", value: "attr.account.id" },
            { type: "text", value: " in " },
            { type: "bracket", value: "(" },
            {
                type: "element_uri",
                value: "/gdc/md/projectId/obj/969/elements?id=123",
            },
            { type: "bracket", value: ")" },
            { type: "text", value: " and " },
            { type: "identifier", value: "snapshot.year" },
            { type: "text", value: " > " },
            { type: "number", value: "2011" },
            { type: "text", value: " " },
            { type: "comment", value: "#test comment" },
        ]);
    });

    it("parses MAQL with more comments", () => {
        const expression =
            "select avg({fact.opportunitysnapshot.amount}) # where {attr.account.id} and\n\rWHERE {snapshot.year} > 2011 #test comment";

        const tokens = tokenizeExpression(expression);

        expect(tokens).toEqual([
            { type: "text", value: "select avg" },
            { type: "bracket", value: "(" },
            { type: "identifier", value: "fact.opportunitysnapshot.amount" },
            { type: "bracket", value: ")" },
            { type: "text", value: " " },
            { type: "comment", value: "# where {attr.account.id} and" },
            { type: "text", value: "\n\rWHERE " },
            { type: "identifier", value: "snapshot.year" },
            { type: "text", value: " > " },
            { type: "number", value: "2011" },
            { type: "text", value: " " },
            { type: "comment", value: "#test comment" },
        ]);
    });

    it("parses MAQL with numbers", () => {
        const expression = "SELECT 123 WHERE {fact/order_lines.quantity} > 5";

        const tokens = tokenizeExpression(expression);

        expect(tokens).toEqual([
            { type: "text", value: "SELECT " },
            { type: "number", value: "123" },
            { type: "text", value: " WHERE " },
            { type: "identifier", value: "fact/order_lines.quantity" },
            { type: "text", value: " > " },
            { type: "number", value: "5" },
        ]);
    });

    it("parses MAQL with decimal numbers", () => {
        const expression = "SELECT 12.3 WHERE {fact/order_lines.quantity} > 5.8";

        const tokens = tokenizeExpression(expression);

        expect(tokens).toEqual([
            { type: "text", value: "SELECT " },
            { type: "number", value: "12.3" },
            { type: "text", value: " WHERE " },
            { type: "identifier", value: "fact/order_lines.quantity" },
            { type: "text", value: " > " },
            { type: "number", value: "5.8" },
        ]);
    });

    it("parses MAQL with brackets in comment", () => {
        const expression = "SELECT 123 # WHERE SUM({fact/sum}) > 5";

        const tokens = tokenizeExpression(expression);

        expect(tokens).toEqual([
            { type: "text", value: "SELECT " },
            { type: "number", value: "123" },
            { type: "text", value: " " },
            { type: "comment", value: "# WHERE SUM({fact/sum}) > 5" },
        ]);
    });
});
