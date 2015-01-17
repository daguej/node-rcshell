var ipsee = require('ipsee'),
	pty = require('pty.js');

var id = 0;

function RCShell(opts, cb) {
	var self = this,
		instance = process.pid + '.' + id++;
	if (typeof opts == 'function') {
		cb = opts;
		opts = {};
	}
	opts = opts || {};
	this.running = false;
	this.ipc = ipsee('rcshell' + instance).subscribe();

	this.host = pty.spawn('node', [__dirname + '/host.js', instance], {
		name: opts.name || 'xterm-color',
		cols: opts.cols || 80,
		rows: opts.rows || 30,
		cwd: opts.cwd || process.cwd(),
		env: opts.env || process.env
	});

	this.host.on('exit', function() {
		self.close();
	});

	if (cb) {
		this.ipc.once('hostReady', cb);
	}
}

RCShell.prototype.close = function() {
	this.ipc.close();
	this.ipc = null;
	this.host.kill();
	this.host = null;
};


RCShell.prototype.run = function(cmd, args, options, cb) {
	if (this.running) {
		return cb(new Error('Another process is already running.'));
	}
	var self = this;
	this.running = true;
	this.ipc.send('run', {
		command: cmd,
		args: args,
		options: options
	});

	this.ipc.once('done', function(result) {
		self.running = false;
		if (cb) {
			cb(result.error, result.details);
		}
	});
};

RCShell.prototype.kill = function() {
	this.ipc.send('kill');
};

exports = module.exports = RCShell;