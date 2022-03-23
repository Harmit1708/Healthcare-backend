var express = require('express');
const shortid = require('shortid')
const Razorpay = require('razorpay')
var router = express.Router();
var { mongodb, MongoClient, dbUrl } = require("../dbSchema");
var {hashPassword, hashCompare,createToken,verifyToken} = require("../Authentication");
const bodyParser = require('body-parser')


const razorpay = new Razorpay({
	key_id: 'rzp_test_kd9ipGkYQ7l7tY',
	key_secret: 'YuuKc06bOh6GV3OlvV6Ia1nm'
})


router.post('/razorpay', async (req, res) => {
	const payment_capture = 1
	const amount = 499;
	const currency = 'INR'

	const options = {
		amount: amount * 100,
		currency,
		receipt: shortid.generate(),
		payment_capture
	}

	try {
		const response = await razorpay.orders.create(options)
		console.log(response)
		res.json({
			id: response.id,
			currency: response.currency,
			amount: response.amount
		})
	} catch (error) {
		console.log(error)
	}
})




// SignUp
router.post("/signup", async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    let db = await client.db("healthcare");
    let user = await db.collection("users").find({ email: req.body.email });
    if (user.length > 0) {
      res.json({
        statusCode: 400,
        message: "User Already Exists",
      });
    } else {
      let hashedPassword = await hashPassword(req.body.password,req.body.cpassword);
      req.body.password= hashedPassword;
      req.body.cpassword = hashedPassword;

      let user = await db.collection("users").insertOne(req.body);
      res.json({
        statusCode: 200,
        message: "User SignUp Successfull",
      }); 
    }
  } catch (error) {
    console.log(error);
    res.json({
      statusCode: 500,
      message: "Internal Server Error",
    });
  } finally {
    client.close();
  }
});


// Login
router.post("/signin", async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    let db = await client.db("healthcare");
    let user = await db.collection("users").findOne({ email: req.body.email });
    if (user) {
      let compare = await hashCompare(req.body.password, user.password);
      if (compare) {
        let token  = await createToken(user.email,user.firstName )
        res.json({
          statusCode: 200,
          email: user.email,
          firstName: user.firstName,  
          token
        });
      } else {
        res.json({
          statusCode: 400,
          message: "Invalid Password",
        });
      }
    } else {
      res.json({
        statusCode: 404,
        message: "User Not Found",
      });
    }
  } catch {
    console.log(error);
    res.json({
      statusCode: 500,
      message: "Internal Server Error",
    });
  } finally {
    client.close();
  }
});

// Post method for orderdetails
router.post('/placeorder',async(req,res)=>{
  const client = await MongoClient.connect(dbUrl);
  try{
    let db = await client.db("healthcare");
    let order = await db.collection("Placeorder").find({mobile:req.body.mobile});
    if(order.length>0){
      res.json({
        statusCode:400,
        message:"Order Already Exists"
      });
    }
    else
    {
      const crypto = require('crypto')
      const id = crypto.randomBytes(16).toString("hex");
      req.body['order_id'] = id;
      let order = await db.collection("Placeorder").insertOne(req.body);
      res.json({
        statusCode:200,
        message:"Order Successfully",
        order_id:req.body['order_id']
     });
    }
  }
  catch{
    console.log(error)
    res.json({
      statusCode:500,
      messgae:"Internal Server Error"
    })
  }

})





router.post("/auth",verifyToken,async(req,res)=>{
  res.json({
    statusCode:200,
    message:req.body.purpose
  })
})

module.exports = router;
