import { z } from 'zod';
import type { PullrequestComment } from '../generated/bitbucket-client';

const AccountSchema = z.object({
  display_name: z.string().optional(),
});

const ContentSchema = z.object({
  raw: z.string().optional(),
  html: z.string().optional(),
  markup: z.string().optional(),
});

const InlineSchema = z.object({
  path: z.string(),
  to: z.number().optional(),
  from: z.number().optional(),
  start_to: z.number().optional(),
  start_from: z.number().optional(),
});

export const getCommentAuthor = (comment: PullrequestComment): string => {
  const user = AccountSchema.safeParse(comment.user);
  return user.success ? (user.data.display_name ?? 'Unknown') : 'Unknown';
};

export const getCommentDate = (comment: PullrequestComment): string => {
  const createdOn = z.string().safeParse(comment.created_on);
  return createdOn.success ? new Date(createdOn.data).toLocaleString() : 'Unknown date';
};

export const getCommentContent = (comment: PullrequestComment): string => {
  const content = ContentSchema.safeParse(comment.content);
  if (!content.success) {
    return '(no content)';
  }

  return content.data.raw ?? content.data.html ?? '(no content)';
};

export const getCommentInlineInfo = (comment: PullrequestComment): string => {
  const inline = InlineSchema.safeParse(comment.inline);
  if (!inline.success) {
    return '';
  }

  const line = inline.data.to ?? inline.data.from;
  return ` [Inline: ${inline.data.path}:${line}]`;
};
