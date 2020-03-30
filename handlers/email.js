const nodemailer = require("nodemailer")

var transporter = nodemailer.createTransport({
  service: 'gmail',
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
});

/** Sample mailOptions
var mailOptions = {
  from: 'youremail@gmail.com',
  to: 'myfriend@yahoo.com',
  subject: 'Sending Email using Node.js',
  text: 'That was easy!'
};
*/

module.exports = (opt) => {
    return new Promise(function (resolve, reject) {
        transporter.sendMail(opt, function (error, info) {
            if (error) {
               reject(error);
            } else {
                resolve(info.response)
            }
        });
    })
}
