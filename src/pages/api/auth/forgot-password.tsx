import { NextApiRequest, NextApiResponse } from 'next';
import { connectMongoDb } from '../../../../middleware/mongoose';
import userModel from '../../../../models/user';
var CryptoJS = require('crypto-js');
const nodemailer = require('nodemailer');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await connectMongoDb();
    if (req.method == 'POST') {
      try {
        let isAlready = await userModel.findOne(req.body).select('email');
        if (isAlready) {
          let newOtp = await userModel.findOneAndUpdate(
            req.body,
            { otp: Math.floor(100000 + Math.random() * 900000) },
            { new: true }
          );
          console.log('newOtp', newOtp);
          if (newOtp) {
            let transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: process.env.NODEMAILER_EMAIL,
                pass: process.env.NODEMAILER_PASSWORD,
              },
            });

            let info = {
              from: process.env.NODEMAILER_EMAIL, // sender address
              to: req.body?.email, // list of receivers
              subject: 'Forgot Password', // Subject line
              text: `Forgot Password OTP :- ${newOtp?.otp}`, // plain text body
              // html: "<b>Borobazar</b>", // html body
            };

            transporter.sendMail(info, (err: any) => {
              if (err) {
                return res
                  .status(400)
                  .json({ data: err, message: 'Please enter valid email' });
              } else {
                return res
                  .status(200)
                  .json({ data: isAlready, message: 'Email send sucessfull' });
              }
            });
          } else {
            return res.status(400).json({ message: 'OTP not generated' });
          }
        } else {
          return res
            .status(400)
            .json({ message: 'User not found wih this email' });
        }
      } catch (err) {
        console.log('err', err);
        return res.status(400).json({ message: 'Something Went wrong' });
      }
    } else {
      return res.status(400).json({ message: 'This method is not allowed' });
    }
  } catch (e) {
    return res.status(500).json({ message: 'Internal server error' });
  }
}
