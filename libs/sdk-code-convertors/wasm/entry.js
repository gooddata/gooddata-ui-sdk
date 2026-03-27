// (C) 2026 GoodData Corporation

// WASM entry point: reads JSON from stdin, runs conversion, writes JSON to stdout
// Protocol: { "function": "yamlDatasetToDeclarative", "args": [...] }

import {
    buildAfmExecution,
    declarativeAttributeHierarchyToYaml,
    declarativeDashboardToYaml,
    declarativeDatasetToYaml,
    declarativeDateInstanceToYaml,
    declarativeMetricToYaml,
    declarativePluginToYaml,
    declarativeVisualisationToYaml,
    yamlAttributeHierarchyToDeclarative,
    yamlDashboardToDeclarative,
    yamlDatasetToDeclarative,
    yamlDateDatesetToDeclarative,
    yamlMetricToDeclarative,
    yamlPluginToDeclarative,
    yamlVisualisationToDeclarative,
} from "../esm/index.js";

const converters = {
    yamlDatasetToDeclarative,
    yamlDateDatesetToDeclarative,
    yamlMetricToDeclarative,
    yamlVisualisationToDeclarative,
    yamlDashboardToDeclarative,
    yamlPluginToDeclarative,
    yamlAttributeHierarchyToDeclarative,
    declarativeDatasetToYaml,
    declarativeDateInstanceToYaml,
    declarativeMetricToYaml,
    declarativeVisualisationToYaml,
    declarativeDashboardToYaml,
    declarativePluginToYaml,
    declarativeAttributeHierarchyToYaml,
    buildAfmExecution,
};

// Read all stdin
const chunks = [];
const buffer = new Uint8Array(4096);
while (true) {
    /* oxlint-disable-next-line eslint(no-undef) */
    const bytesRead = Javy.IO.readSync(0, buffer);
    if (bytesRead <= 0) break;
    chunks.push(buffer.slice(0, bytesRead));
}

const inputBytes = new Uint8Array(chunks.reduce((acc, c) => acc + c.length, 0));
let offset = 0;
for (const chunk of chunks) {
    inputBytes.set(chunk, offset);
    offset += chunk.length;
}

const input = JSON.parse(new TextDecoder().decode(inputBytes));

const fn = converters[input.function];
if (fn) {
    try {
        const result = fn(...(input.args || []));
        const output = JSON.stringify({ result });
        const outputBytes = new TextEncoder().encode(output);
        /* oxlint-disable-next-line eslint(no-undef) */
        Javy.IO.writeSync(1, outputBytes);
    } catch (e) {
        const error = JSON.stringify({ error: e.message, stack: e.stack });
        const errorBytes = new TextEncoder().encode(error);
        /* oxlint-disable-next-line eslint(no-undef) */
        Javy.IO.writeSync(1, errorBytes);
    }
} else {
    const error = JSON.stringify({
        error: `Unknown function: ${input.function}`,
        available: Object.keys(converters),
    });
    const errorBytes = new TextEncoder().encode(error);
    /* oxlint-disable-next-line eslint(no-undef) */
    Javy.IO.writeSync(1, errorBytes);
}
