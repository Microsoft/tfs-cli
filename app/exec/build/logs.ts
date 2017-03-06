import { TfCommand } from "../../lib/tfcommand";
import args = require("../../lib/arguments");
import buildBase = require("./default");
import buildClient = require("vso-node-api/BuildApi");
import buildContracts = require("vso-node-api/interfaces/BuildInterfaces");
import trace = require("../../lib/trace");
import fs = require("fs");

export function getCommand(args: string[]): BuildLogs {
	return new BuildLogs(args);
}

export class BuildLogs extends buildBase.BuildBase<buildBase.BuildArguments, buildContracts.Build> {
	protected description = "Print build logs.";
	protected serverCommand = true;

	protected getHelpArgs(): string[] {
		return ["project", "buildId"];
	}

	public exec(): Promise<buildContracts.Build> {
		trace.debug("build-logs.exec");
		var buildapi: buildClient.IBuildApi = this.webApi.getBuildApi();
		return this.commandArgs.project.val().then((project) => {
			return this.commandArgs.buildId.val().then((buildId) => {
				return buildapi.getBuild(buildId, project).then((build) => {
					return buildapi.getBuildLogsZip(build.project.name, build.id).then((stream) => {
						var archiveName = build.definition.name + "-" + build.buildNumber + "_" + build.id + ".zip";
						trace.info('Downloading ... ');
						trace.info('File: %s Created', archiveName);
						stream.pipe(fs.createWriteStream(archiveName));
						return build;
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
		trace.info("build id	: %s", build.id);
		trace.info("Logs location	: %s", build.logs.url);
	}
}