// (C) 2026 GoodData Corporation

/* eslint-disable no-console */

try {
    require.resolve("@gooddata/i18n-toolkit");
    console.log("Package can be resolved successfully");
} catch (e) {
    console.error("Failed to resolve package:", e);
    process.exit(1);
}
