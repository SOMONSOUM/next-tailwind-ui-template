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
        let isAlready = await userModel.findOne(req.body);
        if (isAlready) {
          let response = {
            name: isAlready?.name,
            email: isAlready?.email,
            id: isAlready?.id,
          };

          return res
            .status(200)
            .json({ message: 'Invalid OTP', data: response });
        } else {
          return res.status(400).json({ message: 'Invalid OTP' });
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
