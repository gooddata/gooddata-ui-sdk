// (C) 2024-2026 GoodData Corporation

import path from "path";

import { validateThemingInCssFile, validateThemingInCssFolder } from "@gooddata/sdk-ui-theme-provider/node";

const pathToCss = path.resolve("styles/css/main.css");
validateThemingInCssFile(pathToCss);

const pathToInternalCss = path.resolve("styles/internal/css");
validateThemingInCssFolder(pathToInternalCss);
