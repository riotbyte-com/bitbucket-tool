import { execSync } from 'node:child_process';

export const detectFromGitRemote = (): { workspace: string; repoSlug: string } | null => {
  try {
    const remoteUrl = execSync('git remote get-url origin', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();

    const httpsMatch = remoteUrl.match(/https:\/\/[^@]*@?bitbucket\.org\/([^/]+)\/([^/.]+)/);
    if (httpsMatch) {
      return { workspace: httpsMatch[1], repoSlug: httpsMatch[2] };
    }

    const sshMatch = remoteUrl.match(/git@bitbucket\.org:([^/]+)\/([^/.]+)/);
    if (sshMatch) {
      return { workspace: sshMatch[1], repoSlug: sshMatch[2] };
    }

    return null;
  } catch {
    return null;
  }
};

export const resolveWorkspaceAndRepo = (overrides?: {
  workspace?: string;
  repoSlug?: string;
}): { workspace: string; repoSlug: string } => {
  const workspace = overrides?.workspace ?? process.env.BITBUCKET_WORKSPACE;
  const repoSlug = overrides?.repoSlug ?? process.env.BITBUCKET_REPO;

  if (workspace && repoSlug) {
    return { workspace, repoSlug };
  }

  const detected = detectFromGitRemote();
  if (detected) {
    return {
      workspace: workspace ?? detected.workspace,
      repoSlug: repoSlug ?? detected.repoSlug,
    };
  }

  throw new Error(
    'workspace and repoSlug are required. Set BITBUCKET_WORKSPACE/BITBUCKET_REPO env vars or run from a git repo with a Bitbucket remote.'
  );
};
