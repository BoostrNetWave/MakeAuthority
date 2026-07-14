const express = require('express');
const {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs
} = require('../controllers/job.controller');

const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

const router = express.Router();

router
  .route('/')
  .get(getJobs)
  .post(protect, authorizeRoles('founder', 'super_admin'), createJob);

router.get('/me', protect, authorizeRoles('founder', 'super_admin'), getMyJobs);

router
  .route('/:id')
  .get(getJobById)
  .put(protect, authorizeRoles('founder', 'super_admin'), updateJob)
  .delete(protect, authorizeRoles('founder', 'super_admin'), deleteJob);

module.exports = router;
