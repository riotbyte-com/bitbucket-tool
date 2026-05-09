# bitbucket-tool

Type-safe Bitbucket Cloud tooling: an MCP server for AI assistants and a CLI for humans.

## Packages

| Package | Description | npm |
|---------|-------------|-----|
| [`bitbucket-tool-mcp`](./packages/mcp-server) | MCP server (19 tools for PRs, pipelines, branches, commits) | `npx bitbucket-tool-mcp` |
| [`bitbucket-tool-cli`](./packages/cli) | CLI for common Bitbucket operations | `npx bitbucket-tool-cli` |
| `@bitbucket-tool/core` | Shared API client and service layer (internal) | -- |

## Quick Start

### MCP Server

Add to your Claude Desktop / Claude Code config:

```json
{
  "mcpServers": {
    "bitbucket": {
      "command": "npx",
      "args": ["-y", "bitbucket-tool-mcp"],
      "env": {
        "BITBUCKET_USERNAME": "your-atlassian-email",
        "BITBUCKET_TOKEN": "your-atlassian-api-token",
        "BITBUCKET_WORKSPACE": "your-workspace"
      }
    }
  }
}
```

If `cwd` points at a checkout with a Bitbucket git remote, the server auto-detects workspace and repo, so you can omit `BITBUCKET_WORKSPACE` and the per-tool `repo_slug` argument.

See [MCP server README](./packages/mcp-server/README.md) for full documentation.

### CLI

```bash
npx bitbucket-tool-cli pr:list --workspace my-ws --repo my-repo
```

## Development

```bash
npm install
npm run build
npm test

# Run MCP server locally
npm run dev:mcp

# Run CLI locally
npm run dev:cli -- pr:list --workspace my-ws --repo my-repo

# Interactive MCP testing
npx @modelcontextprotocol/inspector node packages/mcp-server/dist/index.js

# Lint / typecheck
npm run lint
npm run typecheck
```

## Project Structure

```
bitbucket-tool/
├── packages/
│   ├── core/           # Shared API client, services, auth, types
│   ├── cli/            # CLI (Commander)
│   └── mcp-server/     # MCP server (19 tools)
└── scripts/
    └── patch-spec.ts   # OpenAPI spec patching for codegen
```

## Authentication

Set one of:

- **Atlassian API token** (recommended): `BITBUCKET_USERNAME` (your Atlassian account email) + `BITBUCKET_TOKEN` (an [API token](https://id.atlassian.com/manage-profile/security/api-tokens) scoped for Bitbucket). Sent as HTTP Basic auth.
- **OAuth 2.0**: `BITBUCKET_OAUTH_CLIENT_ID` + `BITBUCKET_OAUTH_CLIENT_SECRET`. First run opens a browser to authorize; tokens are cached in `~/.bitbucket-oauth.json` and refreshed automatically.

Optionally set `BITBUCKET_WORKSPACE` and `BITBUCKET_REPO` as defaults. The CLI and MCP server also auto-detect both from the git remote of the working directory.

## License

MIT
