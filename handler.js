'use strict';
var awsIot = require('aws-iot-device-sdk');

module.exports.starGaze = (event, context, callback) => {
    var device = awsIot.device({
        keyPath: './identity/testLedController.private.key',
        certPath: './identity/testLedController.cert.pem',
        caPath: './identity/root-CA.crt',
        clientId: 'sdk-nodejs-1143c487-5640-41b5-81c7-9c6316c8d274',
        region: "ap-southeast-2",
        host: 'a1gf6an104qasm.iot.ap-southeast-2.amazonaws.com',
        baseReconnectTimeMs: 4000,
        keepalive: 5,
        protocol: 'mqtts'
    });

    device.on('connect', function () {
        console.log('connect');
        device.publish("test_topic", '{"test": "test"}', function (err) {
            console.log('published message, with error:' + err);
            const response = {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'Go Serverless v1.0! Your function executed successfully!'
                }),
            };

            device.end();
            callback(null, response);
        });
    });



    // Use this code if you don't use the http event with the LAMBDA-PROXY integration
    // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};
