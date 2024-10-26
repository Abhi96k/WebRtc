"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 8080 });
let senderSocket = null;
let receiverSocket = null;
wss.on("connection", function connection(ws) {
    ws.on("error", console.error);
    ws.on("message", function message(data) {
        const message = JSON.parse(data);
        if (message.type === "sender") {
            console.log("sender added");
            senderSocket = ws;
        }
        else if (message.type === "receiver") {
            console.log("receiver added");
            receiverSocket = ws;
        }
        else if (message.type === "createOffer") {
            if (ws !== senderSocket) {
                return;
            }
            console.log("sending offer");
            receiverSocket === null || receiverSocket === void 0 ? void 0 : receiverSocket.send(JSON.stringify({ type: "createOffer", sdp: message.sdp }));
        }
        else if (message.type === "createAnswer") {
            if (ws !== receiverSocket) {
                return;
            }
            console.log("sending answer");
            senderSocket === null || senderSocket === void 0 ? void 0 : senderSocket.send(JSON.stringify({ type: "createAnswer", sdp: message.sdp }));
        }
        else if (message.type === "iceCandidate") {
            console.log("sending ice candidate");
            if (ws === senderSocket) {
                receiverSocket === null || receiverSocket === void 0 ? void 0 : receiverSocket.send(JSON.stringify({ type: "iceCandidate", candidate: message.candidate }));
            }
            else if (ws === receiverSocket) {
                senderSocket === null || senderSocket === void 0 ? void 0 : senderSocket.send(JSON.stringify({ type: "iceCandidate", candidate: message.candidate }));
            }
        }
    });
});
