// (C) 2021 GoodData Corporation
import { EntityState } from "@reduxjs/toolkit";
import { IWidgetAlert } from "@gooddata/sdk-backend-spi";

/**
 * @internal
 */
export type AlertsState = EntityState<IWidgetAlert>;
