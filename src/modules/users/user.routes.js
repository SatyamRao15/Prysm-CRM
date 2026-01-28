const express = require("express");
const router = express.Router();

const prisma = require("../../config/db");
const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

// ADMIN ONLY

// GET ALL USERS
router.get(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN"),
  async (req, res, next) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      res.json(users);
    } catch (error) {
      next(error);
    }
  }
);

// GET USER BY ID
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  async (req, res, next) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: Number(req.params.id) },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      next(error);
    }
  }
);

// UPDATE USER ROLE
router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  async (req, res, next) => {
    try {
      const { role } = req.body;

      const user = await prisma.user.update({
        where: { id: Number(req.params.id) },
        data: { role },
      });

      res.json({
        message: "Role updated successfully",
        user,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
