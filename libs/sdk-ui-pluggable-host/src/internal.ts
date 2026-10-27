// (C) 2026 GoodData Corporation

// oxlint-disable no-barrel-files/no-barrel-files

// The entry of the GoodData pluggable modules. It is not a public API: a module builds its own
// backend from the host's auth with the same factory the host uses, instead of a copy of it.

export {
    createBackendFactory,
    type IBackendFactory,
    type ICreateBackendOptions,
} from "./platformContext/backend.js";
