const express = require("express");
const { exec } = require("child_process");
const socketIO = require("socket.io");
const app = express();
const http = require("http");
const server = http.createServer(app);
const port = 5555;
const io = socketIO(server, {
  cors: {
    origin: "*",
  },
});

app.use(express.json({ limit: "50mb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "50mb",
  })
);

app.post("/events", (req, res) => {
  // 
  console.log("events");
  // console.log();
  req.query.to.split('|').forEach((element) => {
    console.log(element);
    io.to(element).emit("data", req.body);
  });
  console.log(req.body);
  res.status(200).json({
    status: true,
    response: req.body,
  });
});

app.post("/event", (req, res) => {
  io.to(req.query.to).emit("data", req.body);
  console.log("SETTTT");
  console.log(req.query.to);
  console.log(req.body);
  res.status(200).json({
    status: true,
    response: req.body,
  });
});

app.get("/", function (req, res) {
  res.send("Hello World");
});

app.post("/shell", function (req, res) {
  console.log(req.body.code);

  exec(req.body.code, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`Hasil: ${stdout}`);
  });

  res.status(200).json({
    status: true,
    response: req.body,
  });
});

io.on("connection", function (socket) {
  socket.on("client", function (msg) {
    console.log("client");
    socket.join(msg.keyclient);
    console.log(msg.keyclient);
  });
  socket.on("setdata", function (data) {
    console.log("setdata");
    console.log(data.to);
    if (data.to == "-") {
      io.emit("data", data);
    } else {
      io.to(data.to).emit("data", data);
    }
  });
  socket.on("offer", function (data) {
    console.log("offer");
    console.log(data.iduser);
    io.to(data.iduser).emit("msg_offer", data);
  });
  socket.on("candidate", function (data) {
    console.log("candidate");
    console.log(data.iduser);
    io.to(data.iduser).emit("msg_candidate", data);
  });
  socket.on("answer", function (data) {
    console.log("answer");
    console.log(data.iduser);

    io.to(data.iduser).emit("msg_answer", data);
  });
});

server.listen(port, function () {
  console.log("App running on *: " + port);
});
