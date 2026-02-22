import {
  getCommentAuthor,
  getCommentContent,
  getCommentDate,
  getCommentInlineInfo,
  getPullRequestComments,
} from '@bitbucket-tool/core';
import { defineCommand, unwrapOrExit } from '../utils/command-builder';

export const registerPrCommentsCommand = defineCommand({
  name: 'pr:comments',
  description: 'Get all comments on a pull request',
  arguments: [{ syntax: '<pr-id>', description: 'Pull request ID', parser: parseInt }],
  action: async ({ workspace, repoSlug, args }) => {
    const [prId] = args;

    const comments = unwrapOrExit(await getPullRequestComments({ workspace, repoSlug, prId }));

    if (comments.length === 0) {
      console.log(`\nNo comments on PR #${prId}\n`);
      return;
    }

    console.log(`\nComments on PR #${prId} (${comments.length} total):\n`);

    comments.forEach((comment, index) => {
      const author = getCommentAuthor(comment);
      const date = getCommentDate(comment);
      const content = getCommentContent(comment);
      const inline = getCommentInlineInfo(comment);

      console.log(`${index + 1}. ${author} (${date})${inline}`);
      console.log(`   ${content}\n`);
    });
  },
});
