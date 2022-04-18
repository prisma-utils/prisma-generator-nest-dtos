import { generatorHandler, GeneratorOptions } from '@prisma/generator-helper';
import { logger } from '@prisma/sdk';
import path from 'path';
import { GENERATOR_NAME } from './constants';
import { CrudServiceGenerator } from './generators/crud.service.generator';
import { DtoGenerator } from './generators/dto.generator';
import { GeneratorInterface } from './interfaces/generator.interface';
import { writeFileSafely } from './utils/writeFileSafely';

const { version } = require('../package.json');

const defaultOptions: GeneratorInterface = {
  useStrict: 'true',
  dryRun: 'false',

  schemaPath: '',

  DTOPath: 'data/dtos',
  DTOPrefixCreate: 'Create',
  DTOPrefixUpdate: 'Update',
  DTOSuffix: 'Dto',
  DTOParentClass: undefined,
  DTOValidatorPackage: '@nestjs/class-validator',

  CRUDServicePath: 'services',
  CRUDServiceSuffix: 'CrudService',
  CRUDStubFile: undefined,
};

generatorHandler({
  onManifest() {
    logger.info(`${GENERATOR_NAME}:Registered`);
    return {
      version,
      defaultOutput: '../generated',
      prettyName: GENERATOR_NAME,
    };
  },
  onGenerate: async (options: GeneratorOptions) => {
    const configOverwrites = {
      schemaPath: options.schemaPath,
    };

    const config: GeneratorInterface = {
      ...defaultOptions,
      ...options.generator.config,
      ...configOverwrites,
    };

    for (const model of options.dmmf.datamodel.models) {
      logger.info(`Processing Model ${model.name}`);

      const outputBasePath =
        options.generator.output?.value.replace(
          /#{MODEL}/g,
          model.name.toLowerCase(),
        ) + '';

      // ----------------------------------------
      // generate CRUD Service
      let crudServiceName = `${model.name}${config.CRUDServiceSuffix}`;
      const crudServiceGenerator = new CrudServiceGenerator(
        config,
        model,
        crudServiceName,
      );
      const crudServiceContent = await crudServiceGenerator.generateContent();
      await crudServiceGenerator.writeToFile(
        outputBasePath,
        crudServiceContent,
      );
      // ----------------------------------------

      // ----------------------------------------
      // generate DTOs
      let dtoClassName = `${config.DTOPrefixCreate}${model.name}${config.DTOSuffix}`;
      const dtoGenerator = new DtoGenerator(config, model, dtoClassName);
      const dtoContent = await dtoGenerator.generateContent();
      await dtoGenerator.writeToFile(outputBasePath, dtoContent);
      // ----------------------------------------
    }
  },
});
