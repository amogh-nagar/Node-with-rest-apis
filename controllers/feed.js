const { validationResult } = require("express-validator/check");
const fs=require('fs')
const path=require('path')
const Post = require("../models/post");
const User=require('../models/user')
const io=require('../socket')


exports.getPosts = async (req, res, next) => {
console.log('Inside get')
const currentPage=+req.query.page||1;
const perPage=2;

try{
const totalitems=await Post.find().countDocuments()

  const posts=await Post.find().populate('creator').sort({createAt:-1}).skip((currentPage-1)*perPage).limit(perPage);
    
      res.status(200).json({
        message: "Posts fetched successfully",
        posts: posts,
        page:currentPage,
        totalitems:totalitems
      });
}catch(err){

      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
}
  
};

exports.createPost =async (req, res, next) => {
  //create post
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect");
    error.statusCode = 422;
    throw error;
  }
if(!req.file){
  const error=new Error('No image provided')
  error.statusCode=422;
  throw error;
}
console.log(req.file);
const imageUrl=req.file.path.replace("\\",'/');
  const title = req.body.title;
  const content = req.body.content;

  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: req.userId,
  });
  console.log('Post is',post)
  let creator;
  try{
 const user=await User.findById(req.userId);
    
      creator=user;
      user.posts.push(post)
      console.log('This are posts')
      console.log(user.posts)
  await user.save()
    
    
      await post.save();
    io.getIO().emit('posts',{action:'create',post:{...post._doc,creator:{_id:req.userId,name:user.name}}})
    res.status(201).json({
        message: "Post created successfully",
        post: post,
        creator:{
          _id:creator._id,
          name:creator.name}
      });
    }
catch(err){
  if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
}



  // post
  //   .save()
  //   .then((result) => {
  //     console.log(result);
      
  //     return   User.findById(req.userId)
     
      
  //   }).then(user=>{
  //     creator=user;
  //     user.posts.push(post)
  //     console.log('This are psosts')
  //     console.log(user.posts)
  //     return user.save()
  //   })
    
    // .then(result=>{
    //   post.creator.name=creator.name;
    //   return post.save()
    // })
    // .then(result=>{
      
      
    // })
};

exports.getPost =async (req, res, next) => {
  const postId = req.params.postId;
try{
const post=await  Post.findById(postId)
    
      if (!post) {
        const error = new Error("Could not find post");
        error.statusCode = 404;
        throw error;
      }

      res.status(200).json({
        message: "Post fetched",
        post: post,
      });
}
    catch(err)  {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    };
};





exports.updatePost=async (req,res,next)=>{
  
  
  const postId=req.params.postId;
  
    const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect");
    error.statusCode = 422;
    throw error;
  }
  const title=req.body.title;
  const content=req.body.content;
  let imageUrl=req.body.image;
  if(req.file){
    imageUrl=req.file.path.replace('\\','/');
  }
  if(imageUrl==='undefined'){
    console.log(imageUrl);
    const error=new Error('No file picked.')
    error.statusCode=422;
    throw error;
  }
 try{
  const post=await Post.findById(postId).populate('creator')
  if(!post){
        const error = new Error("Could not find post");
        error.statusCode = 404;
        throw error;
    
  }
  if(post.creator._id.toString()!==req.userId){
    const error=new Error('Not authorized')
    error.statusCode=403;
    throw error;
  }
  if(imageUrl!==post.imageUrl){
    clearImage(post.imageUrl)
  }
  post.title=title;
  post.imageUrl=imageUrl;
  post.content=content;
const result=await post.save()
io.getIO().emit('posts',{action:'update',post:result})
  res.status(200).json({
    message:'Post Updated',
    post:result
  })
}
catch(err){
     if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
   
}
}

exports.deletePost=async (req,res,next)=>{
  const postId=req.params.postId;
try{
 const post=await Post.findById(postId)//to check if user has power to delete that post

  if(!post){
        const error = new Error("Could not find post");
        error.statusCode = 404;
        throw error;
    
  }
  if(post.creator.toString()!==req.userId){
    const error=new Error('Not authorized')
    error.statusCode=403;
    throw error;
  }
  
  console.log('Inside block');
  //check logged in user
  clearImage(post.imageUrl)
await Post.findByIdAndRemove(postId)

const user=await User.findById(req.userId)
  

  user.posts.pull(postId)
await user.save()
io.getIO().emit('posts',{action:'delete',post:postId})
  // console.log(result);
  res.status(200).json({
    message:"Post deleted"
  })
}
catch(err){
 if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
   
}
}

const clearImage=filePath=>{
 filePath=path.join(__dirname,'..',filePath)
  fs.unlink(filePath,err=>{
    console.log(err);
  })
}




