import inputs = require('./inputs');
import Q = require('q');
import am = require('./auth');
import url = require('url');
import apim = require('vso-node-api/WebApi');
import apibasem = require('vso-node-api/interfaces/common/VsoBaseInterfaces');
import cm = require('./diskcache');
import argm = require('./arguments');
var trace = require('./trace');

var cache = new cm.DiskCache('tfx');

export class TfsConnection {
    constructor(collectionUrl: string, credentials: am.ICredentials) {
        this.collectionUrl = collectionUrl;
        this.credentials = credentials;
        switch(credentials.type) {
            case "basic":
                trace('Using basic creds');
                var basicCreds: am.BasicCredentials = <am.BasicCredentials>credentials;
                this.authHandler = apim.getBasicHandler(basicCreds.username, basicCreds.password);
                break;
            case "pat":
                trace('Using PAT creds');
                var patCreds: am.PatCredentials = <am.PatCredentials>credentials;
                this.authHandler = apim.getBasicHandler("OAuth", patCreds.token);
                break;
        }

        var purl = url.parse(collectionUrl);
        if (!purl.protocol || !purl.host) {
            trace('Invalid collection url - protocol and host are required');
            throw new Error('Invalid collection url - protocol and host are required');
        }


        var splitPath: string[] = purl.path.split('/').slice(1);
        this.accountUrl = purl.protocol + '//' + purl.host;
        if(splitPath.length === 0 || (splitPath.length === 1 && splitPath[0] === '')) {
            trace('Invalid collection url - collection name is required. Eg: [accounturl]/[collectionname]');
            throw new Error('Invalid collection url - collection name is required. Eg: [accounturl]/[collectionname]');
        }
        if(splitPath.length === 2 && splitPath[0] === 'tfs') {
            //on prem
            this.accountUrl += '/' + 'tfs';
        }
        else if(splitPath.length > 1) {
            trace('Invalid collection url - path is too long. Collection url should take the form [accounturl]/[collectionname]');
            throw new Error('Invalid collection url - path is too long. Collection url should take the form [accounturl]/[collectionname]');
        }
    }

    public collectionUrl: string;
    public accountUrl: string;
    public credentials: am.ICredentials;
    public authHandler: apibasem.IRequestHandler;
}

export function getCollectionUrl(args: string[], options: any): Q.Promise<string> {
    trace('loader.getCollectionUrl');

    return this.getCommandLineUrl(args, options)
    .then((url: string) => {
        return url ? url : getCachedUrl();
    })
    .then((url: string) => {
        return url ? url : promptForUrl();
    });
}

export function getCommandLineUrl(args: string[], options: any): Q.Promise<string> {
    trace('loader.getCommandLineUrl');

    var credInputs = [ argm.COLLECTION_URL ];

    // Check to see if the collectionurl was optionally specified on the command line
    return inputs.Qcheck(args, options, [], credInputs).then((result) => {
        return result[argm.COLLECTION_URL.name];
    });
}

export function getCachedUrl(): Q.Promise<string> {
    trace('loader.getCachedUrl');
    var defer = Q.defer<string>();

    if (process.env['TFS_BYPASS_CACHE']) {
        trace('Skipping checking cache for collection url');
        defer.resolve('');
    }
    else {
         cache.getItem('cache', 'connection')
        .then(function(url) {
            trace('Retrieved collection url from cache');
            defer.resolve(url);
        })
        .fail((err) => {
            trace('No collection url found in cache');
            defer.resolve('');
        });
    }

    return <Q.Promise<string>>defer.promise;
}

export function promptForUrl(): Q.Promise<string> {
    trace('loader.promptForUrl');

    var credInputs = [ argm.COLLECTION_URL ];

    return inputs.Qprompt(credInputs, []).then((result) => {
        return result[argm.COLLECTION_URL.name];
    });
}