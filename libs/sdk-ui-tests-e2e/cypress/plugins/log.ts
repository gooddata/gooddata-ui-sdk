// (C) 2021 GoodData Corporation

export default ((on, _config) => {
    on("task", {
        log(message) {
            console.log(message);
            return null;
        },
    });
}) as Cypress.PluginConfig;
