const AIUsageLog = require("../models/AIUsageLog");

// Max 20 AI calls per user per hour (configurable)
const aiRateLimit = async (req, res, next) => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const count = await AIUsageLog.countDocuments({
      user:      req.user._id,
      createdAt: { $gte: oneHourAgo },
      success:   true,
    });

    const limit = Number(process.env.AI_RATE_LIMIT_PER_HOUR) || 20;

    if (count >= limit) {
      return res.status(429).json({
        success: false,
        message: `AI rate limit reached. You can make ${limit} AI requests per hour. Try again later.`,
        resetAt: new Date(oneHourAgo.getTime() + 60 * 60 * 1000),
      });
    }

    next();
  } catch (error) {
    next(); // don't block on rate limit errors
  }
};

module.exports = aiRateLimit;
