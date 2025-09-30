import { Response } from "express";
import { IPaginationQuery, IReqUser } from "../utils/interfaces";
import response from "../utils/response";
import { FilterQuery, isValidObjectId } from "mongoose";
import TicketModel, { ticketDTO, TicketType } from "../models/ticket.model";

export default {
  async create(req: IReqUser, res: Response) {
    /**
      #swagger.tags = ['Tickets']
      #swagger.security = [{
       "bearerAuth": {}
      }]
      #swagger.requestBody = {
        required: true,
        schema: {
          $ref: "#/components/schemas/CreateTicketRequest"
        }
      }
    */
    try {
      await ticketDTO.validate(req.body);
      const result = await TicketModel.create(req.body);
      response.success(res, result, "Successfully created Ticket");
    } catch (e) {
      response.error(res, e, "Failed to create Ticket");
    }
  },
  async findAll(req: IReqUser, res: Response) {
    /**
      #swagger.tags = ['Tickets']
    */
    try {
      const {
        limit = 10,
        page = 1,
        search,
      } = req.query as unknown as IPaginationQuery;

      const query: FilterQuery<TicketType> = {};

      if (search) {
        Object.assign(query, {
          $or: [
            {
              name: { $regex: search, $options: "i" },
            },
          ],
        });
      }

      const result = await TicketModel.find(query)
        .populate("events")
        .limit(limit)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 })
        .exec();

      const count = await TicketModel.countDocuments(query);

      response.pagination(
        res,
        result,
        {
          current: page,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
        "Successfully fetched ticket data"
      );
    } catch (e) {
      response.error(res, e, "Failed to fetch Tickets");
    }
  },
  async findOne(req: IReqUser, res: Response) {
    /**
      #swagger.tags = ['Tickets']
    */
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return response.notFound(res, "Failed to find ticket");
      }

      const result = await TicketModel.findById(id);

      if (!result) {
        return response.notFound(res, "Failed to find ticket");
      }

      response.success(res, result, "Successfully get Ticket");
    } catch (e) {
      response.error(res, e, "Failed to get Ticket");
    }
  },
  async update(req: IReqUser, res: Response) {
    /**
      #swagger.tags = ['Tickets']
      #swagger.security = [{
       "bearerAuth": {}
      }]
      #swagger.requestBody = {
        required: true,
        schema: {
          $ref: "#/components/schemas/CreateTicketRequest"
        }
      }
    */
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return response.notFound(res, "Failed to update ticket");
      }

      const result = await TicketModel.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      response.success(res, result, "Successfully updated Ticket");
    } catch (e) {
      response.error(res, e, "Failed to update Ticket");
    }
  },
  async remove(req: IReqUser, res: Response) {
    /**
      #swagger.tags = ['Tickets']
      #swagger.security = [{
       "bearerAuth": {}
      }]
    */
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return response.notFound(res, "Failed to remove ticket");
      }

      const result = await TicketModel.findByIdAndDelete(id, {
        new: true,
      });
      response.success(res, result, "Successfully removed Ticket");
    } catch (e) {
      response.error(res, e, "Failed to remove Ticket");
    }
  },
  async findAllByEvent(req: IReqUser, res: Response) {
    /**
      #swagger.tags = ['Tickets']
    */
    try {
      const { eventId } = req.params;

      if (!isValidObjectId(eventId)) {
        return response.error(res, null, "Tickets not found");
      }

      const result = await TicketModel.find({ events: eventId }).exec();
      response.success(res, result, "Successfully fetch All Ticket by Event");
    } catch (e) {
      response.error(res, e, "Failed to fetch All Ticket by Event Ticket");
    }
  },
};
