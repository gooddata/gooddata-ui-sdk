// (C) 2020 GoodData Corporation
import { createDateValueFormatter } from "../dateValueFormatter";
import { DateFormat } from "../dateValueParser";
import { createDefaultDateFormatter } from "../defaultDateFormatter";

describe("createDateValueFormatter", () => {
    const scenarios: Array<[string, string, string]> = [
        ["01/31/2020", "MM/dd/yyyy", "01/31/2020"],
        ["01/31/2020", "dd/MM/yyyy", "31/01/2020"],
        ["01/31/2020", "dd-MM-yyyy", "31-01-2020"],
        ["01/31/2020", "yyyy-MM-dd", "2020-01-31"],
        ["01/31/2020", "M/d/yy", "1/31/20"],
        ["01/31/2020", "dd.MM.yyyy", "31.01.2020"],
    ];

    it.each(scenarios)("should format (%s, %s) as %s", (value, dateFormat, expected) => {
        const defaultDateValueFormatter = createDateValueFormatter(
            createDefaultDateFormatter(dateFormat as DateFormat),
        );
        const actual = defaultDateValueFormatter(value);
        expect(actual).toBe(expected);
    });
});
