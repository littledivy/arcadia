<p align="center">
  <img src="profile.png">
  Arcadia. The perfect open-source messaging platform.
</p>

![Node.js CI](https://github.com/divy-work/arcadia/workflows/Node.js%20CI/badge.svg)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/2ab802aff4be4a2c9bf39c82def628a5)](https://app.codacy.com/manual/DivySrivastava/arcadia?utm_source=github.com&utm_medium=referral&utm_content=divy-work/arcadia&utm_campaign=Badge_Grade_Settings)

# Installing

```bash
# clone the repo
$ git clone https://github.com/divy-work/arcadia.git

$ cd arcadia

# install the node modules...
$ npm install

# start
$ npm start
```

## Database

Arcadia uses MongoDB for storage of every bit of information.
So, Make sure you start the MongoDB daemon. 
```bash
$ mongod
```

You can try editing configurations as per your needs.
```js
config.dbURL = process.env.DATABASEURL || "mongodb://localhost/arcadia";
```

## Special Thanks
This repo is actually a complete makeover of [ThalKod's discord-clone](https://github.com/ThalKod/discord-clone) which was archived long ago.

## Built with

* [Nodejs](https://github.com/nodejs/node) - Node.js JavaScript runtime.
* [Socket io](https://github.com/socketio/socket.io) - Websocket library for Node.js.
* [Mongoose](https://npmjs.org/package/mongoose) - Mongoose ORM for commuication with MongoDB.
* [Express](https://npmjs.org/package/express) - Express framework for handling HTTP requests.
