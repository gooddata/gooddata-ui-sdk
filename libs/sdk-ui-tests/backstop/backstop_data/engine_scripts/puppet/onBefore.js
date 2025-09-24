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

    // Patch querySelector to tolerate CSS4 :not() selector lists in older Chromium versions used by Backstop
    // This is needed for ag-Grid which uses selectors like :not(title, meta)
    try {
        await page.evaluateOnNewDocument(() => {
            const sanitizeSelector = (sel) => {
                if (typeof sel !== "string") return sel;
                
                // Only patch specific problematic selectors that ag-Grid uses
                // Preserve our own CSS selectors by being more selective
                const agGridProblematicSelectors = [
                    ':not(title, meta)',
                    ':not(script, style)',
                    ':not(link, meta)',
                ];
                
                // Check if this is one of the known problematic ag-Grid selectors
                for (const problematic of agGridProblematicSelectors) {
                    if (sel.includes(problematic)) {
                        // Replace only the specific problematic part
                        const match = problematic.match(/:not\(([^,]+)/);
                        const first = match && match[1];
                        if (first) {
                            return sel.replace(problematic, `:not(${first.trim()})`);
                        }
                    }
                }
                
                // Fallback: only patch :not() selectors that contain commas AND are likely from ag-Grid
                // (avoid patching our own CSS selectors that might use &.class syntax)
                if (sel.includes(':not(') && sel.includes(',') && !sel.includes('&.')) {
                    return sel.replace(/:not\(([^)]+)\)/g, (m, group) => {
                        if (group.indexOf(",") === -1) return m;
                        const first = group.split(",")[0].trim();
                        return `:not(${first})`;
                    });
                }
                
                return sel;
            };

            const patchProto = (proto) => {
                const origQS = proto.querySelector;
                const origQSA = proto.querySelectorAll;
                if (origQS) {
                    proto.querySelector = function (sel) {
                        try {
                            return origQS.call(this, sel);
                        } catch (e) {
                            const safe = sanitizeSelector(sel);
                            return origQS.call(this, safe);
                        }
                    };
                }
                if (origQSA) {
                    proto.querySelectorAll = function (sel) {
                        try {
                            return origQSA.call(this, sel);
                        } catch (e) {
                            const safe = sanitizeSelector(sel);
                            return origQSA.call(this, safe);
                        }
                    };
                }
            };

            patchProto(Document.prototype);
            patchProto(Element.prototype);
        });
    } catch (e) {
        console.log("Selector patching failed", e);
    }

    // This was not used before. In case we need it in the future, uncomment it.
    // await require("./loadCookies")(page, scenario);
};
