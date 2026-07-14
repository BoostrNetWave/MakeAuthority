const cron = require('node-cron');
const Grant = require('../models/Grant');
const GrantBookmark = require('../models/GrantBookmark');
const { createNotification } = require('../controllers/notification.controller');

// Run every day at 08:00 AM
const startCronJobs = () => {
  cron.schedule('0 8 * * *', async () => {
    console.log('[CRON] Running daily grant deadline checks...');
    try {
      // Find grants closing in exactly 7 days
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 7);
      
      const startOfDay = new Date(targetDate.setHours(0,0,0,0));
      const endOfDay = new Date(targetDate.setHours(23,59,59,999));

      const closingGrants = await Grant.find({
        deadline: { $gte: startOfDay, $lte: endOfDay },
        isActive: true
      });

      console.log(`[CRON] Found ${closingGrants.length} grants closing in 7 days.`);

      for (const grant of closingGrants) {
        // Find users tracking this grant
        const bookmarks = await GrantBookmark.find({ grant: grant._id });
        
        for (const bookmark of bookmarks) {
          await createNotification(
            bookmark.user,
            'GRANT_ALERT',
            `Grant Deadline Alert: ${grant.title}`,
            `The grant "${grant.title}" you are tracking closes in 7 days. Make sure to complete your application!`,
            `/grants/${grant.slug}`,
            true // Trigger email alert
          );
        }
      }
    } catch (error) {
      console.error('[CRON ERROR]', error);
    }
  });
};

module.exports = startCronJobs;
