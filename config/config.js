const config = {};

config.port = process.env.PORT || 5000;
config.dbURL = process.env.DATABASEURL || "mongodb://localhost/arcadia";
config.testDbURL = process.env.TESTDATABASEURL || "mongodb://localhost/arcadia-test";
module.exports = config;
