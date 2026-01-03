const express = require('express');
const Router = express.Router();
const taskRouter = require('../controllers/Task_Controller');
const {auth} = require('../middleware/Auth');

Router.get('/allTasks', [auth], taskRouter.getAllTasks);
Router.post('/addTask', [auth], taskRouter.addTask);
Router.put('/editTask/:id', [auth], taskRouter.editTask);
Router.delete('/deleteTask/:id', [auth], taskRouter.deleteTask);

module.exports = Router;