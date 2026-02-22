import { createPullRequest } from '@bitbucket-tool/core';
import { defineCommand, unwrapOrExit } from '../utils/command-builder';

export const registerPrCreateCommand = defineCommand({
  name: 'pr:create',
  description: 'Create a pull request',
  arguments: [
    { syntax: '<source>', description: 'Source branch name' },
    { syntax: '<title>', description: 'PR title' },
    { syntax: '[description]', description: 'PR description' },
  ],
  options: [
    {
      flag: '-d, --destination <branch>',
      description: 'Destination branch',
      default: 'main',
    },
  ],
  action: async ({ workspace, repoSlug, args, options }) => {
    const [source, title, description] = args;

    const pr = unwrapOrExit(
      await createPullRequest({
        workspace,
        repoSlug,
        sourceBranch: source,
        destinationBranch: options.destination,
        title,
        description,
      })
    );

    console.log(`\nPR created: #${pr.id}`);
    console.log(`Title: ${pr.title}`);
    console.log(`Branch: ${pr.source?.branch?.name} → ${pr.destination?.branch?.name}`);
    console.log(`URL: ${pr.links?.html?.href}\n`);
  },
});
