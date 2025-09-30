import { Response } from "express";
import { IPaginationQuery, IReqUser } from "../utils/interfaces";
import CategoryModel, { categoryDTO } from "../models/category.model";
import response from "../utils/response";
import { isValidObjectId } from "mongoose";

export default {
  async create(req: IReqUser, res: Response) {
    /**
      #swagger.tags = ['Category']
      #swagger.security = [{
       "bearerAuth": {}
      }]
      #swagger.requestBody = {
        required: true,
        schema: {
          $ref: "#/components/schemas/CreateCategoryRequest"
        }
      }
    */
    try {
      await categoryDTO.validate(req.body);
      const result = await CategoryModel.create(req.body);
      response.success(res, result, "Successfully created category");
    } catch (e) {
      response.error(res, e, "Failed to create category");
    }
  },
  async findAll(req: IReqUser, res: Response) {
    /**
      #swagger.tags = ['Category']
    */
    const {
      page = 1,
      limit = 10,
      search,
    } = req.query as unknown as IPaginationQuery;
    try {
      const query = {};

      if (search) {
        Object.assign(query, {
          $or: [
            {
              name: { $regex: search, $options: "i" },
            },
            {
              description: { $regex: search, $options: "i" },
            },
          ],
        });
      }
      const result = await CategoryModel.find(query)
        .limit(limit)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 })
        .exec();

      const count = await CategoryModel.countDocuments(query);
      response.pagination(
        res,
        result,
        {
          total: count,
          totalPages: Math.ceil(count / limit),
          current: page,
        },
        "Successfully Fetched Category Data"
      );
    } catch (e) {
      response.error(res, e, "Failed to fetch category data");
    }
  },
  async findOne(req: IReqUser, res: Response) {
    /**
      #swagger.tags = ['Category']
    */
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return response.notFound(res, "Failed to find category");
      }

      const result = await CategoryModel.findById(id);

      if (!result) {
        return response.notFound(res, "Failed to find category");
      }

      response.success(res, result, "Successfully find category data");
    } catch (e) {
      response.error(res, e, "Failed to find category");
    }
  },
  async update(req: IReqUser, res: Response) {
    /**
      #swagger.tags = ['Category']
      #swagger.security = [{
       "bearerAuth": {}
      }]
      #swagger.requestBody = {
        required: true,
        schema: {
          $ref: "#/components/schemas/CreateCategoryRequest"
        }
      }
    */
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return response.notFound(res, "Failed to update category");
      }

      const result = await CategoryModel.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      response.success(res, result, "Successfully updated category");
    } catch (e) {
      response.error(res, e, "Failed to update category");
    }
  },
  async remove(req: IReqUser, res: Response) {
    /**
      #swagger.tags = ['Category']
      #swagger.security = [{
      "bearerAuth": {}
      }]
    */
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return response.notFound(res, "Failed to remove category");
      }

      const result = await CategoryModel.findByIdAndDelete(id, { new: true });
      response.success(res, result, "Successfully deleted category");
    } catch (e) {
      response.error(res, e, "Failed to remove category");
    }
  },
};
