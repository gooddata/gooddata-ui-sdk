// (C) 2019-2020 GoodData Corporation

import * as TJS from "typescript-json-schema";
import * as fs from "fs";

const _SETTINGS: TJS.PartialArgs = {
    required: true,
    excludePrivate: true,
    noExtraProps: true,
    topRef: true,
    ref: true,
};

const _COMPILER_OPTIONS: TJS.CompilerOptions = {
    strictNullChecks: true,
};

function isOurCode(symbol: TJS.SymbolRef): boolean {
    return symbol.fullyQualifiedName.search(".*gooddata-ui-sdk/libs/.*(src|dist)/") > -1;
}

type GeneratorInput = {
    /*
     * Files to include in schema generation. the root index or index.d.ts is usually enough
     */
    files: string[];

    /*
     * Specify type names that should not be exported. This is essential to get rid of non-generic variants
     * of generic types; when typescript-json-schema generator encounters for instance
     * interface IMeasure<T extends MeasureDefinition = MeasureDefinition> { ..., def: T, ... } it will generate
     * these schemas:
     *
     * - T: type object (possibly with no additional properties allowed)
     * - IMeasure, where def $refs T
     * - IMeasure<MeasureDefinition> where def is MeasureDefinition anyOf multiple alternatives
     *
     */
    ignoreTypes?: string[];
};

type GeneratorOutput = {
    /**
     * String to use for top-level schema $id; set this to schema file name right now
     */
    schemaId: string;

    /**
     * File where the schema should be written.
     */
    file: string;
};

function generateAndWrite(input: GeneratorInput, output: GeneratorOutput) {
    const program = TJS.getProgramFromFiles(input.files, _COMPILER_OPTIONS);

    console.log("Preparing schema generator (this may take a while)...");

    const effectiveSettings = {
        ..._SETTINGS,
        id: output.schemaId,
    };

    const generator = TJS.buildGenerator(program, effectiveSettings);

    if (!generator) {
        console.log("Schema generation failed. See previously emitted errors (if any)");

        return;
    }

    const ignoredTypes = input.ignoreTypes ? input.ignoreTypes : [];

    /*
     * When schema generator compiles the input files, it will also see all other types in the scope of the
     * project (such as types for browser APIs and so on)... and it will make those types available for
     * schema generation. getSymbols will return 4000+ definitions.
     *
     * So.. this code first filters out stuff that is not ours.. then filters out any other things it is told to
     * and that makes up the symbols to include in a schema.
     */
    const symbols = generator
        .getSymbols()
        .filter(isOurCode)
        .filter(s => ignoredTypes.indexOf(s.name) === -1);

    console.log(`Found ${symbols.length} types: ${symbols.map(s => s.name).join(", ")}`);

    const definition = generator.getSchemaForSymbols(
        symbols.map(s => s.name),
        true,
    );

    fs.writeFileSync(output.file, JSON.stringify(definition, null, 4), { encoding: "utf-8" });

    console.log(`Wrote ${output.file}`);
}

generateAndWrite(
    {
        files: ["../../../libs/sdk-model/dist/index.d.ts"],
        ignoreTypes: [
            // ignore stuff which does not make sense to include in schema
            "BucketPredicate",
            "AttributePredicate",
            "MeasurePredicate",
            // ignored to prevent bad schema defs for generic type
            "IMeasure",
        ],
    },
    {
        schemaId: "sdk-model.json",
        file: "../../../libs/sdk-model/schema/sdk-model.json",
    },
);

generateAndWrite(
    {
        files: ["../../../libs/sdk-backend-spi/dist/index.d.ts"],
        ignoreTypes: [
            // ignore stuff which does not make sense to include in schema
            "IAnalyticalBackend",
            "IAnalyticalWorkspace",
            "DataViewFacade",
            "AnalyticalBackendFactory",
            "IFeatureFlagsQuery",
            "IWorkspaceMetadata",
            "IWorkspaceStyling",
            "AnalyticalBackendError",
            "NotImplemented",
            "NotSupported",
            "DataViewError",
            "ExecutionError",
            "IElementQueryFactory",
            "IElementQuery",
            "IElementQueryResult",
            "Error",
            "BucketPredicate",
            "AttributePredicate",
            "MeasurePredicate",
            // ignored to prevent bad schema defs for generic type
            "IMeasure",
        ],
    },
    {
        schemaId: "sdk-backend-spi.json",
        file: "../../../libs/sdk-backend-spi/schema/sdk-backend-spi.json",
    },
);
