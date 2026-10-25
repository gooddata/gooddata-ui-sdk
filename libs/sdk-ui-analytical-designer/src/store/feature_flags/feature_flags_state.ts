// (C) 2026 GoodData Corporation

import { type IUserSettings, type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";

export type IFeatureFlagsState = Partial<IUserWorkspaceSettings & IUserSettings>;

export const featureFlagsInitialState: IFeatureFlagsState = {};
