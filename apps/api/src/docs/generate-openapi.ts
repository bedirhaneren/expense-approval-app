import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { buildOpenApiDocument } from './api-docs.js';

/**
 * Writes the OpenAPI document to a file without starting the server or
 * connecting to the database (preview mode does not instantiate providers).
 * Run from the compiled output so the Swagger compiler plugin metadata exists.
 */
async function generate(outputPath: string): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    preview: true,
    logger: false,
  });
  const document = buildOpenApiDocument(app);
  await writeFile(outputPath, `${JSON.stringify(document, null, 2)}\n`);
  await app.close();
  console.log(`OpenAPI document written to ${outputPath}`);
}

await generate(resolve(process.argv[2] ?? 'openapi.json'));
