let io;



module.exports={
    init:httpServer=>{
        io=require('socket.io')(httpServer,{
             cors:{
   origin:'http://localhost:3000',
   method:["GET","POST","DELETE","PUT"]
  }
        })
        console.log('Socket.io is connected')
        return io;
    },
    getIO:()=>{
        if(!io){
            throw new Error("Socket.io not initialized")
        }
        return io;
    }
}