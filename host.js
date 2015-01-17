var ipsee = require('ipsee')
	, ipc = ipsee('rcshell' + process.argv[2]).subscribe()
	, child_process = require('child_process');


var proc;

ipc.on('run', function(run) {
	run.options = run.options || {};
	run.options.stdio = 'inherit';

	console.log('$ ' + run.command + ' ' + run.args.join(' '));

	proc = child_process.spawn(run.command, run.args, run.options);

	proc.once('exit', function(code) {
		if (proc) {
			ipc.send('done', {
				details: {
					code: code
				}
			});
		}
		proc = null;
	});

	proc.once('error', function(err) {
		proc = null;
		ipc.send('done', {
			error: err
		});
	});
});

ipc.on('kill', function() {
	if (proc) {
		proc.kill();
	}
});



ipc.on('ready', function() {
	console.log('RCShell', process.argv[2], 'ready');
	setTimeout(function() {
		ipc.send('hostReady', Date.now());
	}, 1000);
});

ipc.on('close', function() {
	console.log('ipc closed');
});
