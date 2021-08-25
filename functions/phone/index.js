/**
 * Calls a contact using Twilio to request mailing address information.
 *
 */

"use strict";

const serviceURL = process.env.SERVICE_URL;
const serviceToken = process.env.SERVICE_TOKEN;

const axios = require("axios");
const axiosRetry = require("axios-retry");

module.exports = async function (event, context, logger) {
  const data = event.data || {};
  logger.info(`\n\n==> Payload: ${JSON.stringify(data)}\n\n`);

  axiosRetry(axios, {
    retries: Infinity,
    retryCondition: (error) => {
      return error.response.status === 404;
    },
  });

  let sid = await axios({
    method: "post",
    url: serviceURL,
    params: {
      token: serviceToken,
      name: data["name"],
      phone: data["phone"],
    },
  })
    .then((response) => {
      return response["data"]["sid"];
    })
    .catch(function (error) {
      logger.error(error);
    });

  logger.info(`\n\n==> SID: ${sid}\n\n`);

  let text = await axios({
    method: "get",
    url: serviceURL,
    params: {
      token: serviceToken,
      sid: sid,
    },
  })
    .then((response) => {
      return response["data"]["text"];
    })
    .catch(function (error) {
      logger.error(error);
    });

  logger.info(`\n\n==> Address: ${text}\n\n`);

  const output = {};
  output["id"] = data["id"];
  output["address"] = text;

  logger.info(`\n\n==> Output: ${JSON.stringify(output)}\n\n`);
  return output;
};
