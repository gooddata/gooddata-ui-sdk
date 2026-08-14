// (C) 2026 GoodData Corporation

import { useEffect, useState } from "react";

import { type Extension } from "@codemirror/state";

import { type ConfigEditorLanguage } from "./configEditorLanguage.js";

/**
 * The grammars are loaded on demand and cached for the page's lifetime: importing them statically
 * would make every consumer carry both, and a single-language editor — the catalog's YAML-only
 * as-code dialogs, say — would ship a JSON grammar it can never display.
 */
const grammarLoaders: Record<ConfigEditorLanguage, () => Promise<Extension>> = {
    json: async () => (await import("@codemirror/lang-json")).json(),
    yaml: async () => (await import("@codemirror/lang-yaml")).yaml(),
};

const grammarCache = new Map<ConfigEditorLanguage, Extension>();

/**
 * Loads the grammar(s) `UiConfigEditor` needs for the given languages ahead of rendering one.
 *
 * Purely an optimization: the editor loads its grammar itself when it first renders, mounting
 * without highlighting for the moment that takes. Callers that know an editor is coming (and
 * tests that assert on a fully initialized editor synchronously) can await this instead.
 *
 * @internal
 */
export async function preloadUiConfigEditorGrammars(
    languages: ConfigEditorLanguage[] = ["json", "yaml"],
): Promise<void> {
    await Promise.all(
        languages.map(async (language) => {
            grammarCache.set(language, await grammarLoaders[language]());
        }),
    );
}

/** The grammar for `language`, loading it on first use; `undefined` until it has arrived. */
export function useLanguageGrammar(language: ConfigEditorLanguage): Extension | undefined {
    const [, setLoadedCount] = useState(0);

    useEffect(() => {
        if (grammarCache.has(language)) {
            return undefined;
        }
        let disposed = false;
        void grammarLoaders[language]()
            .then((grammar) => {
                grammarCache.set(language, grammar);
                if (!disposed) {
                    setLoadedCount((count) => count + 1);
                }
            })
            // A failed chunk load leaves the editor plain but working; nothing is cached, so the
            // next request for this language retries the import.
            .catch(() => {});
        return () => {
            disposed = true;
        };
    }, [language]);

    return grammarCache.get(language);
}
