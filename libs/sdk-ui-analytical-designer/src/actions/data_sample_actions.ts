// (C) 2007-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { ActionTypeKeys } from "../constants/actions.js";

export const updateDataSamplingPercentage = createAction(
    ActionTypeKeys.UPDATE_DATA_SAMPLING_PERCENTAGE,
    (percentage: number) => ({ payload: percentage }),
);

export const deleteDataSamplingPercentage = createAction(ActionTypeKeys.DELETE_DATA_SAMPLING_PERCENTAGE);
