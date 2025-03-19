// (C) 2024 GoodData Corporation

module.exports = async (page, scenario, vp) => {
    // Backstop does not show error body, so complex log messages need to be serialized.
    // This does serialization of more complex message objects - e.g. errors.
    try {
        page.on("console", async (msg) => {
            const args = await msg.args();
            args.forEach(async (arg) => {
                const val = await arg.jsonValue();
                // value is serializable
                if (JSON.stringify(val) !== JSON.stringify({})) console.log(val);
                // value is unserializable (or an empty oject)
                else {
                    const { type, subtype, description } = arg._remoteObject;
                    console.log(`type: ${type}, subtype: ${subtype}, description:\n ${description}`);
                }
            });
        });
    } catch (e) {
        console.log("Message serialization was not successful", e);
    }

    // This was not used before. In case we need it in the future, uncomment it.
    // await require("./loadCookies")(page, scenario);
};
