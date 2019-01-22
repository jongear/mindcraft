import io from "socket.io-client";

const socket = io("http://localhost:3005");

console.log("hello world from socket");

socket.on("connect", () => {
  console.log("connected");
});

socket.on("news", data => {
  console.log("news", data);
});

export default socket;
