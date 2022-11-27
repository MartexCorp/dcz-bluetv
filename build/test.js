"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.singularTest = void 0;
const tcpp = require("tcp-ping");
const singularTest = function (request, response) {
    let result1, result2;
    const _host = request.body.ip;
    // eslint-disable-next-line no-unused-vars
    tcpp.probe(_host, 8280, function (err, available) {
        const message1 = "Host " + _host + " is Availabale: " + available + "\n";
        console.log(message1);
        result1 = message1;
    });
    tcpp.ping({ address: _host, port: 8280 }, function (err, data) {
        console.log(data);
        // eslint-disable-next-line max-len
        const message2 = "Pinging " + data.address + " Port: " + data.port + " with " + data.attempts + " packets \n" + JSON.stringify(data.results);
        console.log(message2);
        result2 = message2;
        return response.json({ fOne: result1,
            fTwo: result2 });
    });
};
exports.singularTest = singularTest;
exports.default = { singularTest: exports.singularTest };
