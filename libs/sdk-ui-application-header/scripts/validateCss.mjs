// (C) 2024-2026 GoodData Corporation

import path from "path";

import { validateThemingInCssFolder } from "@gooddata/sdk-ui-theme-provider/node";

const pathToCss = path.resolve("dist");
validateThemingInCssFolder(pathToCss);
