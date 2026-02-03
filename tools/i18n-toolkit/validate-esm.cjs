// (C) 2026 GoodData Corporation
try {
    require.resolve("@gooddata/i18n-toolkit");
    console.log("Package can be resolved successfully");
} catch (e) {
    console.error("Failed to resolve package:", e);
    process.exit(1);
}
