'use strict';
const AWS = require('aws-sdk');
const mapping = require('mapping_data');


module.exports.starGaze = async (event) => {
    console.log("couldn't find constellation input", event.body);

    const publishMessage = async (payload) => {
        const responseCallback = async (err) =>
            (new Promise((resolve, reject) => { return err ? reject(err) : resolve();}));

        const iotData = new AWS.IotData({endpoint: process.env.AWS_IOT_ENDPOINT});
        const params = {
            topic: 'test_topic',
            payload: payload
        };

        await iotData.publish(params, responseCallback);
    };

    //Convert colour from html to rgb binary
    const convertColour = (hexColor) => {
        const matched = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexColor);
        return matched ? [parseInt(matched[1], 16), parseInt(matched[2], 16), parseInt(matched[3], 16)] : null;
    };

    const publishLedCommand = async (ledArray, colour) => {
        const result = ledArray
            .map(i => [...convertColour(colour), (i >> 8) & 0xff, i & 0xff])
            .reduce((x, y) => x.concat(y), []);
        console.log("found mapping", ledArray, result, colour);
        await publishMessage(Buffer.from(result));
    };

    let input;

    try {
        input = JSON.parse(event.body);
    } catch (e) {
        return { statusCode: 400 };
    }

    const {constellation, colour} = input;

    if (constellation && colour) {
        const ledArray = mapping[constellation.toLowerCase()];
        if (ledArray) {
            await publishLedCommand(ledArray, colour)
        }
    }

    return { statusCode: 201 };

};

module.exports.listConstellations = async () => {
    return {
        statusCode: 200,
        body: JSON.stringify(Object.keys(mapping).filter(k => mapping[k].length > 0))
    };
};
