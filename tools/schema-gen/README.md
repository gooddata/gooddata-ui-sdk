# JSON Schema Generator

This tool generates JSON Schemas for types defined in SDK packages: currently sdk-model and sdk-backend-spi. The
schemas are at the moment used for construction, handling and verification of mock data

Right now, the schema generator is not integrated into the build process. Run the generator after changing
the types in sdk-model and sdk-backend-spi projects.

Additionally, the generator does not yet have any CLI so just run the generateSchemas.ts program.

Note: the generator contains explicit ignores of particular types that make little sense when included in
JSON Schema (predicates, types for services and so on). While it is possible to ignore these using @ignore
directive in the TSDoc, I opted not to do so in order not to clobber those docs - it may look confusing to
have ignore annotations in public docs.
