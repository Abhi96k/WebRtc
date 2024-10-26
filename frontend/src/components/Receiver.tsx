import { useEffect, useRef, useState } from "react";

export const Receiver = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [pc, setPC] = useState<RTCPeerConnection | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    setSocket(socket);

    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          type: "receiver",
        })
      );
    };

    startReceiving(socket);

    return () => {
      socket.close();
    };
  }, []);

  const startReceiving = (socket: WebSocket) => {
    const peerConnection = new RTCPeerConnection();
    setPC(peerConnection);

    peerConnection.ontrack = (event) => {
      if (videoRef.current) {
        videoRef.current.srcObject = event.streams[0];
      }
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "createOffer") {
        peerConnection
          .setRemoteDescription(message.sdp)
          .then(() => peerConnection.createAnswer())
          .then((answer) => {
            return peerConnection.setLocalDescription(answer);
          })
          .then(() => {
            socket.send(
              JSON.stringify({
                type: "createAnswer",
                sdp: peerConnection.localDescription,
              })
            );
          });
      } else if (message.type === "iceCandidate") {
        peerConnection.addIceCandidate(message.candidate);
      }
    };
  };

  return (
    <div>
      <h1>Receiver</h1>
      <video ref={videoRef} autoPlay playsInline />
    </div>
  );
};
