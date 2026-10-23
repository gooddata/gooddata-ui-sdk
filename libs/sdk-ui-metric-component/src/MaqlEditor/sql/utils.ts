// (C) 2021-2026 GoodData Corporation

import { TextDocument } from "vscode-languageserver-textdocument";

import { type IReadOnlyModel, type Range } from "../monaco/MonacoEditor.js";

const MODEL_URI = "inmemory://model.sql";
export function createDocument(model: IReadOnlyModel, range?: Range): TextDocument {
    return TextDocument.create(
        MODEL_URI,
        model.getLanguageId(),
        model.getVersionId(),
        range ? model.getValueInRange(range) : model.getValue(),
    );
}
