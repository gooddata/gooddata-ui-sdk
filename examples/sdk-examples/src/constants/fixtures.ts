// (C) 2007-2022 GoodData Corporation
const demoProject: { [domain: string]: string } = {
    "https://live-examples-proxy.herokuapp.com": "xms7ga4tf3g3nzucd8380o2bev8oeknp",
};

const backendUrl = BACKEND_URL;
const demoProjectId = demoProject[backendUrl];

if (!demoProjectId) {
    console.error(`[fixtures.js] ProjectId for backend "${backendUrl}" is not in `, demoProject);
}

// eslint-disable-next-line no-console
console.log("The /gdc proxy is connected to: ", backendUrl, " with workspace: ", demoProjectId);

// your workspace would be probably static (you may ignore the code above)
export const backendUrlForInfo = backendUrl;
export const workspace = demoProjectId;

export const MAPBOX_TOKEN: string = process.env.EXAMPLE_MAPBOX_ACCESS_TOKEN || BUILTIN_MAPBOX_TOKEN || "";
