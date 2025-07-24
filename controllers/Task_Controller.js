const Tasks = require('../models/Task');

exports.getAllTasks = async (req, res) => {
    try {
        const { search } = req.query;

        // Base query for the authenticated user
        let query = { user: req.user.id };

        // If search query exists, add case-insensitive match on title
        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        const tasks = await Tasks.find(query)
            .sort({ dueDate: -1 })
            .populate({
                path: 'user',
                select: '-password -__v -createdAt -updatedAt'
            });

        res.status(200).json({
            success: true,
            count: tasks.length,
            tasks,
        });
    } catch (error) {
        console.error('Get Tasks Error:', error.message);
        res.status(500).json({ message: 'Server Error' });
    }
};



const parseDate = (input) => {
    // Try direct conversion
    const parsed = new Date(input);

    // If invalid, try custom parsing for formats like "DD/MM/YYYY"
    if (isNaN(parsed.getTime())) {
        const parts = input.split(/[\/\-\.]/); // supports / - . as separators
        if (parts.length === 3) {
            // Assume DD/MM/YYYY format
            const [dd, mm, yyyy] = parts;
            return new Date(`${yyyy}-${mm}-${dd}`);
        }
    }

    return parsed;
};




exports.addTask = async (req, res) => {
    try {
        const { title, description, dueDate, priority, status } = req.body;

        // Validate required field
        if (!title || !description || !dueDate || !priority || !status) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        let normalizedDate = dueDate ? parseDate(dueDate) : null;
        if (dueDate && isNaN(normalizedDate.getTime())) {
            return res.status(400).json({ message: 'Invalid date format' });
        }


        // Create task linked to logged-in user
        const newTask = new Tasks({
            user: req.user._id,
            title,
            description,
            dueDate: normalizedDate,
            priority,
            status,
        });

        const savedTask = await newTask.save();

        res.status(201).json({
            message: 'Task created successfully',
            task: savedTask,
        });

    } catch (error) {
        console.error('Create Task Error:', error.message);
        res.status(500).json({ message: 'Server Error' });
    }
}



exports.editTask = async (req, res) => {
    try {
        const taskId = req.params.id;
        const { title, description, dueDate, priority, status } = req.body;

        // Find the task and ensure ownership
        const task = await Tasks.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        if (task.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this task' });
        }

        // Update fields if provided
        if (title !== undefined) task.title = title;
        if (description !== undefined) task.description = description;
        if (dueDate !== undefined) {
            const parsed = parseDate(dueDate);
            if (isNaN(parsed.getTime())) {
                return res.status(400).json({ message: 'Invalid date format' });
            }
            task.dueDate = parsed;
        }
        if (priority !== undefined) task.priority = priority;
        if (status !== undefined) task.status = status;

        const updatedTask = await task.save();

        res.status(200).json({
            message: 'Task updated successfully',
            task: updatedTask,
        });

    } catch (error) {
        console.error('Update Task Error:', error.message);
        res.status(500).json({ message: 'Server Error' });
    }
}


exports.deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    // Find the task
    const task = await Tasks.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check ownership
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    // Delete task
    await task.deleteOne();

    res.status(200).json({ message: 'Task deleted successfully' });

  } catch (error) {
    console.error('Delete Task Error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};