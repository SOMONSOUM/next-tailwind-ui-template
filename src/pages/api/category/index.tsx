import { NextApiRequest, NextApiResponse } from 'next';
import { connectMongoDb } from '../../../../middleware/mongoose';
import userModel from '../../../../models/user';
import categoryModel from 'models/category';
var CryptoJS = require('crypto-js');
const nodemailer = require('nodemailer');
var jwt = require('jsonwebtoken');

export default async function handler(req: any, res: NextApiResponse) {
  try {
    await connectMongoDb();
    if (req.method == 'GET') {
      try {
        if (req.query?.id) {
          let category = await categoryModel.findOne({ _id: req.query?.id });
          if (category) {
            return res
              .status(200)
              .json({ message: 'category found', data: category });
          } else {
            return res.status(400).json({ message: 'category not found' });
          }
        } else {
          let { limit, page } = req.query;
          if (limit && page) {
            let category = await categoryModel
              .find({})
              .skip((page - 1) * limit)
              .limit(limit);
            if (category) {
              return res
                .status(200)
                .json({ message: 'all category found', data: category });
            } else {
              return res.status(400).json({ message: 'category not getting' });
            }
          } else {
            return res
              .status(400)
              .json({ message: 'add limit and page for pagination' });
          }
        }
      } catch (err) {
        console.log('err', err);
        return res.status(400).json({ message: 'Something Went wrong' });
      }
    } else if (req.method == 'POST') {
      try {
        let category = await categoryModel.findOne({ slug: req.body.slug });
        if (category) {
          return res.status(400).json({ message: 'category already exist' });
        } else {
          var data = await new categoryModel({
            slug: req.body?.slug,
            name: req.body?.name,
            image: req.body?.image,
          }).save();

          if (data) {
            return res
              .status(200)
              .json({ message: 'category add sucessfull', data: data });
          } else {
            return res.status(400).json({ message: 'category not saved' });
          }
        }
      } catch (err) {
        console.log('err', err);
        return res.status(400).json({ message: 'Something Went wrong' });
      }
    } else if (req.method == 'PUT') {
      try {
        let category = await categoryModel.findOneAndUpdate(
          { _id: req.body.id },
          req.body,
          {
            new: true,
          }
        );
        if (category) {
          return res
            .status(200)
            .json({ message: 'category update successfull', data: category });
        } else {
          return res.status(400).json({ message: 'category not updated' });
        }
      } catch (err) {
        return res.status(400).json({ message: 'Something Went wrong' });
      }
    } else if (req.method == 'DELETE') {
      try {
        console.log('req.params?.id ', req.params?.id);
        let category = await categoryModel.findOneAndDelete({
          _id: req.query?.id,
        });
        if (category) {
          return res
            .status(200)
            .json({ message: 'category delete successfull', data: category });
        } else {
          return res.status(400).json({ message: 'category not found' });
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
