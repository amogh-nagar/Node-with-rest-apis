const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authheader = req.get("Authorization");

  if (!authheader) {
    const error = new Error("Not authenticated");
    error.statusCode = 401;
    throw error;
  }
  const token = authheader.split(" ")[1];
  let decodedtoken;
  try {
    decodedtoken = jwt.verify(token, "suppppppppppperduperrrrrrr");
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!decodedtoken) {
    //this will excute if it was not be able to verify the token
    const error = new Error("Not authenticated");
    error.statusCode = 401;
    throw error;
  }
  req.userId = decodedtoken.userId;
  next();
};
