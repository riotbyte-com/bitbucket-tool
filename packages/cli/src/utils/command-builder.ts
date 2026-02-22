import {
  configureClient,
  type Result,
  resolveAuth,
  resolveWorkspaceAndRepo,
} from '@bitbucket-tool/core';
import type { Command } from 'commander';

interface ArgumentConfig {
  syntax: string;
  description: string;
  // biome-ignore lint/suspicious/noExplicitAny: parser can return any type based on command definition
  parser?: (value: string) => any;
}

interface OptionConfig {
  flag: string;
  description: string;
  // biome-ignore lint/suspicious/noExplicitAny: option defaults can be any type
  default?: any;
}

export interface CommandParams {
  workspace: string;
  repoSlug: string;
  // biome-ignore lint/suspicious/noExplicitAny: args are dynamically typed based on parser functions
  args: any[];
  // biome-ignore lint/suspicious/noExplicitAny: options are dynamically typed based on command definition
  options: Record<string, any>;
}

interface CommandConfig {
  name: string;
  description: string;
  alias?: string;
  arguments?: ArgumentConfig[];
  options?: OptionConfig[];
  action: (params: CommandParams) => Promise<void>;
}

export const unwrapOrExit = <T>(result: Result<T>): T => {
  if (!result.ok) {
    console.error(`Error: ${result.error.message}`);
    if (result.error.detail) {
      console.error(JSON.stringify(result.error.detail, null, 2));
    }
    process.exit(1);
  }
  return result.data;
};

const wrapAction = (handler: (params: CommandParams) => Promise<void>) => {
  // biome-ignore lint/suspicious/noExplicitAny: commander.js passes arguments dynamically
  return async (...rawArgs: any[]) => {
    try {
      const command = rawArgs[rawArgs.length - 1];
      const options = command.opts();
      const args = rawArgs.slice(0, -2);

      const { workspace, repoSlug } = resolveWorkspaceAndRepo({
        workspace: options.workspace,
        repoSlug: options.repo,
      });

      const auth = resolveAuth();
      await configureClient(auth);

      await handler({ workspace, repoSlug, args, options });
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  };
};

export const defineCommand = (config: CommandConfig) => {
  return (program: Command): Command => {
    const cmd = program.command(config.name).description(config.description);

    if (config.alias) {
      cmd.alias(config.alias);
    }

    config.arguments?.forEach((arg) => {
      cmd.argument(arg.syntax, arg.description, arg.parser);
    });

    config.options?.forEach((opt) => {
      if (opt.default !== undefined) {
        cmd.option(opt.flag, opt.description, opt.default);
      } else {
        cmd.option(opt.flag, opt.description);
      }
    });

    cmd.option('-w, --workspace <workspace>', 'Bitbucket workspace');
    cmd.option('-r, --repo <repo>', 'Repository slug');

    cmd.action(wrapAction(config.action));

    return cmd;
  };
};
