#!/usr/bin/env node
import { Command } from 'commander';
import { registerPrCommentCommand } from '../commands/pr-comment.command';
import { registerPrCommentsCommand } from '../commands/pr-comments.command';
import { registerPrCreateCommand } from '../commands/pr-create.command';
import { registerPrListCommand } from '../commands/pr-list.command';
import { registerPrUpdateCommand } from '../commands/pr-update.command';

const program = new Command();

program.name('bb').description('Bitbucket CLI for pull request management').version('1.0.0');

registerPrListCommand(program);
registerPrCreateCommand(program);
registerPrUpdateCommand(program);
registerPrCommentCommand(program);
registerPrCommentsCommand(program);

program.parse();
