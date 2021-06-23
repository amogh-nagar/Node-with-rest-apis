const User = require("../models/user");
const {validationResult} = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  try {
    const hashedpassword = await bcrypt.hash(password, 12);
    const user = new User({
      name: name,
      email: email,
      password: hashedpassword,
    });
    const result = await user.save();

    res.status(201).json({
      message: "User created!",
      userId: result._id,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadeduser;
  try {
    const user = await User.findOne({email: email});
    if (!user) {
      const error = new Error("User doesn't exists");
      error.statusCode = 401;
      throw error;
    }
    loadeduser = user;
    const isEqual = await bcrypt.compare(password, loadeduser.password);
    console.log("isequal is ", isEqual);
    if (!isEqual) {
      const error = new Error("Wrong password");
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      {
        email: loadeduser.email,
        userId: loadeduser._id.toString(),
      },
      "suppppppppppperduperrrrrrr",
      {expiresIn: "1h"}
    );
    res.status(200).json({token: token, userId: loadeduser._id.toString()});
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("not Authenticated");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      message: "Status found successfully",
      status: user.status,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postStatus = async (req, res, next) => {
  const status = req.body.status;
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("not Authenticated");
      error.statusCode = 404;
      throw error;
    }

    user.status = status;
    await user.save();

    res.status(200).json({
      message: "Status Updated Successfully",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
