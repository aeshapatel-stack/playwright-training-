import SwaggerParser from '@apidevtools/swagger-parser';
import fs from 'fs';
import path from 'path';

const SPEC_PATH  = path.resolve(__dirname, '../src/openapi.json');
const OUTPUT_DIR = path.resolve(__dirname, '../docs');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'api-reference.md');

// HTTP methods we care about — skip OpenAPI metadata keys like 'parameters', 'summary'
const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'];

async function swaggerToMd(): Promise<void> {
  // Parse and fully dereference all $ref pointers in the spec
  const api = await SwaggerParser.dereference(SPEC_PATH) as any;

  let md = '';

  // ── Title block ────────────────────────────────────────────────────────────
  md += `# API Reference — ${api.info.title}\n\n`;
  md += `> Version: **${api.info.version}**\n`;

  if (api.info.description) {
    md += `>\n> ${api.info.description.replace(/\n/g, '\n> ')}\n`;
  }

  // Base URL from first server entry
  if (api.servers?.length) {
    md += `\n**Base URL:** \`${api.servers[0].url}\`\n`;
  }

  md += '\n---\n\n';

  // ── Endpoints ──────────────────────────────────────────────────────────────
  for (const [route, methods] of Object.entries(api.paths || {})) {
    for (const [method, op] of Object.entries(methods as any)) {

      // Skip non-HTTP-method keys (e.g. 'parameters' at path level)
      if (!HTTP_METHODS.includes(method)) continue;

      const operation = op as any;

      // Heading: METHOD /path
      md += `## \`${method.toUpperCase()}\` ${route}\n\n`;

      // Summary and description
      if (operation.summary) {
        md += `**${operation.summary}**\n\n`;
      }
      if (operation.description) {
        md += `${operation.description}\n\n`;
      }

      // Auth requirement — check if security is defined on the operation or globally
      const requiresAuth =
        operation.security !== undefined
          ? operation.security.length > 0
          : api.security?.length > 0;
      md += `**Auth required:** ${requiresAuth ? '✅ Yes — `Authorization: Bearer <token>`' : '❌ No'}\n\n`;

      // Request body
      const requestBody = operation.requestBody?.content?.['application/json'];
      if (requestBody?.schema?.properties) {
        md += `### Request Body\n\n`;
        md += `| Field | Type | Required | Description |\n`;
        md += `|-------|------|----------|-------------|\n`;

        const required: string[] = requestBody.schema.required ?? [];
        for (const [field, def] of Object.entries(requestBody.schema.properties as any)) {
          const d       = def as any;
          const type    = d.type ?? (d.enum ? 'enum' : 'object');
          const isReq   = required.includes(field) ? '✅' : '—';
          const desc    = d.description ?? d.example !== undefined ? `e.g. \`${d.example}\`` : '';
          md += `| \`${field}\` | \`${type}\` | ${isReq} | ${desc} |\n`;
        }
        md += '\n';
      }

      // Response codes
      if (operation.responses) {
        md += `### Responses\n\n`;
        md += `| Status | Meaning |\n`;
        md += `|--------|---------|\n`;

        for (const [status, resp] of Object.entries(operation.responses as any)) {
          const description = (resp as any).description ?? '';
          const emoji = Number(status) < 300 ? '✅' : Number(status) < 500 ? '⚠️' : '❌';
          md += `| \`${status}\` | ${emoji} ${description} |\n`;
        }
        md += '\n';
      }

      md += '---\n\n';
    }
  }

  // ── Write output ───────────────────────────────────────────────────────────
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, md, 'utf8');
  console.log(`✅ docs/api-reference.md generated (${api.paths ? Object.keys(api.paths).length : 0} paths)`);
}

swaggerToMd().catch(err => {
  console.error('❌ Failed to generate docs:', err.message);
  process.exit(1);
});
