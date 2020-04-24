import args = require("../../../lib/arguments");
import buildBase = require("../default");

export interface TaskArguments extends buildBase.BuildArguments {
	all: args.BooleanArgument;
	taskId: args.StringArgument;
	taskPath: args.ExistingDirectoriesArgument;
	overwrite: args.BooleanArgument;
	taskName: args.StringArgument;
	friendlyName: args.StringArgument;
	description: args.StringArgument;
	author: args.StringArgument;
}

export function getCommand(args: string[]): BuildTaskBase<void> {
	return new BuildTaskBase<void>(args);
}

export class BuildTaskBase<T> extends buildBase.BuildBase<TaskArguments, T> {
	protected description = "Commands for managing Build Tasks.";
	protected serverCommand = false;

	protected setCommandArgs(): void {
		super.setCommandArgs();

		this.registerCommandArgument("all", "All Tasks?", "Get all build tasks.", args.BooleanArgument, "false");
		this.registerCommandArgument("taskId", "Task ID", "Identifies a particular Build Task.", args.StringArgument);
		this.registerCommandArgument("taskPath", "Task path", "Local path to a Build Task.", args.ExistingDirectoriesArgument, null);
		this.registerCommandArgument("taskZipPath", "Task zip path", "Local path to an already zipped task", args.StringArgument, null);
		this.registerCommandArgument("overwrite", "Overwrite?", "Overwrite existing Build Task.", args.BooleanArgument, "false");

		this.registerCommandArgument("taskName", "Task Name", "Name of the Build Task.", args.StringArgument);
		this.registerCommandArgument("friendlyName", "Friendly Task Name", null, args.StringArgument);
		this.registerCommandArgument("description", "Task Description", null, args.StringArgument);
		this.registerCommandArgument("author", "Task Author", null, args.StringArgument);
	}

	public exec(cmd?: any): Promise<any> {
		return this.getHelp(cmd);
	}
}
