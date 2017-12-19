const os = require('os');

async function log(ctx, next){
    const start = Date.now();
    await next();
    const end = new Date();
    const ms = end.getTime() - start;
    const time = end.toISOString();
    console.log(`${time} ${ctx.method} ${ctx.url} ${ctx.response.status} - ${ms} - ${ctx.ip} ${ctx.host}`);
}

async function health(ctx) {
    ctx.response.status = 200;
    let o = new Date().toISOString() + ' ' + os.hostname() + '\n';
    ctx.body = o;
}


module.exports = {
    log: log,
    health: health,
}

