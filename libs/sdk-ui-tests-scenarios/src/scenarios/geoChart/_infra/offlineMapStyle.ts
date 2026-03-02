// (C) 2026 GoodData Corporation

import { type StyleSpecification } from "@gooddata/sdk-ui-geo";

// MapLibre style spec requires both {fontstack} and {range} tokens in glyph URL.
// The geo-assets folder currently contains only Open Sans Regular/0-255.pbf, which is enough for our test labels.
const GlyphsUrl = "/geo-assets/glyphs/{fontstack}/{range}.pbf";

export const OfflineMapStyle: StyleSpecification = {
    version: 8,
    name: "offline-minimal",
    glyphs: GlyphsUrl,
    sources: {},
    layers: [
        {
            id: "background",
            type: "background",
            paint: {
                "background-color": "#ffffff",
            },
        },
    ],
};
