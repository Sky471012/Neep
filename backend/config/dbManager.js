const mongoose = require('mongoose');

const connections = {};

const getDBConnection = async (dbName) => {
  if (connections[dbName]) return connections[dbName];

  const uri = process.env.MONGODB_URI.replace('userDataBase', dbName);

  const conn = await mongoose.createConnection(uri).asPromise();

  connections[dbName] = conn;
  console.log(`Connected to branch database: ${dbName}`);
  return conn;
};

module.exports = { getDBConnection };