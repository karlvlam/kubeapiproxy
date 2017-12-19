const util = require('../../lib/util');
const log = util.log;
let rp = require('request-promise');


async function getDeployment(ctx, id){
    let option = ctx.opt;
    let param = ctx.param;

    try{
        let res = await getRawDeployment(option['endpoint'], param['workspace'], id);
        ctx.body = res;
    }catch(err){
        ctx.response.status = 500;
        ctx.body = err.toString();
        return;
    }

}

async function getRawDeployment(endpoint, workspace, id){
    let uri = util.format('%s/apis/apps/v1beta2/namespaces/%s/deployments/%s', endpoint, workspace, id) 
    let opt = {
        uri: uri 
    }
    return JSON.parse(await rp(opt));

}

async function doUpdateDeploymentImage(endpoint, workspace, id, name, image){

    let uri = util.format('%s/apis/apps/v1beta2/namespaces/%s/deployments/%s', endpoint, workspace, id);

    let body = {
        "spec": {
            "template":{
                "spec":{
                    "containers":[
                        {"name":name,"image":image}
                    ]
                }
            }
        }
    };

    let opt = {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/strategic-merge-patch+json'
        },
        uri: uri,
        body: JSON.stringify(body),

    }


    try{
        log('====================')
        return await rp(opt);
    }catch(err){
        throw err;
    }


}


async function updateDeploymentImage(ctx, id){
    let option = ctx.opt;
    let param = ctx.param;
    let body  = ctx.request.body;

    let containers = null;

    log(body);

    // check container name before update(patch)
    try{
        let res = await getRawDeployment(option['endpoint'], param['workspace'], id);
        containers = res.spec.template.spec.containers;
    }catch(err){
        ctx.response.status = 500;
        ctx.body = err.toString();
        return;
    }

    log('== ok ==');
    containers = containers.filter(function(o){ return o.name===body.container})
    if (containers.length !== 1){
        ctx.response.status = 400;
        ctx.body = 'Container name "'+body.container+'" does not exist!';
        return;
    }

    try{
        let res = await doUpdateDeploymentImage(option['endpoint'], param['workspace'], id, body.container, body.image);
        ctx.response.status = 200;
        ctx.body = res;
        return;
    }catch(err){
        ctx.response.status = 500;
        ctx.body = err.toString();
        return;
    }
    return;


}


module.exports = {
    get: getDeployment,
    updateImage: updateDeploymentImage, 
}

