// (C) 2019-2020 GoodData Corporation
import { calculateXirr } from "../calculateXirr.js";
import { describe, it, expect } from "vitest";

/*
 * NOTE
 *
 * calculateXirr does a good amount of float-point arithmetic and thus is subject to all the funny stuff that comes
 * with it. to mitigate false negatives stemming from 'changes in runtime environment', these tests assert
 * results on arbitrary and reasonably small precision.
 */
describe("calculateXirr", () => {
    it("should compute XIRR value for yearly input", () => {
        // source of data: https://en.wikipedia.org/wiki/Internal_rate_of_return
        const xirrInput = [
            { when: new Date("01/01/18"), amount: -123400 },
            { when: new Date("01/01/19"), amount: 36200 },
            { when: new Date("01/01/20"), amount: 54800 },
            { when: new Date("01/01/21"), amount: 48100 },
        ];

        const actual = calculateXirr(xirrInput).toPrecision(8);
        const expected = "0.059589535";
        expect(actual).toEqual(expected);
    });

    it("should compute XIRR value for irregular input", () => {
        // source of data: https://support.office.com/en-us/article/xirr-function-de1242ec-6477-445b-b11b-a303ad9adc9d
        // note: using UTC here to keep the tests stable and not subject variations due to DST and timezone settings
        const xirrInput = [
            { when: new Date("01/01/08Z"), amount: -10000 },
            { when: new Date("03/01/08Z"), amount: 2750 },
            { when: new Date("10/30/08Z"), amount: 4250 },
            { when: new Date("02/15/09Z"), amount: 3250 },
            { when: new Date("04/01/09Z"), amount: 2750 },
        ];

        const actual = calculateXirr(xirrInput).toPrecision(8);
        const expected = "0.37336253";
        expect(actual).toEqual(expected);
    });

    it("should return NaN for data that do not converge in XIRR", () => {
        const xirrInput = [
            { when: new Date("01/01/2018"), amount: 74864.35 },
            { when: new Date("01/02/2018"), amount: 73335.81 },
            { when: new Date("01/03/2018"), amount: 72259.48 },
            { when: new Date("01/04/2018"), amount: 83044.01 },
            { when: new Date("01/05/2018"), amount: 91741.76 },
            { when: new Date("01/06/2018"), amount: 114192.59 },
            { when: new Date("01/07/2018"), amount: 100025.64 },
            { when: new Date("01/08/2018"), amount: 73717.14 },
            { when: new Date("01/09/2018"), amount: 74834.44 },
            { when: new Date("01/10/2018"), amount: 70737.94 },
            { when: new Date("01/11/2018"), amount: 81434.8 },
            { when: new Date("01/12/2018"), amount: 94384.53 },
            { when: new Date("01/13/2018"), amount: 109841.25 },
            { when: new Date("01/14/2018"), amount: 96972.13 },
            { when: new Date("01/15/2018"), amount: 72879.21 },
            { when: new Date("01/16/2018"), amount: 72072.02 },
            { when: new Date("01/17/2018"), amount: 71637.02 },
            { when: new Date("01/18/2018"), amount: 80907.8 },
            { when: new Date("01/19/2018"), amount: 91901.49 },
            { when: new Date("01/20/2018"), amount: 107424.93 },
            { when: new Date("01/21/2018"), amount: 101017.38 },
            { when: new Date("01/22/2018"), amount: 73552.28 },
            { when: new Date("01/23/2018"), amount: 73174.06 },
            { when: new Date("01/24/2018"), amount: 73864.49 },
            { when: new Date("01/25/2018"), amount: 81532.27 },
            { when: new Date("01/26/2018"), amount: 90195.28 },
            { when: new Date("01/27/2018"), amount: 107569.45 },
            { when: new Date("01/28/2018"), amount: 100324.57 },
            { when: new Date("01/29/2018"), amount: 74411.58 },
            { when: new Date("01/30/2018"), amount: 73350.7 },
            { when: new Date("01/31/2018"), amount: 71437.15 },
            { when: new Date("02/01/2018"), amount: 80743.89 },
            { when: new Date("02/02/2018"), amount: 90335.81 },
            { when: new Date("02/03/2018"), amount: 108297.96 },
            { when: new Date("02/04/2018"), amount: 99792.86 },
            { when: new Date("02/05/2018"), amount: 72249.25 },
            { when: new Date("02/06/2018"), amount: 75032.76 },
            { when: new Date("02/07/2018"), amount: 73646.98 },
            { when: new Date("02/08/2018"), amount: 83355.43 },
            { when: new Date("02/09/2018"), amount: 94861.07 },
            { when: new Date("02/10/2018"), amount: 111523.51 },
            { when: new Date("02/11/2018"), amount: 101390.68 },
            { when: new Date("02/12/2018"), amount: 73097.03 },
            { when: new Date("02/13/2018"), amount: 144009.96 },
            { when: new Date("02/14/2018"), amount: 81629.09 },
            { when: new Date("02/15/2018"), amount: 91936.9 },
            { when: new Date("02/16/2018"), amount: 111429.02 },
            { when: new Date("02/17/2018"), amount: 101767.02 },
            { when: new Date("02/18/2018"), amount: 73443.53 },
            { when: new Date("02/19/2018"), amount: 73071.26 },
            { when: new Date("02/20/2018"), amount: 71601.7 },
            { when: new Date("02/21/2018"), amount: 81491.6 },
            { when: new Date("02/22/2018"), amount: 89503.86 },
            { when: new Date("02/23/2018"), amount: 106453.4 },
            { when: new Date("02/24/2018"), amount: 102473.51 },
        ];

        const actual = calculateXirr(xirrInput);
        expect(actual).toBeNaN();
    });
});
