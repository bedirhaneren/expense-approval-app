import type { INestApplication } from '@nestjs/common';
import {
  DocumentBuilder,
  type OpenAPIObject,
  SwaggerModule,
} from '@nestjs/swagger';

export const API_DOCS_PATH = 'docs';

const DESCRIPTION = `
Masraf bildirim ve onay API'si.

**Akış:** Taslak → Yönetici Onayı Bekliyor → Muhasebe Onayı Bekliyor → Onaylandı
(yönetici veya muhasebe reddederse → Reddedildi).

**Kimlik doğrulama:** \`POST /auth/login\` ile alınan token, \`Authorization: Bearer <token>\` başlığıyla gönderilir.
Demo kullanıcılar: ali, veli (çalışan), ahmet (yönetici), ayse (muhasebe); şifre \`Demo123!\`.

**Görünürlük:** Her kullanıcı sadece kendi kapsamındaki masrafları görür. Kapsam dışındaki bir masraf,
varlığını sızdırmamak için 403 yerine **404** döner.
`.trim();

export function buildOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('Masraf Bildirim API')
    .setDescription(DESCRIPTION)
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  return SwaggerModule.createDocument(app, config);
}

/** Serves the interactive documentation at /docs. */
export function setupApiDocs(app: INestApplication): void {
  SwaggerModule.setup(API_DOCS_PATH, app, () => buildOpenApiDocument(app));
}
