// (C) 2024 GoodData Corporation

import path from "path";

// eslint-disable-next-line import/no-unresolved
import { validateThemingInCssFile } from "@gooddata/sdk-ui-theme-provider/node";

const pathToCss = path.resolve("styles/css/main.css");
validateThemingInCssFile(pathToCss);
