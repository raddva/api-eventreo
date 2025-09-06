import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    version: "v0.0.1",
    title: "EVENTREO API",
    description: "API documentation for Eventreo",
  },
  servers: [
    {
      url: "https://api-eventreo.vercel.app/api",
      description: "Production server",
    },
    {
      url: "http://localhost:3000/api",
      description: "Local Development server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
      },
    },
    schemas: {
      LoginRequest: {
        identifier: "mandy",
        password: "Secret101%",
      },
      RegisterRequest: {
        fullName: "Mandyoso",
        username: "mandy",
        email: "mandyoso@yopmail.com",
        password: "Secret101%",
        confirmPassword: "Secret101%",
      },
      ActivationRequest: {
        code: "xyz",
      },
      CreateCategoryRequest: {
        name: "",
        description: "",
        icon: "",
      },
      CreateEventRequest: {
        name: "",
        banner: "fileUrl",
        category: "categoryId",
        description: "",
        startDate: "yyyy-mm-dd hh:mm:ss",
        endDate: "yyyy-mm-dd hh:mm:ss",
        location: {
          region: "regionId",
          coordinates: [0, 0],
          address: "",
        },
        isOnline: false,
        isFeatured: false,
        isPublish: false,
      },
      CreateTicketRequest: {
        price: 0,
        name: "",
        events: "eventId",
        description: "",
        quantity: 0,
      },
      CreateBannerRequest: {
        title: "",
        image: "",
        isShow: false,
      },
      RemoveMediaRequest: {
        fileUrl: "",
      },
      CreateOrderRequest: {
        total: 0,
        status: "PENDING",
        payment: "",
        events: "eventId",
        orderId: "orderId",
        ticket: "ticketId",
        quantity: 1,
        vouchers: "[{ voucherId: 'voucherId', isPrint: false }]",
      },
    },
  },
};

const outputFile = "./swagger_output.json";
const endpointsFiles = ["../routes/api.ts"];

swaggerAutogen({
  openapi: "3.0.0",
})(outputFile, endpointsFiles, doc);
