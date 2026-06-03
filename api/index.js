// Vercel Serverless Function entry point
// This wraps the Express app for serverless deployment
const app = require('../backend/server');

module.exports = app;
