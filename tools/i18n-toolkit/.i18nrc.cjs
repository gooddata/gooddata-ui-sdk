module.exports = {
    paths: ["./src/fixtures/"],
    structure: true,
    intl: true,
    html: true,
    insightToReport: true,
    usage: true,
    debug: true,
    source: "src/**/*.{ts,js,tsx,jsx}",
    rules: [
        {
            pattern: [/^text\./, /^properly\./],
        },
    ],
};
