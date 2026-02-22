import { listPullRequests } from '@bitbucket-tool/core';
import { defineCommand, unwrapOrExit } from '../utils/command-builder';

export const registerPrListCommand = defineCommand({
  name: 'pr:list',
  alias: 'prs',
  description: 'List pull requests',
  options: [
    {
      flag: '-s, --state <state>',
      description: 'PR state (OPEN, MERGED, DECLINED, SUPERSEDED)',
      default: 'OPEN',
    },
  ],
  action: async ({ workspace, repoSlug, options }) => {
    const state = (options.state as string).toUpperCase() as
      | 'OPEN'
      | 'MERGED'
      | 'DECLINED'
      | 'SUPERSEDED';
    const prs = unwrapOrExit(await listPullRequests({ workspace, repoSlug, state }));

    if (prs.length === 0) {
      console.log(`No ${state} PRs found`);
      return;
    }

    console.log(`\n${state} PRs:\n`);
    prs.forEach((pr) => {
      console.log(`#${pr.id} - ${pr.title}`);
      console.log(`  ${pr.source?.branch?.name} → ${pr.destination?.branch?.name}`);
      console.log(`  ${pr.links?.html?.href}\n`);
    });
  },
});
