// (C) 2019-2022 GoodData Corporation

import { REPEAT_EXECUTE_ON, REPEAT_FREQUENCIES } from "../../../constants.js";

export const REPEAT_EXECUTE_ON_INDEX = {
    [REPEAT_EXECUTE_ON.DAY_OF_MONTH]: 1,
    [REPEAT_EXECUTE_ON.DAY_OF_WEEK]: 2,
};

export const REPEAT_FREQUENCY_INDEX = {
    [REPEAT_FREQUENCIES.DAY]: 1,
    [REPEAT_FREQUENCIES.WEEK]: 2,
    [REPEAT_FREQUENCIES.MONTH]: 3,
};

export const TEXT_INDEX: string[] = ["zero", "first", "second", "third", "fourth", "last"];
