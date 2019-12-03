// (C) 2007-2019 GoodData Corporation
import { percentFormatter, unwrap } from "../utils";

describe("percentFormatter", () => {
    it.each([["0%", 0], ["49.01%", 49.01], ["100%", 100], ["", null]])(
        'should return "%s" when input is %s',
        (formattedValue: string, value: number) => {
            expect(percentFormatter(value)).toEqual(formattedValue);
        },
    );
});

describe("unwrap", () => {
    it("should unwrap an object", () => {
        expect(unwrap({ key: "value" })).toEqual("value");
    });
});
