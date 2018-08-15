'use strict';
const AWS = require('aws-sdk');
const mapping = require('mapping_data');

module.exports.starGaze = (event, context, callback) => {
    const iotData = new AWS.IotData({endpoint: process.env.AWS_IOT_ENDPOINT});
    const params = {
        topic: 'test_topic',
        payload: '{"test": "test"}'
    };

    iotData.publish(params, (err, res) => {
        if (err) return context.fail(err);


        const response = {
            statusCode: 201
        };

        callback(null, response);
    });

};

module.exports.listConstellations = (event, context, callback) => {
    const response = {
        statusCode: 200,
        body: JSON.stringify(Object.keys(mapping))
    };

    callback(null, response);
};
