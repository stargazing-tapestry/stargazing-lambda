'use strict';
const AWS = require('aws-sdk');
const mapping = require('mapping_data');


module.exports.starGaze = (event, context, callback) => {
    const acceptedResp = {
        statusCode: 201
    };

    const responseCallback = (err, res) => {
        if (err) return context.fail(err);
        callback(null, acceptedResp);
    };

    const publishMessage = function (payload) {
        const iotData = new AWS.IotData({endpoint: process.env.AWS_IOT_ENDPOINT});
        const params = {
            topic: 'test_topic',
            payload: payload
        };

        iotData.publish(params, responseCallback);
    };

    const parseInput = function (stringInput) {
        try {
            return JSON.parse(stringInput);
        } catch (e) {
            return null

        }
    };

    const input = parseInput(event.body)

    if (input) {
        const constellation = input['constellation']

        if (constellation) {
            const payload = mapping[constellation.toLowerCase()]
            if (payload) {
                console.log("found mapping" , payload)
                publishMessage(JSON.stringify(payload));
            } else {
                console.log("couldn't find mapping" , constellation)
                callback(null, acceptedResp)
            }
        } else {
            console.log("couldn't find constellation input", event.body)
            callback(null, acceptedResp)
        }
    } else {
        callback(null, {statusCode: 400})
    }

};

module.exports.listConstellations = (event, context, callback) => {
    const response = {
        statusCode: 200,
        body: JSON.stringify(Object.keys(mapping))
    };

    callback(null, response);
};
