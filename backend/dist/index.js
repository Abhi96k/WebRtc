"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 8080 });
let senderSocket = null;
let receiverSocket = null;
wss.on('connection', function connection(ws) {
    ws.on('error', console.error);
    ws.on('message', function message(data) {
        try {
            const message = JSON.parse(data);
            // Identify the sender or receiver
            if (message.type === 'sender') {
                senderSocket = ws;
                console.log('Sender connected');
            }
            else if (message.type === 'receiver') {
                receiverSocket = ws;
                console.log('Receiver connected');
            }
            // Handle offer creation
            else if (message.type === 'createOffer') {
                if (ws !== senderSocket)
                    return;
                console.log('Received offer from sender');
                receiverSocket === null || receiverSocket === void 0 ? void 0 : receiverSocket.send(JSON.stringify({ type: 'createOffer', sdp: message.sdp }));
            }
            // Handle answer creation
            else if (message.type === 'createAnswer') {
                if (ws !== receiverSocket)
                    return;
                console.log('Received answer from receiver');
                senderSocket === null || senderSocket === void 0 ? void 0 : senderSocket.send(JSON.stringify({ type: 'createAnswer', sdp: message.sdp }));
            }
            // Handle ICE candidate exchange
            else if (message.type === 'iceCandidate') {
                console.log('Received ICE candidate');
                if (ws === senderSocket && receiverSocket) {
                    receiverSocket.send(JSON.stringify({ type: 'iceCandidate', candidate: message.candidate }));
                }
                else if (ws === receiverSocket && senderSocket) {
                    senderSocket.send(JSON.stringify({ type: 'iceCandidate', candidate: message.candidate }));
                }
            }
            // Unrecognized message type
            else {
                console.log('Unknown message type:', message.type);
            }
        }
        catch (error) {
            console.error('Failed to process message:', error);
        }
    });
});
