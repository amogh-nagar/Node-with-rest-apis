const express = require("express");
const path = require("path");
const bodyparser = require("body-parser");
const multer=require('multer')
const app = express();
const mongoose = require("mongoose");

const feedroutes = require("./routes/feed");
const authroutes = require("./routes/auth");

const {v4:uuidv4}=require('uuid')

const fileStorage=multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null,'images')
  },
  filename:(req,file,cb)=>{
    cb(null,uuidv4() )
}
})


const fileFilter=(req,file,cb)=>{
  if(file.mimetype==='image/png'||file.mimetype==='image/jpg'||file.mimetype==='image/jpeg'){
    cb(null,true)
  }else{
    cb(null,false)
  }
}


app.use(multer({storage:fileStorage,fileFilter:fileFilter}).single('image'))
app.use(bodyparser.json()); //-> application/json
app.use("/images", express.static(path.join(__dirname, "images")));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});

app.use("/feed", feedroutes);
app.use("/auth", authroutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  data=error.data
  res.status(status).json({
    message: message,
data:data  });
});

mongoose
  .connect(
    "mongodb+srv://amogh:123amogh@cluster0.afnyt.mongodb.net/messages?retryWrites=true&w=majority"
  )
  .then((result) => {
    console.log("Connected!");
    const server=app.listen(8080);
const io=require('./socket').init(server)
io.on('connection',socket=>{
console.log('Client connected');
})//wioll be excuted for every new client that connects
  })
  .catch((err) => console.log(err));
