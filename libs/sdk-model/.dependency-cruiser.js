// (C) 2026 GoodData Corporation

import {
    DefaultOptions,
    DefaultRules,
    DefaultSdkRules,
    PublicLibraryRules,
} from "../../common/config/dep-cruiser/default.config.js";

const PublisherVersionRules = [
    {
        name: "publisher-version-no-aliases",
        comment:
            "Versioned Publisher modules (src/publisher/v1/, v2/, ...) must import their own versioned " +
            "names, never the unversioned aliases. The aliases move to the newest version when it " +
            "becomes current, which would silently change the types a versioned module uses.",
        severity: "error",
        from: { path: "^src/publisher/v[0-9]+/" },
        to: { path: "^src/publisher/aliases\\.ts$" },
    },
    {
        name: "publisher-version-no-cross-version",
        comment:
            "Each Publisher content version is a full set of its own types. A versioned module " +
            "(src/publisher/v1/, v2/, ...) must not import from another version's folder.",
        severity: "error",
        from: { path: "^src/publisher/(v[0-9]+)/" },
        to: { path: "^src/publisher/v[0-9]+/", pathNot: "^src/publisher/$1/" },
    },
];

export default {
    forbidden: [...DefaultRules, ...DefaultSdkRules, ...PublicLibraryRules, ...PublisherVersionRules],
    options: DefaultOptions,
};
