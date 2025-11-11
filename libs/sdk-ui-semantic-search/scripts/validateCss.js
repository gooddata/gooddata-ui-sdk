// (C) 2024 GoodData Corporation
import path from "path";

import { validateThemingInCssFile } from "@gooddata/sdk-ui-theme-provider/node";

// TODO: USE GLOB TO FIND ALL OTHER CSS FILES IN BUILD

const pathToCss = path.resolve("styles/css/main.css");
validateThemingInCssFile(pathToCss);
