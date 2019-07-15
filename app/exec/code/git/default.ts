import { PullRequest } from '../git/pullrequest';
import { TfCommand, CoreArguments } from "../../../lib/tfcommand";
import args = require("../../../lib/arguments");

export function getCommand(args: string[]): CodeBase<CodeArguments, void> {
	return new CodeBase(args);
}

export interface CodeArguments extends CoreArguments {
	source: args.StringArgument;
	target: args.StringArgument;
	title: args.StringArgument;
	repositoryname: args.StringArgument;
	pullrequestid: args.StringArgument;
	pullrequestname: args.StringArgument;
	requeststatus: args.StringArgument;
	top: args.IntArgument;
	deletesourcebranch: args.BooleanArgument;
	repositoryid: args.StringArgument;
	autocomplete: args.BooleanArgument;
	mergemethod: args.StringArgument;
}

export class CodeBase<TArguments extends CodeArguments, TResult> extends TfCommand<TArguments, TResult> {
	protected serverCommand = false;
	protected description = "Commands for managing source control.";

	protected setCommandArgs(): void {
		super.setCommandArgs();

		this.registerCommandArgument(["repositoryname"], "Repository name", null, args.StringArgument);
		this.registerCommandArgument(["repositoryid"], "Repository id", null, args.StringArgument);
		this.registerCommandArgument(["source"], "Repository source branch name", null, args.StringArgument);
		this.registerCommandArgument(["target"], "Repository target branch name", null, args.StringArgument, null);
		this.registerCommandArgument(["title"], "Title", null, args.StringArgument, null);
		this.registerCommandArgument(["pullrequestname"], "Pull request name", null, args.StringArgument, null);
		this.registerCommandArgument(["pullrequestid"], "Pull request id", null, args.StringArgument);
		this.registerCommandArgument(["top"], "Number of results to get", null, args.IntArgument, null);
		this.registerCommandArgument(["requeststatus"], "filter by status (Active, Abandoned, Completed, All)", null, args.StringArgument, null);
		this.registerCommandArgument(["deletesourcebranch"], "delete source branch", "delete source branch on successfull merge",args.BooleanArgument,null);
		this.registerCommandArgument(["autocomplete"], "Auto Complete", "Set auto completion for a new pull request.", args.BooleanArgument, null);
		this.registerCommandArgument(["mergemethod"], "Merge Method", "Set auto merge method for completing the pull request.", args.IntArgument, '1');
	}
	public exec(cmd?: any): Promise<any> {
		return this.getHelp(cmd);
	}
}