import { useEffect, useRef, useState } from "react";

export const Sender = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [pc, setPC] = useState<RTCPeerConnection | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    setSocket(socket);

    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          type: "sender",
        })
      );
    };

    return () => {
      socket.close();
    };
  }, []);

  const initiateConn = async () => {
    if (!socket) {
      alert("Socket not found");
      return;
    }

    const peerConnection = new RTCPeerConnection();
    setPC(peerConnection);

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.send(
          JSON.stringify({
            type: "iceCandidate",
            candidate: event.candidate,
          })
        );
      }
    };

    peerConnection.onnegotiationneeded = async () => {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      socket.send(
        JSON.stringify({
          type: "createOffer",
          sdp: peerConnection.localDescription,
        })
      );
    };

    getCameraStreamAndSend(peerConnection);

    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "createAnswer") {
        await peerConnection.setRemoteDescription(message.sdp);
      } else if (message.type === "iceCandidate") {
        await peerConnection.addIceCandidate(message.candidate);
      }
    };
  };

  const getCameraStreamAndSend = (peerConnection: RTCPeerConnection) => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track);
      });
    });
  };

  return (
    <div>
      <h1>Sender</h1>
      <video ref={videoRef} autoPlay playsInline />
      <button onClick={initiateConn}>Send data</button>
    </div>
  );
};
