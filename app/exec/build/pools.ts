import { TfCommand } from "../../lib/tfcommand";
import args = require("../../lib/arguments");
import agentBase = require("./default");
import agentClient = require("vso-node-api/TaskAgentApiBase");
import taskAgentContracts = require("vso-node-api/interfaces/TaskAgentInterfaces");
import trace = require("../../lib/trace");
import taskAgentApi = require("vso-node-api/TaskAgentApi");
import Q = require('q');

export function getCommand(args: string[]): Pools {
	return new Pools(args);
}

export class Pools extends agentBase.BuildBase<agentBase.BuildArguments, taskAgentContracts.TaskAgent> {
	protected description = "Show agent pool list.";

	protected getHelpArgs(): string[] {
		return [];
	}

	public exec(): Q.Promise<taskAgentContracts.TaskAgentPool[]> {
		trace.debug("pool.exec");
		var agentapi: agentClient.ITaskAgentApiBase = this.webApi.getTaskAgentApi(this.connection.getCollectionUrl().substring(0,this.connection.getCollectionUrl().lastIndexOf("/")));
			return agentapi.getAgentPools();
	}
	
	public friendlyOutput(pools: taskAgentContracts.TaskAgentPool[]): void {
		if (!pools) {
			throw new Error("pool not supplied or not found");
		}
		trace.info("Pools on server:")
		trace.println();
		pools.forEach((pool) => {
			trace.info("	%s	:	%s ", pool.id, pool.name);
		});
	}
}
