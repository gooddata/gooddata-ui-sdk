// (C) 2021-2026 GoodData Corporation

import { useContext } from "react";

import { createMakeStyles } from "tss-react";

import { ThemeContext } from "./theme.js";

export const { makeStyles } = createMakeStyles({ useTheme: () => useContext(ThemeContext) });
