const Notification = require('../models/Notification');
const User = require('../models/User');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // You can change this to SendGrid, AWS SES, etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmailAlert = async (user, subject, text) => {
  if (user && user.email) {
    try {
      await transporter.sendMail({
        from: `"Boostr Platform" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: subject,
        text: text
      });
      console.log(`[EMAIL ALERT SENT] To: ${user.email} | Subject: ${subject}`);
    } catch (error) {
      console.error('[EMAIL ALERT FAILED]', error);
    }
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50); // Get last 50 notifications
    
    res.json({ success: true, notifications });
  } catch (error) {
    console.error('Get Notifications Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ user: req.user._id, isRead: false });
    res.json({ success: true, count });
  } catch (error) {
    console.error('Get Unread Count Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { returnDocument: 'after' }
    );
    
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    res.json({ success: true, notification });
  } catch (error) {
    console.error('Mark As Read Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );
    
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark All As Read Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Internal utility to create a notification and optionally send an email
exports.createNotification = async (userId, type, title, message, link = null, sendEmail = false) => {
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      link
    });

    if (sendEmail) {
      const user = await User.findById(userId).select('email name');
      if (user) {
        await sendEmailAlert(user, title, message);
      }
    }

    return notification;
  } catch (error) {
    console.error('Create Notification Error:', error);
    return null;
  }
};
