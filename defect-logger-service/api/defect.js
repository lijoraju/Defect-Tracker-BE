'use strict';

const uuid =require('uuid')
const AWS = require('aws-sdk')

AWS.config.setPromisesDependency(require('bluebird'))

const dynamoDB = new AWS.DynamoDB.DocumentClient()

module.exports.createDefect = (event, context, callback) => {
  const requestBody = JSON.parse(event.body)
  const type = requestBody.type
  const desc = requestBody.desc
  const priority = requestBody.priority
  const assignee = requestBody.assignee
  const build = requestBody.build
  submitDefect(defectInfo(type, desc, priority, assignee, build))
    .then(res => {
      console.log("Defect submitted successfully.")
      callback(null, successResponseBuilder(JSON.stringify({
        message: "New Defect Created Successfully.",
        defectId: "101"
      })))
    })
    .catch(err => {
      console.error("Failed submitting defect to system.", err)
      callback(null, failureResponseBuilder(409, JSON.stringify({message: "Failed To Create New Defect"})))
    })
}

const defectInfo = (type, desc, priority, assignee, build) => {
  const timestamp = new Date().getTime()
  return {
    id: uuid.v1(),
    type: type,
    description: desc,
    priority: priority,
    status: "Open",
    assignee: assignee,
    build: build
  }
}

const submitDefect = defect => {
  console.log("Submitting defect to system.")
  console.log(process.env.LOGNAME)
  console.log(process.env.DEFECT_TABLE)
  const defectInfo = {
    TableName: process.env.DEFECT_TABLE,
    Item: defect
  }
  return dynamoDB.put(defectInfo).promise().then(res => defect)
}

const successResponseBuilder = (body) => {
  return {
      statusCode: 200,
      headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
      },
      body: body
  };
};

const failureResponseBuilder = (statusCode, body) => {
  return {
      statusCode: statusCode,
      headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
      },
      body: body
  };
};
