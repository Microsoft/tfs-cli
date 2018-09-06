import { TfCommand } from "../../../lib/tfcommand";
import agentContracts = require("vso-node-api/interfaces/TaskAgentInterfaces");
import args = require("../../../lib/arguments");
import tasksBase = require("./default");
import trace = require("../../../lib/trace");

export function getCommand(args: string[]): BuildTaskDelete {
	return new BuildTaskDelete(args);
}

export class BuildTaskDelete extends tasksBase.BuildTaskBase<agentContracts.TaskDefinition> {
	protected description = "Delete a Build Task.";
	protected serverCommand = true;

	protected getHelpArgs(): string[] {
		return ["taskId"];
	}
	public exec(): Promise<agentContracts.TaskDefinition> {
		let agentApi = this.webApi.getTaskAgentApi(this.connection.getCollectionUrl());
		return this.commandArgs.taskId.val().then(taskId => {
			return agentApi.getTaskDefinitions(taskId).then(tasks => {
				if (tasks && tasks.length > 0) {
					trace.debug("Deleting task(s)...");
					return agentApi.deleteTaskDefinition(taskId).then(() => {
						return <agentContracts.TaskDefinition>{
							id: taskId,
						};
					});
				} else {
					trace.debug("No such task.");
					throw new Error("No task found with provided ID: " + taskId);
				}
			});
		});
	}

	public friendlyOutput(data: agentContracts.TaskDefinition): void {
		trace.println();
		trace.success("Task %s deleted successfully!", data.id);
	}
}
