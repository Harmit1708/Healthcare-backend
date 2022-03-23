var bcrypt = require('bcryptjs');
var saltRound = 10;
var JWT  = require('jsonwebtoken');
var JWTD = require('jwt-decode');
var secret = "kwjfwnwf@lwoihfovno2ifo";

// write a function to convert password into hash
var hashPassword = async (pwd)=>{
    let salt = await bcrypt.genSalt(saltRound);
    let hash = await bcrypt.hash(pwd,salt);
    return hash
}  

//write a function compare the hashpwd and pwd
var hashCompare = async(pwd,hash)=>{
    let result = await bcrypt.compare(pwd,hash)
    return result
}

// write a function to create token 
var createToken = async(email,firstName,role)=>{
    let token = await JWT.sign({
        email,
        firstName,
        role,
    },
    secret,{
        expiresIn:"1h"
    }
    )
    return token;
}

// Write funciton to verifytoken
var verifyToken = async(req,res,next)=>{
    let decodeData = JWTD(req.headers.token)
   if(new Date()/1000<decodeData.exp){                
    next();
   }
   else
   {
    res.json ({
        statusCode:401,
        message:"Session Expired Login Again"
    })
   }
}

module.exports = {hashPassword,hashCompare,createToken,verifyToken}