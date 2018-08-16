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

    //Convert colour from html to rgb binanry
    const convertColour = function (htmlColour) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(htmlColour);
        return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null;
    }

    const input = parseInput(event.body)

    if (input) {
        const constellation = input['constellation']
        const colour = input['colour']

        if (constellation && colour) {
            const payload = mapping[constellation.toLowerCase()]
            if (payload) {
                let result = []
                let binaryColour = convertColour(colour)
                let binaryArray = payload.forEach(i => {
                    result = result.concat(binaryColour)
                    result.push((i >> 8) & 0xff)
                    result.push(i & 0xff)
                });
                console.log(result, binaryColour)
                console.log("found mapping" , payload)
                publishMessage(Buffer.from(result))
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
        body: JSON.stringify(Object.keys(mapping).filter(k => mapping[k].length > 0))
    };

    callback(null, response);
};
