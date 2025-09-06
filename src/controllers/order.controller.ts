import { Response } from "express";
import { IReqUser } from "../utils/interfaces";
import response from "../utils/response";
import OrderModel, { orderDAO, TOrder } from "../models/order.model";
import { FilterQuery, isValidObjectId } from "mongoose";
import TicketModel from "../models/ticket.model";

export default {
  async create(req: IReqUser, res: Response) {
    /**
      #swagger.tags = ['Orders']
      #swagger.security = [{
       "bearerAuth": {}
      }]
      #swagger.requestBody = {
        required: true,
        schema: {
          $ref: "#/components/schemas/CreateOrderRequest"
        }
      }
    */
    try {
      const userId = req.user?.id;
      const payload = { ...req.body, createdBy: userId } as TOrder;
      await orderDAO.validate(payload);

      const ticket = await TicketModel.findById(payload.ticket);
      if (!ticket) return response.notFound(res, "Ticket not found");
      if (ticket.quantity < payload.quantity) {
        return response.error(res, null, "Not enough ticket quantity");
      }

      const total: number = +ticket.price * +payload.quantity;

      Object.assign(payload, { ...payload, total });

      const result = await OrderModel.create(payload);
      response.success(res, result, "Successfully created Order");
    } catch (e) {
      response.error(res, e, "Failed to create Order");
    }
  },
  async findAll(req: IReqUser, res: Response) {
    /**
      #swagger.tags = ['Orders']
      #swagger.parameters['limit'] = {
        in: 'query',
        type: 'number',
        default: 10
      }
    */
    try {
      const buildQuery = (filter: any) => {
        let query: FilterQuery<TOrder> = {};

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

      const result = await OrderModel.find(query)
        .limit(+limit)
        .skip((+page - 1) * +limit)
        .sort({ createdAt: -1 })
        .exec();

      const count = await OrderModel.countDocuments(query);

      response.pagination(
        res,
        result,
        {
          current: +page,
          total: count,
          totalPages: Math.ceil(count / +limit),
        },
        "Successfully fetched order data"
      );
    } catch (e) {
      response.error(res, e, "Failed to fetch Order Data");
    }
  },
  async findOne(req: IReqUser, res: Response) {
    /**
      #swagger.tags = ['Orders']
    */
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return response.notFound(res, "Failed to find order");
      }

      const result = await OrderModel.findById(id);

      if (!result) {
        return response.notFound(res, "Failed to find order");
      }

      response.success(res, result, "Successfully find Order");
    } catch (e) {
      response.error(res, e, "Failed to find Order");
    }
  },
  async update(req: IReqUser, res: Response) {
    /**
      #swagger.tags = ['Orders']
      #swagger.security = [{
       "bearerAuth": {}
      }]
      #swagger.requestBody = {
        required: true,
        schema: {
          $ref: "#/components/schemas/CreateOrderRequest"
        }
      }
    */
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return response.notFound(res, "Failed to update order");
      }

      const result = await OrderModel.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      response.success(res, result, "Successfully updated Order");
    } catch (e) {
      response.error(res, e, "Failed to update Order");
    }
  },
  async remove(req: IReqUser, res: Response) {
    /**
      #swagger.tags = ['Orders']
      #swagger.security = [{
       "bearerAuth": {}
      }]
    */
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return response.notFound(res, "Failed to remove eveny");
      }

      const result = await OrderModel.findByIdAndDelete(id, {
        new: true,
      });
      response.success(res, result, "Successfully removed Order");
    } catch (e) {
      response.error(res, e, "Failed to remove Order");
    }
  },
  async findAllByMember(req: IReqUser, res: Response) {
    /**
      #swagger.tags = ['Orders']
    */
    try {
      const { slug } = req.params;
      const result = await OrderModel.findOne({ slug });
      response.success(res, result, "Successfully find Order by slug");
    } catch (e) {
      response.error(res, e, "Failed to find Order");
    }
  },
};
