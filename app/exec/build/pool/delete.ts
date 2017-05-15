import { TfCommand, CoreArguments } from "../../../lib/tfcommand";
import buildContracts = require('vso-node-api/interfaces/BuildInterfaces');
import args = require("../../../lib/arguments");
import trace = require('../../../lib/trace');
import fs = require('fs');
import taskAgentContracts = require("vso-node-api/interfaces/TaskAgentInterfaces");
import agentClient = require("vso-node-api/TaskAgentApiBase");
import VSSInterfaces = require('vso-node-api/interfaces/common/VSSInterfaces');

export function getCommand(args: string[]): CreatePool {
    return new CreatePool(args);
}

export interface DeletePoolArguments extends CoreArguments {
    name: args.StringArgument
}

export class CreatePool extends TfCommand<DeletePoolArguments, taskAgentContracts.TaskAgentPool> {
    protected serverCommand = true;
    protected description = "Delete a build agent pool";

    protected getHelpArgs(): string[] {
        return ["id"];
    }

    protected setCommandArgs(): void {
        super.setCommandArgs();

        this.registerCommandArgument("id", "id of the Build Agent Pool", "", args.StringArgument);
    }

    public exec(): Promise<taskAgentContracts.TaskAgentPool> {
        var api = this.webApi.getBuildApi();

        return Promise.all<number>([
            this.commandArgs.id.val(),
        ]).then((values) => {
            const [id] = values;
            var Id = id as number;

            
            var agentapi: agentClient.ITaskAgentApiBase = this.webApi.getTaskAgentApi(this.connection.getCollectionUrl().substring(0, this.connection.getCollectionUrl().lastIndexOf("/")));
            return agentapi.getAgentPool(Id).then((pool) => {
                trace.debug("found build agent pool %s...", pool.name);
                return agentapi.deleteAgentPool(pool.id).then((deletedpool) => {
                    return pool;
                });
            });
            
        });
    }

    public friendlyOutput(pool: taskAgentContracts.TaskAgentPool): void {
        trace.println();
        trace.info('id            : %s', pool.id);
        trace.info('name          : %s', pool.name);
    }
    
}

class AP implements taskAgentContracts.TaskAgentPool {
    id: number;
    name: string;
    scope: string;
    administratorsGroup: VSSInterfaces.IdentityRef;
    autoProvision: boolean;
    createdBy: VSSInterfaces.IdentityRef;
    createdOn: Date;
    groupScopeId: string;
    isHosted: boolean;
    properties: any;
    provisioned: boolean;
    serviceAccountsGroup: VSSInterfaces.IdentityRef;
    size: number;
}
