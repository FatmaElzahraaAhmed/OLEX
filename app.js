require("dotenv").config();
const express = require("express");
const path = require("path");
const connect = require("./DB/connection");
const userModel = require("./DB/model/user");
const app = express();
const port = process.env.PORT;
const allRoutes = require("./modules/index.router");
app.use(express.json());
connect();
const cronJobs = require("./service/cronJobs");
const { initIO } = require("./service/initSocket");
app.get("/", (req, res) => res.send("Hello World!"));
app.use("/api/v1/auth", allRoutes.authRouter);
app.use("/api/v1/user", allRoutes.userRouter);
app.use("/api/v1/product", allRoutes.productRouter);
app.use("/api/v1/comment", allRoutes.commentRouter);
app.use("/uploads", express.static(path.join(__dirname, "./uploads")));

const server = app.listen(port, () =>
  console.log("server is running on port " + port)
);
cronJobs();
const io = initIO(server);
io.on("connection",(socket)=>{
    socket.on("updateSocketId",async (data)=>{
        await userModel.findByIdAndUpdate(data,{socketID:socket.id})
    })
})
