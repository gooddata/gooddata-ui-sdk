// (C) 2024 GoodData Corporation
import path from "path";
import { generateDefaultScssThemeFile } from "@gooddata/sdk-ui-theme-provider/node";

const pathToGeneratedScssFile = path.resolve("src/@ui/defaultTheme.scss");

generateDefaultScssThemeFile(pathToGeneratedScssFile);
