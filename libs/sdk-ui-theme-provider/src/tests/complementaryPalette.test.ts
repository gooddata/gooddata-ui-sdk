// (C) 2021 GoodData Corporation
import { IThemeComplementaryPalette } from "@gooddata/sdk-backend-spi";

import { getComplementaryPalette } from "../complementaryPalette";

describe("complementaryPalette", () => {
    describe("getComplementaryPalette", () => {
        const Scenarios: Array<[IThemeComplementaryPalette]> = [
            [{ shade0: "#001122", shade9: "#095f0f" }],
            [{ shade0: "#001122", shade5: "#fcba03", shade9: "#095f0f" }],
            [
                {
                    shade0: "#001122",
                    shade1: "#01191f",
                    shade2: "#02221d",
                    shade3: "#032b1b",
                    shade4: "#043319",
                    shade5: "#053c17",
                    shade6: "#064515",
                    shade7: "#074d13",
                    shade8: "#085611",
                    shade9: "#095f0f",
                },
            ],
        ];

        it.each(Scenarios)("should generate missing colors in complementary palette", (providedPalette) => {
            expect(getComplementaryPalette(providedPalette)).toMatchSnapshot();
        });
    });
});
