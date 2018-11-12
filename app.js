const Couchbase = require("couchbase");
const Hapi = require("hapi");
const Joi = require("joi");
const UUID = require("uuid");

const N1qlQuery = Couchbase.N1qlQuery;

const server = new Hapi.Server({
    host: "localhost",
    port: 3000,
});

const cluster = new Couchbase.Cluster("localhost:8091");
cluster.authenticate("admin", "123123");
const bucket = cluster.openBucket("studentData");

const now = new Date();

bucket.on("error", error => {
    console.dir(error);
    process.exit(1);
});

server.route({
    method: "GET",
    path: "/",
    config: {
        handler: (request, h) => {
            return "Heloooooooooooooooooo!";
        }
    }
});

//Post
server.route({
    method: 'POST',
    path: '/addStudent',
    config: {
        validate: {
            payload: {
                stID: Joi.string().required(),
                name: Joi.string().required(),
                class: Joi.string().required(),
                phonenumber: Joi.string().required(),
                address: Joi.string().required(),
                status: Joi.any().forbidden().default("1"),
                timestamp: Joi.any().forbidden().default(now)
            }
        },
        handler: postSampleData = async (request, response) => {
            var id = UUID.v4();
            return new Promise((resolve, reject) => {
                bucket.insert(id, request.payload, (err, res) => {
                    console.log("res: ", res);
                    if (err) {
                        console.log("Error when call add:", err);

                        return resolve({
                            data: [],
                            status: constant.STS.FAILURE,
                            msg: "Error when call delete:" + err
                        })
                    }

                    if (!res) {
                        log.warn("fail!");
                        res = []
                    } else {
                        console.log("success!");
                    }
                    request.payload.id = id;
                    return resolve({
                        data: request.payload
                    })
                })
            })
        }
    }
});

//DELETE
server.route({
    method: 'POST',
    path: '/deleteStudent',
    config: {
        validate: {
            payload: {
                stID: Joi.string().required()
            }
        },
        handler: deleteData = async (request, response) => {
            const statement = "UPDATE studentData SET status = '0' WHERE stID = '" + `${request.payload.stID}` + "'";
            const query = N1qlQuery.fromString(statement);
            console.log("query: ", statement);
            return new Promise((resolve, reject) => {
                bucket.query(query, (err, res) => {
                    console.log("res: ", res);
                    if (err) {
                        console.log("Error when call delete:", err);

                        return resolve({
                            data: [],
                            status: constant.STS.FAILURE,
                            msg: "Error when call delete:" + err
                        })
                    }

                    if (!res) {
                        log.warn("fail!");
                        res = []
                    } else {
                        console.log("success!");
                    }
                    return resolve({
                        data: res
                    })
                })
            })

            return ('nothing')
        }
    }
});

//EDIT
server.route({
    method: 'POST',
    path: '/editStudent',
    config: {
        validate: {
            payload: {
                stID: Joi.string().required(),
                name: Joi.string().required(),
                class: Joi.string().required(),
                phonenumber: Joi.string().required(),
                address: Joi.string().required(),
            }
        },
        handler: editData = async (request, response) => {
            const statement = "UPDATE studentData SET name = '" + `${request.payload.name}` + "'," + " class = '" + `${request.payload.class}` + "'," + " phonenumber = '" + `${request.payload.phonenumber}` + "'," + " address ='" + `${request.payload.address}` + "' WHERE stID = '" + `${request.payload.stID}` + "'";
            const query = N1qlQuery.fromString(statement);
            console.log("query: ", statement);
            return new Promise((resolve, reject) => {
                bucket.query(query, (err, res) => {
                    console.log("res: ", res);
                    if (err) {
                        console.log("Error when call edit:", err);

                        return resolve({
                            data: [],
                            status: constant.STS.FAILURE,
                            msg: "Error when call edit:" + err
                        })
                    }

                    if (!res) {
                        log.warn("fail!");
                        res = []
                    } else {
                        console.log("success!");
                    }
                    return resolve({
                        data: res
                    })
                })
            })

            return ('nothing')
        }
    }
});


//Get All
server.route({
    method: "POST",
    path: "/studentList",
    config: {
        handler: getAllData = async (request, response) => {
            const statement = "SELECT * FROM studentData WHERE status = '1'";
            const query = N1qlQuery.fromString(statement);

            return new Promise((resolve, reject) => {
                bucket.query(query, (err, res) => {
                    if (err) {
                        console.log("Error when call getAllData:", err);

                        return resolve({
                            data: [],
                            status: constant.STS.FAILURE,
                            msg: "Error when call getAll:" + err
                        })
                    }

                    if (!res) {
                        log.warn("no data!");
                        res = []
                    } else {
                        console.log("call getAllData successfully, res length: ", res.length);
                    }
                    return resolve({
                        data: res
                    })
                })
            })

            return ('nothing')
        }
    }
});

const init = async () => {
    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();