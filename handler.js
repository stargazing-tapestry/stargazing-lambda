'use strict';
const AWS = require('aws-sdk');
const iotData = new AWS.IotData({endpoint: process.env.AWS_IOT_ENDPOINT});

module.exports.starGaze = (event, context, callback) => {
    const params = {
        topic: 'test_topic',
        payload: '{"test": "test"}'
    };

    iotData.publish(params, (err, res) => {
        if (err) return context.fail(err);

        console.log(res);
        const response = {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Go Serverless v1.0! Your function executed successfully!'
            }),
        };

        callback(null, response);
    });

};
