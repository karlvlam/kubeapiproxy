const os = require('os');
const process = require('process');
const mw = require('./mw');
const util = require('./lib/util');
const log = util.log;
const koaBody = require('koa-body');
const Koa = require('koa');
const app = new Koa();
let router = require('koa-router')();
let rp = require('request-promise');
rp.options.simple = false;

const kube = require('./kube');

let permission = {};
let clusters = {};
try{
    permission = JSON.parse(process.env['KUBE_PERMISSION'])
    clusters = JSON.parse(process.env['KUBE_CLUSTERS'])
}catch(err){
    console.log('KUBE_PERMISSION, KUBE_CLUSTERS format error!');
    process.exit(1);
}

/* KUBE_PERMISSION
{ 
    'ApIKey1': {}, 
    'ApIKey2': {} 
}
*/


/*
 * KUBE_CLUSTERS
{
    'cluster1': { endpoint: 'http://127.0.0.1:8001' },
    'cluster2': { endpoint: 'http://127.0.0.1:8002' }
}
*/


let config = {
    clusters: clusters,
}


function getEnv(key, def=null){
    return (process.env[key] || def);
}

function getEnvInt(key, def=null){
    let r = parseInt(process.env[key]);
    if (r === 0){
        return 0;
    }
    return (r || def);
}

function setParam(name){
    return async function (id, ctx, next) {
        if (!ctx.param) {
            ctx.param = {};
        }
        ctx.param[name] = id;
        await next();
    }
}

router.get('/sys/health', mw.common.health);
router.param('cluster', setParam('cluster'));
router.param('workspace', setParam('workspace'));
router.param('resource', setParam('resource'));
router.param('id', setParam('id'));
router.get('/:cluster/:workspace/:resource/:id', checkApiKey, checkParam, handleGet);
router.patch('/:cluster/:workspace/:resource/:id', checkApiKey, checkParam, handlePatch);

// web framework starts
app.proxy = true;
app.use(mw.common.log);
app.use(koaBody());
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000);
log('kubeapiproxy: Listening on port 3000');


async function runCmd(ctx, action){
    let resource = ctx.param['resource'];
    let id = ctx.param['id'];
    let body = ctx.request.body;


    if (resource === 'deployment'){
        if (action === 'GET'){
            await kube.deployment.get(ctx, id);
            return;
        }
        if (action === 'PATCH', body['container'] && body['image']){
            await kube.deployment.updateImage(ctx, id);
            return;
        }
    }

    ctx.response.status = 501;
    return;

   
}

async function checkApiKey(ctx, next) {
    let header = ctx.request.header;
    let apikey = header['apikey'];
    log(JSON.stringify(header,null,2))
    if (!permission[apikey]){
        ctx.response.status = 403;
        return;
    }
    await next();
}
async function checkParam(ctx, next) {

    log('=== checkParam ===');
    log(ctx.param);
    let p = ctx.param;
    if (!clusters[p['cluster']]){
        ctx.response.status = 404;
        return;
    }
    ctx.opt = {};
    ctx.opt.endpoint = clusters[p['cluster']].endpoint;
    await next();
}

async function handleGet(ctx){
    await runCmd(ctx, 'GET');
}




async function handlePatch(ctx){
    await runCmd(ctx, 'PATCH');

}



function notFound(ctx){
    ctx.response.status = 404;
}




