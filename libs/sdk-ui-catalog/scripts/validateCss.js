// (C) 2024-2025 GoodData Corporation
import path from "path";
import { validateThemingInCssFile } from "@gooddata/sdk-ui-theme-provider/node";

const pathToCss = path.resolve("styles/css/main.css");
validateThemingInCssFile(pathToCss);
