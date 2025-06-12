# GoodData Cloud and GoodData.CN REST API Client

Client is generated with [openapi-generator](https://github.com/OpenAPITools/openapi-generator) using [typescript-axios](https://github.com/OpenAPITools/openapi-generator/tree/master/modules/openapi-generator/src/main/resources/typescript-axios) module, according to GoodData Cloud and GoodData.CN [OpenAPI specification](https://github.com/OAI/OpenAPI-Specification).

It means the client is generated based on code on running backend api and stored and versioned in this repository.

## How to generate client

1. You need to install Java runtime environment (because openapi-generator is a java based tool).

2. The script expects env variable `BASE_URL`
   Usually you want to use staging: `BASE_URL=https://staging.dev-latest.stg11.panther.intgdc.com`
   Create a file named `.env` in this directory based on `.env.template` file.
   The script then loads variables from this file automatically.

3. run `npm run generate-client`.

4. run `rush build`

5. Sometimes you need to add missing exports to `/src/index.ts` and rerun `rush build`

## License

(C) 2017-2022 GoodData Corporation

This project is under MIT License. See [LICENSE](https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/api-client-tiger/LICENSE).
