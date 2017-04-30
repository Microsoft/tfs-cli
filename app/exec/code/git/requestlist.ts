import { PullRequestAsyncStatus } from 'vso-node-api/interfaces/GitInterfaces';
import { success, warn } from '../../../lib/trace';
import { errLog } from '../../../lib/errorhandler';
import args = require('../../../lib/arguments');
import trace = require('../../../lib/trace');
import gi = require('vso-node-api/interfaces/GitInterfaces');
import git_Api = require('vso-node-api/GitApi');
import VSSInterfaces = require('vso-node-api/interfaces/common/VSSInterfaces');
import codedBase = require('../default');

export function getCommand(args: string[]): RequestList {
	return new RequestList(args);
}

export class RequestList extends codedBase.CodeBase<codedBase.CodeArguments, void> {
	protected serverCommand = true;
	protected description = "Get a list of pull requests";

	protected getHelpArgs(): string[] {
		return ["project", "repositoryName"];
	}

	public async exec(): Promise<any> {
		//getting variables.
		var gitApi: git_Api.IGitApi = this.webApi.getGitApi();
		var project = await this.commandArgs.project.val();
		var repositoryName = await this.commandArgs.repositoryname.val();
		var gitRepositories = await gitApi.getRepositories(project);
		var gitRepositorie;
		gitRepositories.forEach(repo => {
			if (repo.name.toLowerCase() == repositoryName.toLowerCase()) {
				gitRepositorie = repo;
				return;
			};
		});
		var pullRequestes = await gitApi.getPullRequests(gitRepositorie.id, null);
		console.log(' ');
		success('Pull Requestes for '+repositoryName+':')
		//console.log(pullRequestes)
		pullRequestes.forEach(req => {
			var reviewerList = '';
			if (req.reviewers) {
				req.reviewers.forEach(reviewers => {
					reviewerList += reviewers.displayName + '; '
				});
			};
			trace.info('Title           : %s', req.title);
			trace.info('id              : %s', req.pullRequestId);
			trace.info('Created by      : %s', req.createdBy.displayName);
			trace.info('Created Date    : %s', req.creationDate.toString());
			trace.info('Merge Status    : %s', PullRequestAsyncStatus[req.mergeStatus]);
			trace.info('Reviewers       : %s', reviewerList);
			console.log(' ');
		});
		return new Promise<any>(() => {
			return pullRequestes;
		})
	};
};
