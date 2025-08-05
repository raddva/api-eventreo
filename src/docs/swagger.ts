import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    version: "v0.0.1",
    title: "MERN Event API",
    description: "API documentation for MERN Event Back-end",
  },
  servers: [
    {
      url: "https://api-mern-event.vercel.app/api",
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
        identifier: "radiva",
        password: "nanana",
      },
    },
  },
};

const outputFile = "./swagger_output.json";
const endpointsFiles = ["../routes/api.ts"];

swaggerAutogen({
  openapi: "3.0.0",
})(outputFile, endpointsFiles, doc);
