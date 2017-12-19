# kubeapiproxy
- use at your own risk

### Usage 

#### Get deployment
```bash
curl -i \
 -H "apikey: 123456" \
 http://127.0.0.1:3000/abc/namespace/deployment/deployment-a
```

#### Update deployment image
```bash
curl -X PATCH \
 -H "apikey: 123456" \
 -d "container=my_container" \
 -d "image=node:7.4.0" \
 http://127.0.0.1:3000/abc/dev/deployment/my_deployment
```

### Setup 

```bash
export KUBE_PERMISSION='{"123456":{}}'
export KUBE_CLUSTERS='{"abc":{"endpoint":"http://127.0.0.1:8001"}}'
node index
```


