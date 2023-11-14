const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const multer = require('multer');
const Users = require('../models/users');
const Mail = require('../routes/mail');
const upload = multer({ dest: './uploaded/' })
const { uploadFile } = require('./s3')

const Notification = require('../models/notifications');

router.post("/addnotif/:userId/:message/:type", async (req, res) => {
    const {userId, message, type} = req.params
    try {
    const notification = new Notification({
        userId,
        message,
        type,
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
})

router.put("/markread/:notificationId", async (req, res) => {
    const {notificationId} = req.params
    try {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { status: 'read' },
      { new: true }
    );

    if (!notification) {
      throw new Error('Notification not found');
    }

    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }

})

router.get("/:userid/groupedByDate", async (req, res) => {
    const userId = req.params.userid
    try {
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);

    const todayNotifications = notifications.filter((notification) => notification.createdAt >= today);
    const yesterdayNotifications = notifications.filter((notification) => {
      return notification.createdAt >= yesterday && notification.createdAt < today;
    });

    const lastWeekNotifications = notifications.filter(
      (notification) => notification.createdAt >= lastWeek && notification.createdAt < yesterday
    );

    const olderNotifications = notifications.filter(
      (notification) => notification.createdAt < lastWeek
    );

    return {
      today: todayNotifications,
      yesterday: yesterdayNotifications,
      lastWeek: lastWeekNotifications,
      older: olderNotifications,
    };
  } catch (error) {
    console.error('Error fetching notifications by date:', error);
    throw error;
  }
});

module.exports = router;