/// <reference path="../../definitions/node/node.d.ts"/>
/// <reference path="../../definitions/colors/colors.d.ts"/>

import fs = require('fs');
import path = require('path');
import cm = require('./common');
import colors = require('colors');
var trace = require('../lib/trace');

export function load(execPath: string, cmds: string[], defaultCmd: string): any {
    trace('loader.load');   
    var module = null;

    var execCmds: string[] = null;
    try {
        execCmds = fs.readdirSync(execPath);
    }
    catch(err) {
        return module;
    }

    trace(execCmds);

    var match = this.match(execCmds, cmds) || defaultCmd;
    if (match) {
        var mp = path.join(execPath, match);
        module = require(mp);
        if (module) {
            trace('loaded ' + mp);    
        }
    }
    
    return { name: path.basename(match, '.js'), module: module };   
}

export function match(cmdList: string[], cmds: string[]): string {
    trace('loader.match');
    var candidates = [];

    for (var i = 0; i < cmds.length; i++) {
        var candidate = '';
        for (var j = 0; j <= i; j++) {
            if (j > 0) {
                candidate += '-';
            }

            candidate += cmds[j];
        }
        candidates.push(candidate);
    }

    // let's find the most specific command
    candidates = candidates.reverse();

    var match = null;
    candidates.some((candidate) => {
        var file = candidate + '.js';
        var i = cmdList.indexOf(file);
        if (i >= 0) {
            trace('Command matched');
            match = file;
            return true;
        }
    });
    
    trace('No command matched');
    return match;
}

export function getHelp(execPath: string, scope: string, all: boolean) {
    trace('loader.getHelp');
    var ssc = scope == '' ? 0 : scope.split('-').length;
    var execCmds = execCmds = fs.readdirSync(execPath);
    trace(execCmds);

    console.log();
    console.log(colors.magenta('                        fTfs         '));   
    console.log(colors.magenta('                      fSSSSSSSs      '));
    console.log(colors.magenta('                    fSSSSSSSSSS     '));
    console.log(colors.magenta('     TSSf         fSSSSSSSSSSSS      '));
    console.log(colors.magenta('     SSSSSF     fSSSSSSST SSSSS      '));
    console.log(colors.magenta('     SSfSSSSSsfSSSSSSSt   SSSSS      '));
    console.log(colors.magenta('     SS  tSSSSSSSSSs      SSSSS      '));
    console.log(colors.magenta('     SS   fSSSSSSST       SSSSS      '));
    console.log(colors.magenta('     SS fSSSSSFSSSSSSf    SSSSS      '));
    console.log(colors.magenta('     SSSSSST    FSSSSSSFt SSSSS      '));
    console.log(colors.magenta('     SSSSt        FSSSSSSSSSSSS      '));
    console.log(colors.magenta('                    FSSSSSSSSSS      '));
    console.log(colors.magenta('                       FSSSSSSs      '));
    console.log(colors.magenta('                        FSFs    (TM) '));
    console.log();
    console.log(colors.cyan('commands:'));

    execCmds.forEach((cmd) => {
        trace('cmd: ' + cmd);
        cmd = path.basename(cmd, '.js');
        //console.log('\n' + cmd);

        //var show = false;
        var cs = cmd.split('-');
        var csc = cs.length;
        //console.log(scope, ssc, csc, all);
        var show = cmd.indexOf(scope) == 0 && (ssc + 1 == csc || all);
        trace('show? ' + show);

        //console.log('show: ' + show);
        if (show) {
            var p = path.join(execPath, cmd);
            
            // If we're listing all cmds - just show the cmds that have implementations.
            // If not, we want to list the 'top level' no impl cmds
            var mod = require(p);
            var hasImplementation = mod.getCommand();
            trace('hasImplementation? ' + hasImplementation);
            if (!all || hasImplementation) {
                var cmdLabel = '';
                for (var i = 0; i < cs.length; ++i) {
                    if (i >= ssc) {
                        cmdLabel += cs[i];
                        if (i < cs.length - 1) {
                            cmdLabel += ' ';
                        }                        
                    }
                }

                var description = mod.describe ? mod.describe() : '';
                trace('description: ' + description);
                var listedArguments = '';
                if (hasImplementation && mod.getArguments) {
                    listedArguments = mod.getArguments();
                }
                trace(listedArguments);

                console.log(colors.yellow('   ' + cmdLabel));
                console.log(colors.white('\t' + description));
                if (hasImplementation) 
                    console.log('\t' + cmdLabel + listedArguments);

                console.log();
            }
        }
    })

    console.log();
}
