// (C) 2024 GoodData Corporation
import path from "path";

// eslint-disable-next-line import/no-unresolved
import { generateDefaultScssThemeFile } from "@gooddata/sdk-ui-theme-provider/node";

const pathToGeneratedScssFile = path.resolve("src/@ui/defaultTheme.scss");

generateDefaultScssThemeFile(pathToGeneratedScssFile);
