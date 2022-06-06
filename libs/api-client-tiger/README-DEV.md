# GoodData Cloud and GoodData.CN REST API Client

Client is generated with [openapi-generator](https://github.com/OpenAPITools/openapi-generator) using [typescript-axios](https://github.com/OpenAPITools/openapi-generator/tree/master/modules/openapi-generator/src/main/resources/typescript-axios) module, according to GoodData Cloud and GoodData.CN [OpenAPI specification](https://github.com/OAI/OpenAPI-Specification).

## How to generate client

`BASE_URL=http://your-tiger-host/ npm run generate-client`

Or you can create a `.env` file with the following format

```
BASE_URL=http://your-tiger-host/
```

and then run `npm run generate-client`.

## License

(C) 2017-2022 GoodData Corporation

This project is under MIT License. See [LICENSE](https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/api-client-tiger/LICENSE).
