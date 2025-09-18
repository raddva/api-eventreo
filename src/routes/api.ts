import express from "express";
import authController from "../controllers/auth.controller";
import authMiddleware from "../middlewares/auth.middleware";
import aclMiddleware from "../middlewares/acl.middleware";
import { ROLES } from "../utils/constant";
import mediaMiddleware from "../middlewares/media.middleware";
import mediaController from "../controllers/media.controller";
import categoryController from "../controllers/category.controller";
import regionController from "../controllers/region.controller";
import eventController from "../controllers/event.controller";
import ticketController from "../controllers/ticket.controller";
import bannerController from "../controllers/banner.controller";
import orderController from "../controllers/order.controller";

const router = express.Router();

// ---> Auth <---
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.get("/auth/profile", authMiddleware, authController.profile);
router.post("/auth/activation", authController.activation);

// ---> Category <---
router.post(
  "/category",
  [authMiddleware, aclMiddleware([ROLES.ADMIN])],
  categoryController.create
);
router.get("/category", categoryController.findAll);
router.get("/category/:id", categoryController.findOne);
router.put(
  "/category/:id",
  [authMiddleware, aclMiddleware([ROLES.ADMIN])],
  categoryController.update
);
router.delete(
  "/category/:id",
  [authMiddleware, aclMiddleware([ROLES.ADMIN])],
  categoryController.remove
);

// ---> Event <---
router.post(
  "/events",
  [authMiddleware, aclMiddleware([ROLES.ADMIN])],
  eventController.create
);
router.get("/events", eventController.findAll);
router.get("/events/:id", eventController.findOne);
router.get("/events/:slug/slug", eventController.findOneBySlug);
router.put(
  "/events/:id",
  [authMiddleware, aclMiddleware([ROLES.ADMIN])],
  eventController.update
);
router.delete(
  "/events/:id",
  [authMiddleware, aclMiddleware([ROLES.ADMIN])],
  eventController.remove
);

// ---> Ticket <---
router.post(
  "/tickets",
  [authMiddleware, aclMiddleware([ROLES.ADMIN])],
  ticketController.create
);
router.get("/tickets", ticketController.findAll);
router.get("/tickets/:id", ticketController.findOne);
router.get("/tickets/:eventId/events", ticketController.findAllByEvent);
router.put(
  "/tickets/:id",
  [authMiddleware, aclMiddleware([ROLES.ADMIN])],
  ticketController.update
);
router.delete(
  "/tickets/:id",
  [authMiddleware, aclMiddleware([ROLES.ADMIN])],
  ticketController.remove
);

// ---> Banner <---
router.post(
  "/banners",
  [authMiddleware, aclMiddleware([ROLES.ADMIN])],
  bannerController.create
);
router.get("/banners", bannerController.findAll);
router.get("/banners/:id", bannerController.findOne);
router.put(
  "/banners/:id",
  [authMiddleware, aclMiddleware([ROLES.ADMIN])],
  bannerController.update
);
router.delete(
  "/banners/:id",
  [authMiddleware, aclMiddleware([ROLES.ADMIN])],
  bannerController.remove
);

// ---> Orders <---
router.post("/orders", orderController.create);
router.get("/orders", orderController.findAll);
router.get("/orders/:id", orderController.findOne);
router.put("/orders/:id/complete", orderController.findOne);

// ---> Region <---
router.get("/regions", regionController.getAllProvinces);
router.get("/regions/:id/province", regionController.getProvince);
router.get("/regions/:id/regency", regionController.getRegency);
router.get("/regions/:id/district", regionController.getDistrict);
router.get("/regions/:id/village", regionController.getVillage);
router.get("/regions-search", regionController.findByCity);

// ---> Media <---
router.post("/media/upload-single", [
  authMiddleware,
  aclMiddleware([ROLES.ADMIN, ROLES.MEMBER]),
  mediaMiddleware.single("file"),
  mediaController.single,
]);
router.post("/media/upload-multiple", [
  authMiddleware,
  aclMiddleware([ROLES.ADMIN, ROLES.MEMBER]),
  mediaMiddleware.multiple("files"),
  mediaController.multiple,
]);
router.delete("/media/remove", [
  authMiddleware,
  aclMiddleware([ROLES.ADMIN, ROLES.MEMBER]),
  mediaController.remove,
]);

export default router;
