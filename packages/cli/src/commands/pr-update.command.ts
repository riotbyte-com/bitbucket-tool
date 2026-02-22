import { declinePullRequest, type Pullrequest, updatePullRequest } from '@bitbucket-tool/core';
import { defineCommand, unwrapOrExit } from '../utils/command-builder';

export const registerPrUpdateCommand = defineCommand({
  name: 'pr:update',
  description: 'Update or close a pull request',
  arguments: [{ syntax: '<pr-id>', description: 'Pull request ID', parser: parseInt }],
  options: [
    {
      flag: '-t, --title <title>',
      description: 'Update PR title',
    },
    {
      flag: '-d, --description <description>',
      description: 'Update PR description',
    },
    {
      flag: '--destination <branch>',
      description: 'Update destination branch',
    },
    {
      flag: '--close',
      description: 'Close/decline the pull request',
    },
  ],
  action: async ({ workspace, repoSlug, args, options }) => {
    const [prId] = args;

    if (options.close) {
      unwrapOrExit(await declinePullRequest({ workspace, repoSlug, prId }));
      console.log(`\nPR #${prId} declined\n`);
      return;
    }

    const updates: Partial<Pick<Pullrequest, 'title' | 'description' | 'destination'>> = {
      ...(options.title !== undefined && { title: options.title }),
      ...(options.description !== undefined && { description: options.description }),
      ...(options.destination !== undefined && {
        destination: { branch: { name: options.destination } },
      }),
    };

    if (Object.keys(updates).length === 0) {
      console.error(
        'Error: No updates specified. Use --title, --description, --destination, or --close'
      );
      process.exit(1);
    }

    const pr = unwrapOrExit(await updatePullRequest({ workspace, repoSlug, prId, updates }));

    console.log(`\nPR #${prId} updated successfully`);
    console.log(`Title: ${pr.title}`);
    console.log(`Branch: ${pr.source?.branch?.name} → ${pr.destination?.branch?.name}`);
    console.log(`URL: ${pr.links?.html?.href}\n`);
  },
});
