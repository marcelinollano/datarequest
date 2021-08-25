# Twilio

Manages Twilio requests and responses.

## Install

```
heroku apps:create service
heroku config:set SERVICE_URL=
heroku config:set SERVICE_TOKEN=
heroku config:set TWILIO_ACCOUNT_SID=
heroku config:set TWILIO_AUTH_TOKEN=
heroku config:set TWILIO_CALLER_ID=
git push heroku main
```

## Use

```bash
curl -X POST 'https://service.herokuapp.com?name=Name+Surname&phone=+34000000000&token='
```
