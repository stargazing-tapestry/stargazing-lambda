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

    const publishMessage = (payload) => {
        const iotData = new AWS.IotData({endpoint: process.env.AWS_IOT_ENDPOINT});
        const params = {
            topic: 'test_topic',
            payload: payload
        };

        iotData.publish(params, responseCallback);
    };

    const parseInput = (stringInput) => {
        try {
            return JSON.parse(stringInput);
        } catch (e) {
            return null

        }
    };

    //Convert colour from html to rgb binanry
    const convertColour = (hexColor) => {
        const matched = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexColor);
        return matched ? [parseInt(matched[1], 16), parseInt(matched[2], 16), parseInt(matched[3], 16)] : null;
    };

    const publishLedCommand = (ledArray, colour) => {
        let result = [];
        ledArray.forEach(i => {
            result = result.concat(convertColour(colour), (i >> 8) & 0xff, i & 0xff)
        });
        console.log("found mapping", ledArray, result, colour);
        publishMessage(Buffer.from(result))
    };

    const input = parseInput(event.body);

    if (input) {
        const {constellation, colour} = input;

        if (constellation && colour) {
            const ledArray = mapping[constellation.toLowerCase()];
            if (ledArray) {
                publishLedCommand(ledArray, colour);
            } else {
                console.log("couldn't find mapping" , constellation);
                callback(null, acceptedResp)
            }
        } else {
            console.log("couldn't find constellation input", event.body);
            callback(null, acceptedResp)
        }
    } else {
        callback(null, {statusCode: 400})
    }

};

module.exports.listConstellations = (event, context, callback) => {
    const response = {
        statusCode: 200,
        body: JSON.stringify(Object.keys(mapping).filter(k => mapping[k].length > 0))
    };

    callback(null, response);
};
