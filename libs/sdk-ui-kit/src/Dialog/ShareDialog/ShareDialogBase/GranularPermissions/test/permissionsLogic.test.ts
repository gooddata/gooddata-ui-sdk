// (C) 2023 GoodData Corporation

import { getEffectivePermission } from "../permissionsLogic";

describe("permissions logic", () => {
    describe("getEffectivePermission", () => {
        it.each`
            direct       | inherited   | expected
            ${["SHARE"]} | ${["EDIT"]} | ${"EDIT"}
            ${["SHARE"]} | ${["VIEW"]} | ${"SHARE"}
            ${["VIEW"]}  | ${["VIEW"]} | ${"VIEW"}
        `("returns the highest of inherited and direct permissions", ({ direct, inherited, expected }) => {
            const result = getEffectivePermission(direct, inherited);

            expect(result).toEqual(expected);
        });

        it("fails when incomplete permissions are provided", () => {
            const getResult = () => getEffectivePermission([], []);

            expect(getResult).toThrow();
        });
    });
});
