# Data Request

Salesforce Functions sample project.

## Install

### Lightning

```sh
sfdx force:auth:web:login -a core
```

```sh
sfdx force:org:create -s -f config/project-scratch-def.json -a scratch
```

```sh
sfdx force:source:push -u scratch -f
```

```sh
sfdx force:user:permset:assign -n Functions -u scratch
```

```sh
sfdx force:data:tree:import --plan data/Contacts-plan.json
```

```sh
sfdx force:org:open -u scratch
```

### Function

```sh
sfdx login:functions
```

```sh
sfdx env:create:compute -o scratch -a compute
```

```sh
sfdx env:var:set SERVICE_URL=https://your-service.herokuapp.com
sfdx env:var:set SERVICE_TOKEN=XXXXXXXXXX
```

```sh
sfdx project:deploy:functions --connected-org=scratch
```

### Service

```sh
heroku login
```

```sh
heroku apps:create your-service
```

```sh
heroku config:set SERVICE_URL=https://your-service.herokuapp.com
heroku config:set SERVICE_TOKEN=XXXXXXXXXX
heroku config:set TWILIO_ACCOUNT_SID=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
heroku config:set TWILIO_AUTH_TOKEN=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
heroku config:set TWILIO_CALLER_ID=+1XXXXXXXXXX
```

```sh
git subtree push --prefix services/twilio heroku main
```
