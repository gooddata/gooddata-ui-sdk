// (C) 2021-2022 GoodData Corporation
import { IThemeComplementaryPalette } from "@gooddata/sdk-model";

import { getComplementaryPalette } from "../complementaryPalette";

describe("complementaryPalette", () => {
    describe("getComplementaryPalette", () => {
        const Scenarios: Array<[IThemeComplementaryPalette]> = [
            [{ c0: "#001122", c9: "#095f0f" }],
            [{ c0: "#001122", c5: "#fcba03", c9: "#095f0f" }],
            [
                {
                    c0: "#001122",
                    c1: "#01191f",
                    c2: "#02221d",
                    c3: "#032b1b",
                    c4: "#043319",
                    c5: "#053c17",
                    c6: "#064515",
                    c7: "#074d13",
                    c8: "#085611",
                    c9: "#095f0f",
                },
            ],
        ];

        it.each(Scenarios)("should generate missing colors in complementary palette", (palette) => {
            expect(getComplementaryPalette(palette)).toMatchSnapshot();
        });

        it("should generate missing colors in complementary palette even the input not in order", () => {
            const palette = { c9: "#095f0f", c5: "#fcba03", c0: "#001122" };

            expect(getComplementaryPalette(palette)).toMatchSnapshot();
        });
    });
});
