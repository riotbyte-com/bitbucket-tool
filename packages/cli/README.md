# bitbucket-tool-cli

CLI for [Bitbucket Cloud](https://bitbucket.org) pull request management.

## Installation

```bash
npx bitbucket-tool-cli pr:list --workspace my-ws --repo my-repo
```

Or install globally:

```bash
npm install -g bitbucket-tool-cli
```

## Commands

| Command | Description |
|---------|-------------|
| `pr:list` | List pull requests (alias: `prs`) |
| `pr:create <source> <title> [description]` | Create a pull request |
| `pr:update <pr-id>` | Update or close a pull request |
| `pr:comment <pr-id> <comment>` | Add a comment to a pull request |
| `pr:comments <pr-id>` | Get all comments on a pull request |

### pr:list

```bash
bitbucket-tool-cli pr:list --workspace my-ws --repo my-repo
bitbucket-tool-cli pr:list --state MERGED
```

Options:
- `-s, --state <state>` — Filter by state: `OPEN`, `MERGED`, `DECLINED`, `SUPERSEDED` (default: `OPEN`)

### pr:create

```bash
bitbucket-tool-cli pr:create feature/login "Add login page" "Implements OAuth login" \
  --workspace my-ws --repo my-repo
```

Options:
- `-d, --destination <branch>` — Destination branch (default: `main`)

### pr:update

```bash
bitbucket-tool-cli pr:update 42 --title "New title" --workspace my-ws --repo my-repo
bitbucket-tool-cli pr:update 42 --close
```

Options:
- `-t, --title <title>` — Update PR title
- `-d, --description <desc>` — Update PR description
- `--destination <branch>` — Update destination branch
- `--close` — Close/decline the pull request

### pr:comment

```bash
bitbucket-tool-cli pr:comment 42 "LGTM" --workspace my-ws --repo my-repo
```

### pr:comments

```bash
bitbucket-tool-cli pr:comments 42 --workspace my-ws --repo my-repo
```

## Authentication

Set one of:

- **API token**: `BITBUCKET_TOKEN` env var
- **OAuth 2.0**: `BITBUCKET_OAUTH_CLIENT_ID` + `BITBUCKET_OAUTH_CLIENT_SECRET`

Optionally set `BITBUCKET_WORKSPACE` as a default workspace.

## License

MIT
