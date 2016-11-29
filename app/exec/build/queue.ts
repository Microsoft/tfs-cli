import { TfCommand } from "../../lib/tfcommand";
import args = require("../../lib/arguments");
import buildBase = require("./default");
import buildClient = require("vso-node-api/BuildApi");
import buildContracts = require("vso-node-api/interfaces/BuildInterfaces");
import trace = require("../../lib/trace");
import fs = require('fs');

export function describe(): string {
	return "queue a build";
}

export function getCommand(args: string[]): BuildQueue {
	return new BuildQueue(args);
}

export class BuildQueue extends buildBase.BuildBase<buildBase.BuildArguments, buildContracts.Build> {

	protected description = "Queue a build.";
	protected serverCommand = true;

	protected getHelpArgs(): string[] {
		return ["project", "definitionId", "definitionName", "parameters","priority","version","shelveset","demands"];
	}

	public exec(): Promise<buildContracts.Build> {
		var buildapi: buildClient.IBuildApi = this.webApi.getBuildApi();
        return this.commandArgs.project.val().then((project) => {
			return this.commandArgs.definitionId.val(true).then((definitionId) => {
				let definitionPromise: Promise<buildContracts.DefinitionReference>;
				if (definitionId) {
					definitionPromise = buildapi.getDefinition(definitionId, project);
				} else {
					definitionPromise = this.commandArgs.definitionName.val().then((definitionName) => {
						trace.debug("No definition id provided, Searching for definitions with name: " + definitionName);
						return buildapi.getDefinitions(project, definitionName).then((definitions: buildContracts.DefinitionReference[]) => {
							if(definitionName && definitions.length > 0) {
								var definition = definitions[0];
								return definition;
							}
							else {
								trace.debug("No definition found with name " + definitionName);
								throw new Error("No definition found with name " + definitionName);
							}
						});
					});
				}
				return definitionPromise.then((definition) => {
                    return this.commandArgs.parameters.val().then((parameters) => {
                        return this.commandArgs.priority.val(true).then((priority) =>{
                            trace.debug("build parameters file : %s",parameters ? parameters: "none");
                            trace.debug("build queue priority  : %s", priority ? priority: "3")
                            	return this.commandArgs.version.val().then((version) => {
									trace.debug("build source version: %s", version ? version: "Latest")
									return this.commandArgs.shelveset.val().then((shelveset) => {
                                        trace.debug("shelveset name: %s", shelveset ? shelveset: "none")
                                        return this.commandArgs.demands.val().then((demands) => {
											trace.debug("build demands	: %s", demands ? demands: "none")
                                            return this._queueBuild(buildapi, definition, project, parameters, priority, version, shelveset,demands ? demands:"");
                                    });
							     });
							});        
                        });
                    });
				});
			});
		});
	}

	public friendlyOutput(build: buildContracts.Build): void {
		if (!build) {
			throw new Error("no build supplied");
		}

		trace.println();
		trace.info("id              	: %s", build.id);
		trace.info("definition name 	: %s", build.definition ? build.definition.name : "unknown");
		trace.info("requested by    	: %s", build.requestedBy ? build.requestedBy.displayName : "unknown");
		trace.info("status          	: %s", buildContracts.BuildStatus[build.status]);
		trace.info("queue time      	: %s", build.queueTime ? build.queueTime.toJSON() : "unknown");
		trace.info("version				: %s", build.sourceVersion ? build.sourceVersion : "latest")
		trace.info("branch / shelveset 	: %s", build.sourceBranch ? build.sourceBranch :"master (no shelveset)")
	}

	private _queueBuild(buildapi: buildClient.IBuildApi,
						definition: buildContracts.DefinitionReference,
						project: string, parameters: string, 
						priority: number, 
						version: string, 
						shelveset: string, 
						demands :string) {
		trace.debug("Queueing build...")
		if (parameters){
			if (fs.existsSync(parameters)) {
				var parameters = fs.readFileSync(parameters,'utf8');
				trace.info("trying to get parameters from path: %s", parameters);	    
			}
			else {
				trace.info("failed to get parameters from path, assuming parameters are JSON string: %s", parameters);
			}
		}
		
		if (demands && demands.indexOf(";") >= 0) {
			var demandList: string[] = demands.split(";");
		}	
		var build = <buildContracts.Build> {
			definition: definition,
            priority: priority ? priority: 3,
            parameters: parameters,
			sourceVersion: version,
			sourceBranch: shelveset,
            demands: demandList ? demandList : [("%s",demands)]
            
		};
        return buildapi.queueBuild(build, project);       
	}
}