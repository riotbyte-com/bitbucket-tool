# bitbucket-tool-mcp

MCP server for [Bitbucket Cloud](https://bitbucket.org). Gives AI assistants (Claude, Cursor, etc.) direct access to pull requests, pipelines, branches, commits, and code review workflows.

## Tools

| Tool | Description |
|------|-------------|
| `list_repositories` | List repositories in a workspace |
| `list_branches` | List branches in a repository |
| `get_branch` | Get branch details and latest commit |
| `create_branch` | Create a branch from a commit or branch |
| `delete_branch` | Delete a branch |
| `list_pull_requests` | List PRs, filterable by state |
| `get_pull_request` | Get PR details (title, branches, author, status) |
| `create_pull_request` | Create a new PR |
| `update_pull_request` | Update PR title, description, or destination |
| `decline_pull_request` | Decline (close) a PR |
| `get_pull_request_diff` | Get raw unified diff for a PR |
| `get_pull_request_comments` | Get all comments including inline code review |
| `add_pull_request_comment` | Add a comment to a PR |
| `list_pipelines` | List recent pipeline runs |
| `get_pipeline` | Get pipeline details and steps |
| `get_pipeline_step_log` | Get raw log output for a pipeline step |
| `trigger_pipeline` | Trigger a pipeline on a branch or tag |
| `list_commits` | List recent commits |
| `get_commit` | Get commit details |

## Installation

### Claude Desktop / Claude Code

Add to your MCP config (`~/.claude.json` or Claude Desktop settings):

```json
{
  "mcpServers": {
    "bitbucket": {
      "command": "npx",
      "args": ["-y", "bitbucket-tool-mcp"],
      "env": {
        "BITBUCKET_TOKEN": "your-api-token",
        "BITBUCKET_WORKSPACE": "your-workspace"
      }
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "bitbucket": {
      "command": "npx",
      "args": ["-y", "bitbucket-tool-mcp"],
      "env": {
        "BITBUCKET_TOKEN": "your-api-token",
        "BITBUCKET_WORKSPACE": "your-workspace"
      }
    }
  }
}
```

### Other MCP clients

Any MCP client that supports stdio transport works. Run the server directly:

```bash
BITBUCKET_TOKEN=your-token npx bitbucket-tool-mcp
```

## Authentication

### API Token (recommended)

Set `BITBUCKET_TOKEN` to a [Bitbucket API token](https://bitbucket.org/account/settings/app-passwords/) or [workspace access token](https://bitbucket.org/account/settings/). The token needs read/write access to repositories, pull requests, and pipelines depending on which tools you use.

```bash
export BITBUCKET_TOKEN="your-api-token"
```

### OAuth 2.0

For OAuth flows, set both client ID and secret. Create an OAuth consumer in your Bitbucket workspace settings under **OAuth consumers**.

```bash
export BITBUCKET_OAUTH_CLIENT_ID="your-client-id"
export BITBUCKET_OAUTH_CLIENT_SECRET="your-client-secret"
```

## Configuration

| Environment variable | Required | Description |
|---------------------|----------|-------------|
| `BITBUCKET_TOKEN` | Yes* | API token for Bearer auth |
| `BITBUCKET_OAUTH_CLIENT_ID` | Yes* | OAuth 2.0 client ID |
| `BITBUCKET_OAUTH_CLIENT_SECRET` | Yes* | OAuth 2.0 client secret |
| `BITBUCKET_WORKSPACE` | No | Default workspace (can also be passed per tool call) |

*One auth method required: either `BITBUCKET_TOKEN` or both OAuth variables.

## Local Development

```bash
git clone https://github.com/riotbyte-com/bitbucket-tool.git
cd bitbucket-tool
npm install
npm run build

# Run tests
npm test

# Run with MCP Inspector for interactive testing
npx @modelcontextprotocol/inspector node packages/mcp-server/dist/index.js
```

## License

MIT
