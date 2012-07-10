var fs = require('fs'),
    path = require('path'),

    exists = fs.exists || path.exists;

var results = {};

var walkFile = function(str, cb) {
    var data = [];
    str = str.split('\n');
    var item = {};
    str.forEach(function(line) {
        line = line.trim();
        var parts = line.split(':');
        switch (parts[0].toUpperCase()) {
            case 'TN':
                item.title = parts[1].trim();
                break;
            case 'SF':
                item.file = parts[1].trim();
                break;
            case 'FNF':
                item.functions.found = Number(parts[1].trim());
                break;
            case 'FNH':
                item.functions.hit = Number(parts[1].trim());
                break;
            case 'LF':
                item.lines.found = Number(parts[1].trim());
                break;
            case 'LH':
                item.lines.hit = Number(parts[1].trim());
                break;
            case 'DA':
                if (!item.lines) {
                    item.lines = {
                        found: 0,
                        hit: 0,
                        details: []
                    };
                }
                var lines = parts[1].split(',');
                item.lines.details.push({
                    line: Number(lines[0]),
                    hit: Number(lines[1])
                });
                break;
            case 'FN':
                if (!item.functions) {
                    item.functions = {
                        hit: 0,
                        found: 0,
                        details: []
                    };
                }
                var fn = parts[1].split(',');
                item.functions.details.push({
                    name: fn[1],
                    line: Number(fn[0])
                });
                break;
            case 'FNDA':
                var fn = parts[1].split(',');
                item.functions.details.some(function(i, k) {
                    if (i.name === fn[1] && i.hit === undefined) {
                        item.functions.details[k].hit = Number(fn[0]);
                        return true;
                    }
                });
                break;
        }

        if (line.indexOf('end_of_record') > -1) {
            data.push(item);
            item = {};
        }
    });
    cb(null, data);
};

var parse = function(file, cb) {
    
    exists(file, function(x) {
        if (!x) {
            cb("Failed to find file: " + file);
            return;
        }
        fs.readFile(file, 'utf8', function(err, str) {
            walkFile(str, cb);
        });
    });

};


module.exports = parse;
