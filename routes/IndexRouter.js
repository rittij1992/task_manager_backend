const express = require('express');
const router = express.Router();

const userRouter = require('./UserRouter');
const taskRouter = require('./TaskRouter');

router.use('/users', userRouter);
router.use('/tasks', taskRouter);



module.exports = router;