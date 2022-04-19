import { DMMF } from '@prisma/generator-helper';
import { DecoratorHelper } from './../helper/decorator.helper';
import { GeneratorInterface } from '../interfaces/generator.interface';
import {
  dtoClassStub,
  dtoFieldStub,
  dtoFieldStubWithDefault,
} from '../stubs/dto.stub';
import { PrismaHelper } from './../helper/prisma.helper';
import path from 'path';
import { writeFileSafely } from './../utils/writeFileSafely';

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

  public async writeToFile(outputBasePath: string, content: string) {
    const dtoFilePath = path.join(
      outputBasePath,
      this.config.DTOPath,
      `${this.config.DTOPrefixCreate.toLowerCase()}-${this.model.name.toLowerCase()}.${this.config.DTOSuffix.toLowerCase()}.ts`,
    );

    await writeFileSafely(this.config, dtoFilePath, content);
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

    if (this.config.useStrict === 'true') {
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

    // and now we add some custom decorators based on documentation
    let documentation = field.documentation;
    let customDecoratorsContent: string = '';
    if (documentation) {
      // we need to process this properly
      const customDecorators = this.parseDocumentation(field);

      // this field has to be omitted
      for (const customDecorator of customDecorators) {
        // check, if this element is "Transient", so we skip everything
        if (customDecorator.name === 'Transient') {
          return '';
        }
      }

      for (const customDecorator of customDecorators) {
        customDecoratorsContent =
          customDecoratorsContent + customDecorator.generateContent();
        this.addDecoratorToImport(customDecorator);
      }
    }

    let fieldDecoratorsAndCustomDecoratorsContent: string = '';
    fieldDecoratorsAndCustomDecoratorsContent =
      fieldDecoratorsContent + customDecoratorsContent;

    content = content.replace(
      /#{DECORATORS}/g,
      fieldDecoratorsAndCustomDecoratorsContent,
    );

    return content;
  }

  private parseDocumentation(field: DMMF.Field): DecoratorHelper[] {
    let documentation = field.documentation || '';

    documentation = documentation.replace(/(\r\n|\n|\r)/gm, ' ');

    const customDecorators = documentation.split(' ');

    const result: DecoratorHelper[] = [];

    for (const customDecorator of customDecorators) {
      const decoratorParamsIndex = customDecorator.indexOf('(');
      const decoratorParams = customDecorator.substring(
        decoratorParamsIndex + 1,
        customDecorator.lastIndexOf(')'),
      );

      let decoratorName = customDecorator.substring(0, decoratorParamsIndex);
      if (decoratorName.startsWith('@')) {
        decoratorName = decoratorName.substring(1);
      }

      const decorator = new DecoratorHelper(
        decoratorName,
        this.config.DTOValidatorPackage,
        decoratorParams,
      );

      result.push(decorator);
    }

    return result;
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
