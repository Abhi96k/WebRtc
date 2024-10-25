import { WebSocket, WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

let senderSocket: null | WebSocket = null;
let receiverSocket: null | WebSocket = null;

wss.on("connection", function connection(ws) {
  ws.on("error", console.error);

  ws.on("message", function message(data: any) {
    try {
      const message = JSON.parse(data);

      // Identify the sender or receiver
      if (message.type === "sender") {
        senderSocket = ws;
        console.log("Sender connected");
      } else if (message.type === "receiver") {
        receiverSocket = ws;
        console.log("Receiver connected");
      }

      // Handle offer creation
      else if (message.type === "createOffer") {
        if (ws !== senderSocket) return;
        console.log("Received offer from sender");
        receiverSocket?.send(
          JSON.stringify({
            type: "createOffer",
            sdp: message.sdp,
          })
        );
      }

      // Handle answer creation
      else if (message.type === "createAnswer") {
        if (ws !== receiverSocket) return;
        console.log("Received answer from receiver");
        senderSocket?.send(
          JSON.stringify({
            type: "createAnswer",
            sdp: message.sdp,
          })
        );
      }

      // Handle ICE candidate exchange
      else if (message.type === "iceCandidate") {
        console.log("Received ICE candidate");
        if (ws === senderSocket && receiverSocket) {
          receiverSocket.send(
            JSON.stringify({
              type: "iceCandidate",
              candidate: message.candidate,
            })
          );
        } else if (ws === receiverSocket && senderSocket) {
          senderSocket.send(
            JSON.stringify({
              type: "iceCandidate",
              candidate: message.candidate,
            })
          );
        }
      }

      // Unrecognized message type
      else {
        console.log("Unknown message type:", message.type);
      }
    } catch (error) {
      console.error("Failed to process message:", error);
    }
  });
});
