const os = require('os');
const util = require('util');

function log(o){
    let d = new Date().toISOString();
    console.log('['+d+'] ' + o);
}

module.exports = {
    log: log,
    format: util.format,
}


