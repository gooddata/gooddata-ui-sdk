// (C) 2026 GoodData Corporation

import { resolve } from "node:path";

export interface GeneratorConfig {
    sdkLibsDir: string;
    sdkSrcLibsDir: string;
    outDir: string;
    refBase: string;
    docsBase: string;
    guideContentDir: string;
    referenceDirName: string;
    artifactVersion: string;
    gitCommit: string;
}

const REF_BASE_PLACEHOLDER = "__API_REF_BASE__";
const DOCS_BASE_PLACEHOLDER = "__DOCS_BASE__";

/**
 * Generator inputs. Defaults assume the script lives at sdk/docs/scripts inside
 * a gdc-ui checkout. OUT_DIR is required so the generator never writes into the
 * content tree by accident.
 */
export function resolveConfig(env: NodeJS.ProcessEnv, scriptsDir: string): GeneratorConfig {
    if (!env.OUT_DIR) throw new Error("OUT_DIR is required (artifact output directory)");
    const sdkDir = resolve(scriptsDir, "..", "..");
    const libs = env.SDK_LIBS_DIR ? resolve(env.SDK_LIBS_DIR) : resolve(sdkDir, "libs");
    return {
        sdkLibsDir: libs,
        sdkSrcLibsDir: env.SDK_SRC_LIBS_DIR ? resolve(env.SDK_SRC_LIBS_DIR) : libs,
        outDir: resolve(env.OUT_DIR),
        refBase: env.REF_BASE ?? REF_BASE_PLACEHOLDER,
        docsBase: env.DOCS_BASE ?? DOCS_BASE_PLACEHOLDER,
        guideContentDir: env.GUIDE_CONTENT_DIR
            ? resolve(env.GUIDE_CONTENT_DIR)
            : resolve(sdkDir, "docs", "content", "en", "latest"),
        referenceDirName: "api-reference",
        artifactVersion: env.ARTIFACT_VERSION ?? "Next",
        gitCommit: env.GITHUB_SHA ?? "unknown",
    };
}
