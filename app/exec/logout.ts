import { TfCommand, CoreArguments } from "../lib/tfcommand";
import { DiskCache } from "../lib/diskcache";
import { EOL as eol } from "os";
import args = require("../lib/arguments");
import common = require("../lib/common");
import credStore = require("../lib/credstore");
import path = require("path");

import trace = require("../lib/trace");

export function getCommand(args: string[]): Reset {
	return new Reset(args);
}

export class Reset extends TfCommand<CoreArguments, void> {
	protected description = "Log out and clear cached credential.";
	protected getHelpArgs() {
		return [];
	}
	protected serverCommand = false;

	constructor(args: string[]) {
		super(args);
	}

	public async exec(): Promise<void> {
		return Promise.resolve<void>(null);
	}

	public dispose(): Promise<void> {
		let diskCache = new DiskCache("tfx");
		return diskCache.itemExists("cache", "connection").then(isCachedConnection => {
			if (isCachedConnection) {
				return diskCache
					.getItem("cache", "connection")
					.then(cachedConnection => {
						let store = credStore.getCredentialStore("tfx");
						return store.credentialExists(cachedConnection, "allusers").then(isCredential => {
							if (isCredential) {
								return store.clearCredential(cachedConnection, "allusers");
							} else {
								return Promise.resolve<void>(null);
							}
						});
					})
					.then(() => {
						return diskCache.deleteItem("cache", "connection");
					});
			} else {
				return Promise.resolve<void>(null);
			}
		});
	}

	public friendlyOutput(): void {
		trace.success("Successfully logged out.");
	}
}
