import { GeneratorInterface } from './../interfaces/generator.interface';
import { DMMF } from '@prisma/generator-helper';
import { logger } from '@prisma/sdk';
import { crudServiceStub } from './../stubs/crud.service.stub';
import path from 'path';
import { writeFileSafely } from './../utils/writeFileSafely';

export class CrudServiceGenerator {
  constructor(
    private config: GeneratorInterface,
    private model: DMMF.Model,
    private className: string,
  ) {}

  public async generateContent() {
    let crudServiceContent: string;

    /* if (this.config.CRUDStubFile) {
      logger.info(`Loading Stubs from ${this.config.CRUDStubFile}`);
      const customStub = await fs.readFile(
        path.join(options.schemaPath, stubFile),
        { encoding: 'utf-8' },
      );
      crudServiceStubContent = customStub.toString();
    } else {
      crudServiceStubContent = defaultCrudServiceStub;
    } */

    crudServiceContent = crudServiceStub;

    crudServiceContent = crudServiceContent.replace(/#{NAME}/g, this.className);

    crudServiceContent = crudServiceContent.replace(
      /#{MODEL}/g,
      this.model.name,
    );
    crudServiceContent = crudServiceContent.replace(
      /#{model}/g,
      this.model.name.toLowerCase(),
    );

    return crudServiceContent;
  }

  public async writeToFile(outputBasePath: string, content: string) {
    const dtoFilePath = path.join(
      outputBasePath,
      this.config.CRUDServicePath,
      `${this.model.name.toLowerCase()}.crud.service.ts`,
    );

    await writeFileSafely(this.config, dtoFilePath, content);
  }
}
