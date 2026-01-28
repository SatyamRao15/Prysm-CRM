const express = require("express");
const router = express.Router();

const prisma = require("../../config/db");
const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

// CREATE TASK (ADMIN)
router.post(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN"),
  async (req, res, next) => {
    try {
      const task = await prisma.task.create({
        data: req.body,
      });

      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  }
);

// GET TASKS
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    let tasks;

    if (req.user.role === "ADMIN") {
      tasks = await prisma.task.findMany({
        include: {
          customer: true,
          assignedTo: true,
        },
      });
    } else {
      tasks = await prisma.task.findMany({
        where: {
          assignedToId: req.user.userId,
        },
      });
    }

    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

// UPDATE TASK STATUS (EMPLOYEE only for own task)
router.patch("/:id", authMiddleware, async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (
      req.user.role === "EMPLOYEE" &&
      task.assignedToId !== req.user.userId
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const updatedTask = await prisma.task.update({
      where: { id: Number(req.params.id) },
      data: req.body,
    });

    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
