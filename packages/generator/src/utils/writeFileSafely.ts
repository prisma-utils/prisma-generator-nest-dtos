import fs from 'fs';
import path from 'path';
import { GeneratorInterface } from './../interfaces/generator.interface';
import { formatFile } from './formatFile';

export const writeFileSafely = async (
  config: GeneratorInterface,
  filePath: string,
  content: any,
) => {
  const formattedContent = await formatFile(content);

  if (config.dryRun === 'true') {
    console.log(formattedContent);
  } else {
    fs.mkdirSync(path.dirname(filePath), {
      recursive: true,
    });
    fs.writeFileSync(filePath, formattedContent);
  }
};
