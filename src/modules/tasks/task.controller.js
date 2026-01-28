const prisma = require("../../config/db");

/* ================= CREATE TASK ================= */
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, assignedToId, customerId, status } = req.body;

    // check employee
    const employee = await prisma.user.findUnique({
      where: { id: assignedToId },
    });

    if (!employee || employee.role !== "EMPLOYEE") {
      return res.status(404).json({ message: "Employee not found" });
    }

    // check customer
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        assignedToId,
        customerId,
      },
    });

    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

/* ================= GET TASKS ================= */
exports.getTasks = async (req, res, next) => {
  try {
    const { id, role } = req.user;

    const where =
      role === "ADMIN"
        ? {}
        : {
            assignedToId: id,
          };

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

/* ================= UPDATE STATUS ================= */
exports.updateTaskStatus = async (req, res, next) => {
  try {
    const taskId = Number(req.params.id);
    const { status } = req.body;
    const { id, role } = req.user;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // employee restriction
    if (role === "EMPLOYEE" && task.assignedToId !== id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { status },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
};
