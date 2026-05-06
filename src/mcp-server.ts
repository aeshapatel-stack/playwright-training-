import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { execSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

const PROJECT_ROOT = join(process.cwd());

const server = new Server(
  { name: "playwright-mcp-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "hello_world",
        description: "Returns a hello world message",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string", description: "Name to say hello to" },
          },
          required: ["name"],
        },
      },
      {
        name: "run_tests",
        description: "Run Playwright tests and return the output summary. Optionally filter by project or test name pattern.",
        inputSchema: {
          type: "object",
          properties: {
            project: {
              type: "string",
              description: "Test project to run: day1, day2, day4, api, ui-chromium, ui-firefox",
            },
            grep: {
              type: "string",
              description: "Only run tests whose title matches this pattern",
            },
          },
        },
      },
      {
        name: "get_last_report",
        description: "Get the status and list of failed tests from the last Playwright run",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "hello_world") {
    const n = String(args?.name ?? "World");
    return {
      content: [{ type: "text", text: `Hello, ${n}! This is the Playwright MCP server.` }],
    };
  }

  if (name === "run_tests") {
    let cmd = "npx playwright test --reporter=list";
    if (args?.project) cmd += ` --project=${String(args.project)}`;
    if (args?.grep)    cmd += ` -g "${String(args.grep)}"`;

    try {
      const output = execSync(cmd, {
        cwd: PROJECT_ROOT,
        encoding: "utf8",
        timeout: 120_000,
      });
      return { content: [{ type: "text", text: output }] };
    } catch (err: any) {
      // execSync throws when tests fail — stdout still has the summary
      const output = (err.stdout ?? "") + (err.stderr ?? "");
      return { content: [{ type: "text", text: output || err.message }] };
    }
  }

  if (name === "get_last_report") {
    const lastRunPath = join(PROJECT_ROOT, "test-results", ".last-run.json");
    if (!existsSync(lastRunPath)) {
      return {
        content: [{
          type: "text",
          text: "No results found. Run tests first with the run_tests tool.",
        }],
      };
    }

    const data = JSON.parse(readFileSync(lastRunPath, "utf8"));
    const failed: string[] = data.failedTests ?? [];
    const statusLine = data.status === "passed"
      ? "All tests passed"
      : `Tests failed (${failed.length} failure${failed.length !== 1 ? "s" : ""})`;

    const lines = [
      `Status : ${statusLine}`,
      `Last run: ${new Date(data.timestamp ?? 0).toLocaleString()}`,
    ];
    if (failed.length > 0) {
      lines.push("", "Failed tests:");
      failed.forEach(t => lines.push(`  - ${t}`));
    }

    return { content: [{ type: "text", text: lines.join("\n") }] };
  }

  throw new Error(`Tool not found: ${name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Playwright MCP server running on stdio");
}

main().catch((error) => {
  console.error("Error starting MCP server:", error);
  process.exit(1);
});
