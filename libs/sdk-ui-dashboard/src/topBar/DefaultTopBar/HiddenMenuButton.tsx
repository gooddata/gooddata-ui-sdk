// (C) 2021 GoodData Corporation
import React from "react";

import { IMenuButtonCoreProps } from "../types";

/**
 * This implementation of menu button keeps it out of sight and effectively disables it.
 *
 * @internal
 */
export const HiddenMenuButton: React.FC<IMenuButtonCoreProps> = (_props) => {
    return null;
};
