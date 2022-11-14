"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("./routes"));
const sqlite_1 = require("sqlite");
const sqlite3_1 = __importDefault(require("sqlite3"));
const cors = require("cors");
const app = (0, express_1.default)();
/** Use CORS **/
app.use(cors({
    origin: 'http://localhost:8080'
}));
/** Parse the request */
app.use(express_1.default.urlencoded({ extended: false }));
/** Takes care of JSON data */
app.use(express_1.default.json());
// @ts-ignore
// @ts-ignore
/** RULES OF OUR API */
(0, sqlite_1.open)({
    filename: "/tmp/database.db",
    driver: sqlite3_1.default.Database
}).then((db) => __awaiter(void 0, void 0, void 0, function* () {
    // do your thing
}));
/** Routes */
app.use("/", routes_1.default);
/** Error handling */
app.use((req, res, next) => {
    const error = new Error("not found");
    return res.status(404).json({
        message: error.message
    });
});
/** Server */
const httpServer = http_1.default.createServer(app);
const PORT = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 9173;
httpServer.listen(PORT, () => console.log("The server is running on port " + `${PORT}`));
