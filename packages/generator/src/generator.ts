import { generatorHandler, GeneratorOptions } from '@prisma/generator-helper';
import { logger } from '@prisma/sdk';
import path from 'path';
import { GENERATOR_NAME } from './constants';
import { DtoGenerator } from './generators/dto.generator';
import { GeneratorInterface } from './interfaces/generator.interface';
import { writeFileSafely } from './utils/writeFileSafely';

const { version } = require('../package.json');

const defaultOptions: GeneratorInterface = {
  useStrict: true,
  dryRun: false,

  DTOPath: 'data/dtos',
  DTOPrefixCreate: 'Create',
  DTOPrefixUpdate: 'Update',
  DTOSuffix: 'Dto',
  DTOParentClass: '',
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
    const config: GeneratorInterface = {
      ...defaultOptions,
      ...options.generator.config,
    };

    for (const model of options.dmmf.datamodel.models) {
      logger.info(`Processing Model ${model.name}`);

      const outputBasePath =
        options.generator.output?.value.replace(
          /#{MODEL}/g,
          model.name.toLowerCase(),
        ) + '';

      let className = `${config.DTOPrefixCreate}${model.name}${config.DTOSuffix}`;

      const dtoGenerator = new DtoGenerator(config, model, className);
      const dtoContent = await dtoGenerator.generateContent();

      const dtoFilePath = path.join(
        outputBasePath,
        config.DTOPath,
        `${config.DTOPrefixCreate.toLowerCase()}-${model.name.toLowerCase()}.${config.DTOSuffix.toLowerCase()}.ts`,
      );

      await writeFileSafely(config, dtoFilePath, dtoContent);
    }
  },
});
