import { PullRequest } from './pullrequest';
import { PullRequestAsyncStatus } from 'vso-node-api/interfaces/GitInterfaces';
import { success, warn } from '../../../lib/trace';
import { errLog } from '../../../lib/errorhandler';
import args = require('../../../lib/arguments');
import trace = require('../../../lib/trace');
import gi = require('vso-node-api/interfaces/GitInterfaces');
import git_Api = require('vso-node-api/GitApi');
import VSSInterfaces = require('vso-node-api/interfaces/common/VSSInterfaces');
import codedBase = require('./default');

export function getCommand(args: string[]): Abandon {
	return new Abandon(args);
}

export class Abandon extends codedBase.CodeBase<codedBase.CodeArguments, void> {
	protected serverCommand = true;
	protected description = "Abandon a pull request";
	protected getHelpArgs(): string[] {
		return ["project", "repositoryname", "pullrequestname", "pullrequestid"];
	}
	public async exec(): Promise<any> {
		var gitApi: git_Api.IGitApi = this.webApi.getGitApi();
		var project = await this.commandArgs.project.val();
		var repositoryName = await this.commandArgs.repositoryname.val();
		var pullRequestName = await this.commandArgs.pullrequestname.val();
		var pullRequestId;
		if (!pullRequestName) {
			pullRequestId = await this.commandArgs.pullrequestid.val();
		}
		var gitRepositories = await gitApi.getRepositories(project);
		var gitRepositorie;
		var myPullRequest

		gitRepositories.forEach(repo => {
			if (repo.name.toLowerCase() == repositoryName.toLowerCase()) {
				gitRepositorie = repo;
				return;
			};
		});
		var pullRequestes = await gitApi.getPullRequests(gitRepositorie.id, null);
		var myPullRequestId
		var count = 0;
		pullRequestes.forEach(request => {
			if (!pullRequestId) {
				if (request.title == pullRequestName) {
					myPullRequestId = request.pullRequestId;
					myPullRequest = request;
					count++;
				}
			}
			if (!pullRequestName) {
				if (request.pullRequestId == pullRequestId) {
					myPullRequestId = request.pullRequestId;
					myPullRequest = request;
					count++;
				}
			}
		})
		if (!myPullRequest) {
			errLog('No pull requests found')
			process.exit(1);
		}
		else if (count > 1) {
			errLog('More then one pullrequest was found, please use Pull Request Id')
			process.exit(1);
		}
		pullRequestId = myPullRequestId;
		var updatedPullRequest: GR = new GR;
		updatedPullRequest.status = 2 //abandoned;

		return await gitApi.updatePullRequest(updatedPullRequest, gitRepositorie.id, pullRequestId, project)
	};

	public friendlyOutput(data: gi.GitPullRequest): void {
		if (!data) {
			throw new Error("no pull requests supplied");
		}

		console.log(' ');
		success('Pull request abandoned');
		console.log('');
		trace.info('Title    : %s', data.title);
		trace.info('id       : %s', data.pullRequestId);

	}
};

class GR implements gi.GitPullRequest {
	_links: any;
	artifactId: string;
	autoCompleteSetBy: VSSInterfaces.IdentityRef;
	closedBy: VSSInterfaces.IdentityRef;
	closedDate: Date;
	codeReviewId: number;
	commits: gi.GitCommitRef[];
	completionOptions: CO = new CO;
	completionQueueTime: Date;
	createdBy: VSSInterfaces.IdentityRef;
	creationDate: Date;
	description: string;
	lastMergeCommit: gi.GitCommitRef;
	lastMergeSourceCommit: gi.GitCommitRef;
	lastMergeTargetCommit: gi.GitCommitRef;
	mergeId: string;
	mergeStatus: gi.PullRequestAsyncStatus;
	pullRequestId: number;
	remoteUrl: string;
	repository: gi.GitRepository;
	reviewers: gi.IdentityRefWithVote[];
	sourceRefName: string;
	status: gi.PullRequestStatus;
	supportsIterations: boolean;
	targetRefName: string;
	title: string;
	url: string;
	workItemRefs: VSSInterfaces.ResourceRef[];
}

class CO implements gi.GitPullRequestCompletionOptions {
	deleteSourceBranch: boolean;
	mergeCommitMessage: string;
	squashMerge: boolean;
}