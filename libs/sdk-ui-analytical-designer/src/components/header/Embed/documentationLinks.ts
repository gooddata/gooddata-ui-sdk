// (C) 2007-2026 GoodData Corporation

const TIGER_LINK_INTEGRATION =
    "https://www.gooddata.com/docs/gooddata-ui/latest/learn/integrate_and_authenticate/cn_and_cloud_integration";

const TIGER_LINK_EMBED_ANALYTICAL_DESIGNER = "embed-visualizations/iframes/#embed-the-analytical-designer";

export const getEmbedAnalyticalDesignerLink = (documentationUrl: string) => {
    // tiger documentation has version as a part of link, try to create link from fake bootstrap data documentationUrl property
    // to avoid changes on multiple palaces
    return `${documentationUrl}${
        documentationUrl.endsWith("/") ? "" : "/"
    }${TIGER_LINK_EMBED_ANALYTICAL_DESIGNER}`;
};

export const getIntegrationLink = () => {
    return TIGER_LINK_INTEGRATION;
};
