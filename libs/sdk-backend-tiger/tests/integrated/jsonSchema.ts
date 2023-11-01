// (C) 2022 GoodData Corporation

import Ajv from "ajv";
import { resolve } from "path";
import {
    SchemaGenerator,
    createProgram,
    createParser,
    createFormatter,
    Config,
    Schema,
} from "ts-json-schema-generator";

// TODO:
const BASE_PATH = "@gooddata/sdk-backend-spi/**/*.d.ts";

export function createSchema({ type, ...others }: Config): Schema {
    const config: Config = {
        path: resolve(BASE_PATH),
        tsconfig: resolve("./tsconfig.build.json"),
        type,
        ...others,
    };

    const program = createProgram(config);
    const generator = new SchemaGenerator(
        program,
        createParser(program, config),
        createFormatter(config),
        config,
    );
    return generator.createSchema(config.type);
}

export function validateData(assertData: any, config: Config) {
    const schema = createSchema(config);
    const ajv = new Ajv.default({ removeAdditional: true });
    const validate = ajv.compile(schema);
    return validate(assertData);
}
