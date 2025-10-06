import { Response } from "express";
import { IReqUser } from "../utils/interfaces";
import response from "../utils/response";
import OrderModel, {
  orderDTO,
  OrderStatus,
  TOrder,
  TVoucher,
} from "../models/order.model";
import { FilterQuery, isValidObjectId } from "mongoose";
import TicketModel from "../models/ticket.model";
import { getId } from "../utils/id";

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
      await orderDTO.validate(payload);

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
      #swagger.security = [{
       "bearerAuth": {}
      }]
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
        return query;
      };

      const { limit = 10, page = 1, search } = req.query;

      const query = buildQuery({
        search,
      });

      const result = await OrderModel.find(query)
        .limit(+limit)
        .skip((+page - 1) * +limit)
        .sort({ createdAt: -1 })
        .lean()
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
      #swagger.security = [{
       "bearerAuth": {}
      }]
    */
    try {
      const { orderId } = req.params;

      if (!isValidObjectId(orderId)) {
        return response.notFound(res, "Failed to find order");
      }

      const result = await OrderModel.findOne({ orderId });

      if (!result) {
        return response.notFound(res, "Failed to find order");
      }

      response.success(res, result, "Successfully find Order");
    } catch (e) {
      response.error(res, e, "Failed to find Order");
    }
  },

  async complete(req: IReqUser, res: Response) {
    /**
      #swagger.tags = ['Orders']
      #swagger.security = [{
       "bearerAuth": {}
      }]
    */
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const order = await OrderModel.findOne({ id, createdBy: userId });
      if (!order) return response.notFound(res, "Order not found");

      if (order.status === "COMPLETED")
        return response.success(res, order, "Order already completed");

      const vouchers: TVoucher[] = Array.from(
        { length: order.quantity },
        () => {
          return { voucherId: getId(), isPrint: false } as TVoucher;
        }
      );

      const result = await OrderModel.findOneAndUpdate(
        {
          id,
          createdBy: userId,
        },
        { vouchers, status: OrderStatus.COMPLETED },
        { new: true }
      );

      const ticket = await TicketModel.findById(order.ticket);
      if (!ticket) return response.notFound(res, "Ticket not found");

      await TicketModel.updateOne(
        {
          _id: ticket._id,
        },
        { quantity: ticket.quantity - order.quantity }
      );

      response.success(res, result, "Successfully complete Order");
    } catch (e) {
      response.error(res, e, "Failed to complete Order");
    }
  },

  async pending(req: IReqUser, res: Response) {
    /**
      #swagger.tags = ['Orders']
      #swagger.security = [{
       "bearerAuth": {}
      }]
    */
    try {
      const { id } = req.params;

      const order = await OrderModel.findOne({ id });
      if (!order) return response.notFound(res, "Order not found");

      if (order.status === OrderStatus.COMPLETED) {
        return response.success(res, order, "Order already completed");
      } else if (order.status === OrderStatus.PENDING) {
        return response.success(res, order, "Order in payment pending");
      }

      const result = await OrderModel.findByIdAndUpdate(
        {
          id,
        },
        {
          status: OrderStatus.PENDING,
        },
        {
          new: true,
        }
      );

      response.success(res, result, "Success Pending an Order");
    } catch (e) {
      response.error(res, e, "Failed to pending Order");
    }
  },

  async cancelled(req: IReqUser, res: Response) {
    /**
      #swagger.tags = ['Orders']
      #swagger.security = [{
       "bearerAuth": {}
      }]
    */
    try {
      const { id } = req.params;

      const order = await OrderModel.findOne({ id });
      if (!order) return response.notFound(res, `Order not found`);

      if (order.status === OrderStatus.COMPLETED) {
        return response.success(res, order, "Order already completed");
      } else if (order.status === OrderStatus.CANCELLED) {
        return response.success(res, order, "Order in payment cancel");
      }

      const result = await OrderModel.findByIdAndUpdate(
        {
          id,
        },
        {
          status: OrderStatus.CANCELLED,
        },
        {
          new: true,
        }
      );

      response.success(res, result, "Success Cancelled an Order");
    } catch (e) {
      response.error(res, e, "Failed to cancel Order");
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
        return response.notFound(res, "Failed to remove order");
      }

      const result = await OrderModel.findByIdAndDelete(id, {
        new: true,
      });

      if (!result) {
        return response.notFound(res, "Order not found");
      }

      response.success(res, result, "Success removing order");
    } catch (err) {
      response.error(res, err, "Failed to remove order");
    }
  },

  async findAllByMember(req: IReqUser, res: Response) {
    /**
      #swagger.tags = ['Orders']
      #swagger.security = [{
       "bearerAuth": {}
      }]
      #swagger.parameters['limit'] = {
        in: 'query',
        type: 'number',
        default: 10
      }
    */
    try {
      const userId = req.user?.id;
      const buildQuery = (filter: any) => {
        let query: FilterQuery<TOrder> = {
          createdBy: userId,
        };

        if (filter.search) query.$text = { $search: filter.search };
        return query;
      };

      const { limit = 10, page = 1, search } = req.query;

      const query = buildQuery({
        search,
      });

      const result = await OrderModel.find(query)
        .limit(+limit)
        .skip((+page - 1) * +limit)
        .sort({ createdAt: -1 })
        .lean()
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
};
