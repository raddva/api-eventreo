import { Response } from "express";
import { IPaginationQuery, IReqUser } from "../utils/interfaces";
import BannerModel, { bannerDTO, TBanner } from "../models/banner.model";
import response from "../utils/response";
import { FilterQuery, isValidObjectId } from "mongoose";

export default {
  async create(req: IReqUser, res: Response) {
    /**
      #swagger.tags = ['Banner']
      #swagger.security = [{
       "bearerAuth": {}
      }]
      #swagger.requestBody = {
        required: true,
        schema: {
          $ref: "#/components/schemas/CreateBannerRequest"
        }
      }
    */
    try {
      await bannerDTO.validate(req.body);
      const result = await BannerModel.create(req.body);
      response.success(res, result, "Successfully created banner");
    } catch (e) {
      response.error(res, e, "Failed to create banner");
    }
  },
  async findAll(req: IReqUser, res: Response) {
    /**
      #swagger.tags = ['Banner']
    */
    try {
      const {
        limit = 10,
        page = 1,
        search,
      } = req.query as unknown as IPaginationQuery;

      const query: FilterQuery<TBanner> = {};

      if (search) {
        Object.assign(query, {
          $or: [
            {
              title: { $regex: search, $options: "i" },
            },
          ],
        });
      }

      const result = await BannerModel.find(query)
        .limit(limit)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 })
        .exec();

      const count = await BannerModel.countDocuments(query);

      response.pagination(
        res,
        result,
        {
          current: page,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
        "Successfully fetched banner data"
      );
    } catch (e) {
      response.error(res, e, "Failed to fetch banner data");
    }
  },
  async findOne(req: IReqUser, res: Response) {
    /**
      #swagger.tags = ['Banner']
    */
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return response.notFound(res, "Failed to find banner");
      }

      const result = await BannerModel.findById(id);

      if (!result) {
        return response.notFound(res, "Failed to find banner");
      }

      response.success(res, result, "Successfully get banner data");
    } catch (e) {
      response.error(res, e, "Failed to get banner");
    }
  },
  async update(req: IReqUser, res: Response) {
    /**
      #swagger.tags = ['Banner']
      #swagger.security = [{
       "bearerAuth": {}
      }]
      #swagger.requestBody = {
        required: true,
        schema: {
          $ref: "#/components/schemas/CreateBannerRequest"
        }
      }
    */
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return response.notFound(res, "Failed to update banner");
      }

      const result = await BannerModel.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      response.success(res, result, "Successfully updated banner");
    } catch (e) {
      response.error(res, e, "Failed to update banner");
    }
  },
  async remove(req: IReqUser, res: Response) {
    /**
      #swagger.tags = ['Banner']
      #swagger.security = [{
      "bearerAuth": {}
      }]
    */
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return response.notFound(res, "Failed to remove banner");
      }

      const result = await BannerModel.findByIdAndDelete(id, { new: true });
      response.success(res, result, "Successfully removed banner");
    } catch (e) {
      response.error(res, e, "Failed to remove banner");
    }
  },
};
