import { Response } from "express";
import { IPaginationQuery, IReqUser } from "../utils/interfaces";
import response from "../utils/response";
import EventModel, { eventDTO, TypeEvent } from "../models/event.model";
import { FilterQuery, isValidObjectId } from "mongoose";

export default {
  async create(req: IReqUser, res: Response) {
    /**
      #swagger.tags = ['Events']
      #swagger.security = [{
       "bearerAuth": {}
      }]
      #swagger.requestBody = {
        required: true,
        schema: {
          $ref: "#/components/schemas/CreateEventRequest"
        }
      }
    */
    try {
      const payload = { ...req.body, createdBy: req.user?.id } as TypeEvent;
      await eventDTO.validate(payload);
      const result = await EventModel.create(payload);
      response.success(res, result, "Successfully created Event");
    } catch (e) {
      response.error(res, e, "Failed to create Event");
    }
  },
  async findAll(req: IReqUser, res: Response) {
    /**
      #swagger.tags = ['Events']
      #swagger.parameters['limit'] = {
        in: 'query',
        type: 'number',
        default: 10
      }
      #swagger.parameters['page'] = {
        in: 'query',
        type: 'number',
        default: 1
      }
      #swagger.parameters['category'] = {
        in: 'query',
        type: 'string'
      }
      #swagger.parameters['isOnline'] = {
        in: 'query',
        type: 'boolean'
      }
      #swagger.parameters['isFeatured'] = {
        in: 'query',
        type: 'boolean'
      }
      #swagger.parameters['isPublish'] = {
        in: 'query',
        type: 'boolean'
      }
    */
    try {
      const buildQuery = (filter: any) => {
        let query: FilterQuery<TypeEvent> = {};

        if (filter.search) query.$text = { $search: filter.search };
        if (filter.category) query.category = filter.category;
        if (filter.isOnline) query.isOnline = filter.isOnline;
        if (filter.isFeatured) query.isFeatured = filter.isFeatured;
        if (filter.isPublish) query.isPublish = filter.isPublish;

        return query;
      };

      const {
        limit = 10,
        page = 1,
        search,
        category,
        isOnline,
        isFeatured,
        isPublish,
      } = req.query;

      const query = buildQuery({
        search,
        category,
        isOnline,
        isFeatured,
        isPublish,
      });

      const result = await EventModel.find(query)
        .limit(+limit)
        .skip((+page - 1) * +limit)
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      const count = await EventModel.countDocuments(query);

      response.pagination(
        res,
        result,
        {
          current: +page,
          total: count,
          totalPages: Math.ceil(count / +limit),
        },
        "Successfully fetched event data"
      );
    } catch (e) {
      response.error(res, e, "Failed to fetch Event Data");
    }
  },
  async findOne(req: IReqUser, res: Response) {
    /**
      #swagger.tags = ['Events']
    */
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return response.notFound(res, "Failed to find event");
      }

      const result = await EventModel.findById(id);

      if (!result) {
        return response.notFound(res, "Failed to find event");
      }

      response.success(res, result, "Successfully find Event");
    } catch (e) {
      response.error(res, e, "Failed to find Event");
    }
  },
  async update(req: IReqUser, res: Response) {
    /**
      #swagger.tags = ['Events']
      #swagger.security = [{
       "bearerAuth": {}
      }]
      #swagger.requestBody = {
        required: true,
        schema: {
          $ref: "#/components/schemas/CreateEventRequest"
        }
      }
    */
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return response.notFound(res, "Failed to update event");
      }

      const result = await EventModel.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      response.success(res, result, "Successfully updated Event");
    } catch (e) {
      response.error(res, e, "Failed to update Event");
    }
  },
  async remove(req: IReqUser, res: Response) {
    /**
      #swagger.tags = ['Events']
      #swagger.security = [{
       "bearerAuth": {}
      }]
    */
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return response.notFound(res, "Failed to remove event");
      }

      const result = await EventModel.findByIdAndDelete(id, {
        new: true,
      });
      response.success(res, result, "Successfully removed Event");
    } catch (e) {
      response.error(res, e, "Failed to remove Event");
    }
  },
  async findOneBySlug(req: IReqUser, res: Response) {
    /**
      #swagger.tags = ['Events']
    */
    try {
      const { slug } = req.params;
      const result = await EventModel.findOne({ slug });
      response.success(res, result, "Successfully find Event by slug");
    } catch (e) {
      response.error(res, e, "Failed to find Event");
    }
  },
};
