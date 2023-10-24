import { NextApiRequest, NextApiResponse } from 'next';
import { connectMongoDb } from '../../../../middleware/mongoose';
import userModel from '../../../../models/user';
var CryptoJS = require('crypto-js');
const nodemailer = require('nodemailer');
var jwt = require('jsonwebtoken');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await connectMongoDb();
    if (req.method == 'GET') {
      try {
        let { id } = jwt.verify(
          req.headers?.authorization,
          process.env.JWT_SECRET
        );

        if (id) {
          let userData = await userModel
            .findOne({ _id: id })
            .select(
              'name firstName lastName phone email shareProfileData adsPerformance'
            );
          return res
            .status(200)
            .json({ message: 'User get successfull', data: userData });
        } else {
          return res.status(400).json({ message: 'Invalid token' });
        }
      } catch (err) {
        console.log('err', err);
        return res.status(400).json({ message: 'Something Went wrong' });
      }
    } else if (req.method == 'POST') {
      try {
        let { id } = jwt.verify(
          req.headers?.authorization,
          process.env.JWT_SECRET
        );
        let userData = await userModel.findOne({ _id: id });
        if (userData) {
          var bytes = CryptoJS.AES.decrypt(
            userData.password,
            process.env.AES_SECRET
          );
          var originalText = bytes.toString(CryptoJS.enc.Utf8);
          if (originalText === req.body.oldPassword) {
            var ciphertext = CryptoJS.AES.encrypt(
              req.body.newPassword,
              process.env.AES_SECRET
            ).toString();
            let updateData = await userModel.findOneAndUpdate(
              { _id: id },
              { password: ciphertext },
              { new: true }
            );
            if (updateData) {
              return res.status(200).json({
                message: 'Password change successfull',
                data: userData,
              });
            } else {
              return res.status(400).json({ message: 'password not updated' });
            }
          } else {
            return res.status(400).json({ message: 'oldPassword is wrong' });
          }
        } else {
          return res.status(400).json({ message: 'User not found' });
        }
      } catch (err) {
        return res.status(400).json({ message: 'Something Went wrong' });
      }
    } else if (req.method == 'PUT') {
      try {
        let { id } = jwt.verify(
          req.headers?.authorization,
          process.env.JWT_SECRET
        );

        let userData = await userModel.findOneAndUpdate({ _id: id }, req.body, {
          new: true,
        });
        if (userData) {
          return res
            .status(200)
            .json({ message: 'User update successfull', data: userData });
        } else {
          return res.status(400).json({ message: 'Userdata not updated' });
        }
      } catch (err) {
        return res.status(400).json({ message: 'Something Went wrong' });
      }
    } else if (req.method == 'DELETE') {
      try {
        let { id } = jwt.verify(
          req.headers?.authorization,
          process.env.JWT_SECRET
        );
        let userData = await userModel.findOneAndDelete({ _id: id });
        if (userData) {
          return res
            .status(200)
            .json({ message: 'User delete successfull', data: userData });
        } else {
          return res.status(400).json({ message: 'Invalid token' });
        }
      } catch (err) {
        return res.status(400).json({ message: 'Something Went wrong' });
      }
    } else {
      return res.status(400).json({ message: 'This method is not allowed' });
    }
  } catch (e) {
    return res.status(500).json({ message: 'Internal server error' });
  }
}
