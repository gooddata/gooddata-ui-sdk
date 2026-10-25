// (C) 2025-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { ActionTypeKeys } from "../constants/actions.js";

export const telemetryInitialized = createAction(ActionTypeKeys.TELEMETRY_INITIALIZED);
