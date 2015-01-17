rcshell
=======

rcshell is the remote control shell.  It runs commands in a separate PTY and reports back to you when they finish.

Example
-------

	var RCShell = require('rcshell'),
		shell= new RCShell();

	shell.run('ls', ['-al', '--color'], function(err, result) {
		// `err` if there is a problem spawning the process, otherwise
		// `result.code` will have the process's exit code.
	});

	shell.host.on('data', function(data) {
		// `data` that got printed to the terminal
		// this will include control sequences
	});