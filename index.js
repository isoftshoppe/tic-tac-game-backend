import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";

const PORT=5000;
const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

const rooms = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("createRoom", () => {
    const roomId = uuidv4().slice(0, 6);
    rooms[roomId] = {
      players: [],
      board: Array(9).fill(null),
      turn: "X"
    };
    socket.emit("roomCreated", roomId);
  });

  socket.on("joinRoom", (roomId) => {
    const room = rooms[roomId];

    if (!room) {
      socket.emit("errorMessage", "Room not found");
      return;
    }

    if (room.players.length >= 2) {
      socket.emit("errorMessage", "Room full");
      return;
    }

    const symbol = room.players.length === 0 ? "X" : "O";
    room.players.push({ id: socket.id, symbol });

    socket.join(roomId);
    socket.emit("playerAssigned", symbol);

    io.to(roomId).emit("updatePlayers", room.players);

    if (room.players.length === 2) {
      io.to(roomId).emit("startGame", room.board);
    }
  });

  socket.on("makeMove", ({ roomId, index }) => {
    const room = rooms[roomId];
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    if (room.board[index] || player.symbol !== room.turn) return;

    room.board[index] = player.symbol;
    room.turn = room.turn === "X" ? "O" : "X";

    io.to(roomId).emit("boardUpdated", room.board, room.turn);
  });

  socket.on("disconnect", () => {
    for (const roomId in rooms) {
      const room = rooms[roomId];
      room.players = room.players.filter(p => p.id !== socket.id);
      io.to(roomId).emit("playerLeft");

      if (room.players.length === 0) {
        delete rooms[roomId];
      }
    }
  });
});


app.get("/",(req,res)=>{
  res.json({
    message:"Server is Running"
  })
})


app.listen(PORT, () => console.log("Server running on port 5000"));