"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.singularTest = void 0;
const activation_functions_1 = require("./controllers/activation/activation_functions");
const tcpp = require("tcp-ping");
const signale = require("signale");
const singularTest = function (request, response) {
    const _param = request.body.telephone;
    (0, activation_functions_1.getSubscriberDetails)(_param).then((result) => {
        signale.info(JSON.stringify(result));
    });
};
exports.singularTest = singularTest;
function pingTest(_host) {
    let result1, result2;
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
    });
}
exports.default = { singularTest: exports.singularTest };
