import { NextApiRequest, NextApiResponse } from 'next';
import { connectMongoDb } from '../../../../middleware/mongoose';
import userModel from '../../../../models/user';
import categoryModel from 'models/category';
import productModel from 'models/product';
var CryptoJS = require('crypto-js');
const nodemailer = require('nodemailer');
var jwt = require('jsonwebtoken');

export default async function handler(req: any, res: NextApiResponse) {
  try {
    await connectMongoDb();
    if (req.method == 'POST') {
      let match: any = {};
      let sortings: any = {};
      let { search, categoryId, rating, discount, sortBy, limit, page }: any =
        req.body;
      try {
        if (search) {
          var titleArray: any = [];
          var descriptionArray: any = [];

          search = search?.split(' ');

          search.forEach((data: any) => {
            titleArray.push({ name: { $regex: data, $options: 'si' } });
            descriptionArray.push({
              shortDescription: { $regex: data, $options: 'si' },
            });
          });

          match.$or = [{ $and: titleArray }, { $and: descriptionArray }];
        }
        if (categoryId) {
          match.categoryId = categoryId;
        }
        if (rating) {
          match.rating = rating;
        }
        if (discount) {
          match.discount = {
            $gte: discount?.split('-')[0],
            $lt: discount?.split('-')[1],
          };
        }
        if (sortBy) {
          if (sortBy == 'lowToHigh') {
            sortings.price = 1;
          } else if (sortBy == 'highToLow') {
            sortings.price = -1;
          } else if (sortBy == 'rating') {
            sortings.rating = 1;
          } else if (sortBy == 'new') {
            sortings.updatedAt = -1;
          }
        } else {
          sortings.createdAt = -1;
        }

        let resultSet = await productModel
          .find({ ...match })
          .sort(sortings)
          .skip((page - 1) * limit)
          .limit(limit);
        return res
          .status(200)
          .json({ message: 'search sucessfull', data: resultSet });
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
