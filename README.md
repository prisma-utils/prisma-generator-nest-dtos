# prisma-generator-nest-dtos

> This generator was bootstraped using [create-prisma-generator](https://github.com/YassinEldeeb/create-prisma-generator)

# Installation

To use the generator, simply add the following snippet to your `schema.prisma` file:

```
generator nestDTOs {
  provider = "node @prisma-utils/prisma-generator-nest-dtos"
}
```

and run `npx prisma generate`.

## Configuration

The generator, in turn, offers a lot of configuration possibilities, that can be added to the `generator` block.

| Parameter                | Description                                                                                                                                                                                                                          | Default Value             |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------- |
| output                   | Base path, where the output should be generated to. This is relative to the `schema.prisma` file! You can use `#{MODEL}` as a variable to add the currently processed model to the path (i.e., `output = "./../generated/#{MODEL}`). | `../generated`            |
| dryRun                   | Whether the files should be written to disk or just outputted on the console                                                                                                                                                         | `false`                   |
| useStrict                | Whether properties (i.e., from DTOs) should have the _definite assignment assertion operator_ (i.e., `!`). This may be required in projects following the `strict` mode!                                                             | `false`                   |
| DTOPath                  | Path, where the DTOs should be written to. This is appended to the `output` path!                                                                                                                                                    | `data/dtos`               |
| DTOCreatePrefix          | The prefix for `CREATE` DTOs. This is used in the class and file name.                                                                                                                                                               | `Create`                  |
| DTOCreateParentClass     | A parent class, where the generated DTO extends from (optional).                                                                                                                                                                     | `undefined`               |
| DTOCreateParentClassPath | The import package (or path) where the parent class can be found (optional).                                                                                                                                                         | `undefined`               |
| DTOUpdatePrefix          | The prefix for `UPDATE` DTOs. This is used in the class and file name.                                                                                                                                                               | `Update`                  |
| DTOUpdateParentClass     | A parent class, where the generated DTO extends from (optional).                                                                                                                                                                     | `undefined`               |
| DTOUpdateParentClassPath | The import package (or path) where the parent class can be found (optional).                                                                                                                                                         | `undefined`               |
| DTOSuffix                | The suffix for the generated DTOs. Used in the class and file name.                                                                                                                                                                  | `DTO`.                    |
| DTOValidatorPackage      | The package with validation decorators (i.e., `@nestjs/class-validator` or `class-validator`)                                                                                                                                        | `@nestjs/class-validator` |
| CRUDServicePath          | Path, where the CRUD services should be written to. This is appended to the `output` path!                                                                                                                                           | `services`                |
| CRUDServiceSuffix        | The suffix for the generated CRUD services. Used in the class and file name.                                                                                                                                                         | `CrudService`             |
| CRUDStubFile             | File path that contains a stub for a new service class to be generated. Path must be relative to the `schema.prisma` file.                                                                                                           | `undefined`               |

### Attribute Decorators

| Decorator  | Description                       |
| ---------- | --------------------------------- |
| @Transient | Do not add this Field to the DTO. |
|            |                                   |
|            |                                   |
