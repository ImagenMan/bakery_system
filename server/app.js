const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const session = require("express-session");
const { requireAuth } = require("./middleware/auth");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const apiRoutes = require("./routes");
const authRoutes = require("./routes/auth");

app.use(express.json());

app.use(session({
    secret: "bakery-development-secret",
    resave: false,
    saveUninitialized: false
}));

app.use(express.static("public"));

app.use("/api/auth", authRoutes);
app.use("/api", requireAuth, apiRoutes);

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});

const PORT = 3000;

server.listen(PORT, () => {
    console.log(`Bakery Server running on port ${PORT}`);
});