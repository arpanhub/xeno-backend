const {google} = require('googleapis');
require('dotenv').config();
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
console.log(GOOGLE_CLIENT_ID);
console.log(GOOGLE_CLIENT_SECRET);

console.log("created cleint successfully");
exports.oauth2client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    'postmessage'
)
console.log("created cleint successfully");