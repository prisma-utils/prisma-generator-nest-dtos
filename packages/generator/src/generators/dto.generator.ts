import { DMMF } from '@prisma/generator-helper';
import { DecoratorHelper } from './../helper/decorator.helper';
import { GeneratorInterface } from '../interfaces/generator.interface';
import {
  dtoClassStub,
  dtoFieldStub,
  dtoFieldStubWithDefault,
} from '../stubs/dto.stub';
import { PrismaHelper } from './../helper/prisma.helper';

export class DtoGenerator {
  private fieldDecorators: DecoratorHelper[] = [];

  constructor(
    private config: GeneratorInterface,
    private model: DMMF.Model,
    private className: string,
  ) {}

  public async generateContent() {
    let content = dtoClassStub;

    content = content.replace(/#{NAME}/g, this.className);

    if (this.config.DTOParentClass) {
      content = content.replace(
        /#{PARENTCLASS}/g,
        `extends ${this.config.DTOParentClass}`,
      );
    } else {
      content = content.replace(/#{PARENTCLASS}/g, '');
    }

    let fieldsContent = '';

    for (const field of this.model.fields) {
      const fieldContent = await this.generateFieldContent(field);
      fieldsContent = fieldsContent + fieldContent;
    }

    content = content.replace(/#{FIELDS}/g, fieldsContent);

    content = content.replace(/#{IMPORTS}/g, this.generateImportStatements());

    return content;
  }

  async generateFieldContent(field: DMMF.Field) {
    let content = dtoFieldStub;

    if (field.default) {
      if (typeof field.default !== 'object') {
        content = dtoFieldStubWithDefault;

        let defaultValue = field.default;
        if (field.type === 'String') {
          defaultValue = `'${defaultValue}'`;
        }

        content = content.replace(/#{DEFAULT}/g, defaultValue + '');
      }
    }

    content = content.replace(/#{NAME}/g, field.name);
    content = content.replace(
      /#{TYPE}/g,
      PrismaHelper.getInstance().getPrimitiveMapTypeFromDMMF(field),
    );

    if (field.isRequired === false) {
      content = content.replace(/#{OP}/g, '?');
    }

    if (this.config.useStrict) {
      content = content.replace(/#{OP}/g, '!');
    } else {
      content = content.replace(/#{OP}/g, '');
    }

    const fieldDecorators =
      PrismaHelper.getInstance().generateSwaggerDecoratorsFromDMMF(field);

    // append the new decorators
    for (const fieldDecorator of fieldDecorators) {
      this.addDecoratorToImport(fieldDecorator);
    }

    const fieldDecoratorsContent = fieldDecorators
      .map((decorator) => {
        return decorator.generateContent();
      })
      .join(' ');
    content = content.replace(/#{DECORATORS}/g, fieldDecoratorsContent);

    return content;
  }

  private addDecoratorToImport(decorator: DecoratorHelper) {
    let found = false;

    for (const existingDecorator of this.fieldDecorators) {
      if (
        decorator.name === existingDecorator.name &&
        decorator.importFrom === existingDecorator.importFrom
      ) {
        found = true;
        break;
      }
    }

    if (found === false) {
      this.fieldDecorators.push(decorator);
    }
  }

  private generateImportStatements(): string {
    let result = '';

    for (const decorator of this.fieldDecorators) {
      result = `${result} import {${decorator.name}} from '${decorator.importFrom}';`;
    }

    return result;
  }
}
