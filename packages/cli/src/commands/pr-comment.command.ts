import { addComment } from '@bitbucket-tool/core';
import { defineCommand, unwrapOrExit } from '../utils/command-builder';

export const registerPrCommentCommand = defineCommand({
  name: 'pr:comment',
  description: 'Add a comment to a pull request',
  arguments: [
    { syntax: '<pr-id>', description: 'Pull request ID', parser: parseInt },
    { syntax: '<comment>', description: 'Comment text' },
  ],
  action: async ({ workspace, repoSlug, args }) => {
    const [prId, comment] = args;

    unwrapOrExit(await addComment({ workspace, repoSlug, prId, content: comment }));

    console.log(`\nComment added to PR #${prId}\n`);
  },
});
