const {oauth2client} = require('../utils/googleConfig');

const axios = require('axios');
// console.log(axios);
const User = require('../models/user.model');

const jwt = require('jsonwebtoken');

require('dotenv').config();



const googleController = async (req,res)=>{
    try{
        const {code} = req.body;
        console.log("in the google controller")
        const googleRes = await oauth2client.getToken(code);
        oauth2client.setCredentials(googleRes.tokens);

        const userRes = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`);
        const {email,name} = userRes.data;
        console.log(`Fetched the user and name=>${email}`)
        let user = await User.findOne({email});
        if(!user){
            user  = await User.create({
                email,name,
                    password:email+process.env.JWT_SECRET,
                
            })
        }
        const {_id} = user;
        console.log(`User found or created with id ${_id}`);
        const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
              );
        console.log(`Token generated successfully for user ${email}`);
        return res.status(200).json({
            message:"Successfully logged in",
            token,
            user
        })
    }catch(err){
        console.error('Error in googleController:', err);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}
module.exports = googleController;