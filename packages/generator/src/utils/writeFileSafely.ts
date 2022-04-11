import fs from 'fs';
import path from 'path';
import { GeneratorInterface } from './../interfaces/generator.interface';
import { formatFile } from './formatFile';

export const writeFileSafely = async (
  config: GeneratorInterface,
  filePath: string,
  content: any,
) => {
  fs.mkdirSync(path.dirname(filePath), {
    recursive: true,
  });

  const formattedContent = content;
  // const formattedContent = await formatFile(content);

  if (config.dryRun) {
    console.log(formattedContent);
  } else {
    fs.writeFileSync(filePath, formattedContent);
  }
};
