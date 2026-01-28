const express = require("express");
const router = express.Router();

const prisma = require("../../config/db");
const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

/*
  ADMIN  -> full access
  EMPLOYEE -> read only
*/

// CREATE CUSTOMER (ADMIN)
router.post(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN"),
  async (req, res, next) => {
    try {
      const customer = await prisma.customer.create({
        data: req.body,
      });
      res.status(201).json(customer);
    } catch (error) {
      next(error);
    }
  }
);

// GET ALL CUSTOMERS (pagination)
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [customers, totalRecords] = await Promise.all([
      prisma.customer.findMany({
        skip,
        take: limit,
      }),
      prisma.customer.count(),
    ]);

    res.json({
      page,
      limit,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      data: customers,
    });
  } catch (error) {
    next(error);
  }
});

// GET CUSTOMER BY ID
router.get("/:id", authMiddleware, async (req, res, next) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json(customer);
  } catch (error) {
    next(error);
  }
});

// UPDATE CUSTOMER (ADMIN)
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  async (req, res, next) => {
    try {
      const customer = await prisma.customer.update({
        where: { id: Number(req.params.id) },
        data: req.body,
      });

      res.json(customer);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE CUSTOMER (ADMIN)
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  async (req, res, next) => {
    try {
      await prisma.customer.delete({
        where: { id: Number(req.params.id) },
      });

      res.json({ message: "Customer deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
