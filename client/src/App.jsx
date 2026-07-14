import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import StartupDirectory from './pages/directory/StartupDirectory';
import InvestorDirectory from './pages/directory/InvestorDirectory';
import GrantsDirectory from './pages/directory/GrantsDirectory';
import StartupDetail from './pages/detail/StartupDetail';
import InvestorDetail from './pages/detail/InvestorDetail';
import GrantDetail from './pages/detail/GrantDetail';
import FounderDashboard from './pages/dashboard/FounderDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import InvestorDashboard from './pages/dashboard/InvestorDashboard';
import PostGrant from './pages/dashboard/PostGrant';
import MyStartupProfile from './pages/dashboard/MyStartupProfile';
import InvestorProfileForm from './pages/dashboard/InvestorProfileForm';
import MyIncubatorProfile from './pages/dashboard/MyIncubatorProfile';
import IncubatorDashboard from './pages/dashboard/IncubatorDashboard';
import CoFounderMatch from './pages/dashboard/CoFounderMatch';
import FundingCRM from './pages/dashboard/FundingCRM';
import DiscoverHub from './pages/directory/DiscoverHub';
import IncubatorsDirectory from './pages/directory/IncubatorsDirectory';
import IncubatorDetail from './pages/detail/IncubatorDetail';
import JobsDirectory from './pages/directory/JobsDirectory';
import JobDetail from './pages/detail/JobDetail';
import PostJob from './pages/dashboard/PostJob';
import ManageJobs from './pages/dashboard/ManageJobs';
import MyApplications from './pages/dashboard/MyApplications';
import Settings from './pages/settings/Settings';
import ServiceMarketplace from './pages/directory/ServiceMarketplace';
import ServiceDetail from './pages/detail/ServiceDetail';
import ListService from './pages/dashboard/ListService';
import ServiceProviderDashboard from './pages/dashboard/ServiceProviderDashboard';
import EventsDirectory from './pages/directory/EventsDirectory';
import EventDetail from './pages/detail/EventDetail';
import CreateEvent from './pages/dashboard/CreateEvent';
import MyEvents from './pages/dashboard/MyEvents';
import CommunityForum from './pages/community/CommunityForum';
import PostDetail from './pages/community/PostDetail';
import CreatePost from './pages/community/CreatePost';
import CoFounderProfileForm from './pages/dashboard/CoFounderProfileForm';
import AIAssistant from './pages/ai/AIAssistant';
import DocumentVault from './pages/vault/DocumentVault';
import OAuthCallback from './pages/auth/OAuthCallback';
import PendingApproval from './pages/auth/PendingApproval';
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#FFFFFF', color: '#111827', border: '1px solid rgba(0,0,0,0.1)' }
        }} />
        <Routes>
          {/* ── Public routes ─────────────────────────────── */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pending-approval" element={<PendingApproval />} />
          <Route path="/auth/callback" element={<OAuthCallback />} />
          <Route path="/startups" element={<StartupDirectory />} />
          <Route path="/startups/:slug" element={<StartupDetail />} />
          <Route path="/investors" element={<InvestorDirectory />} />
          <Route path="/investors/:id" element={<InvestorDetail />} />
          <Route path="/grants" element={<GrantsDirectory />} />
          <Route path="/grants/:slug" element={<GrantDetail />} />
          <Route path="/incubators" element={<IncubatorsDirectory />} />
          <Route path="/incubators/:slug" element={<IncubatorDetail />} />
          <Route path="/jobs" element={<JobsDirectory />} />
          <Route path="/jobs/:id" element={<JobDetail />} />

          {/* ── Protected: any logged-in founder ──────────── */}
          <Route path="/dashboard/founder" element={
            <ProtectedRoute allowedRoles={['founder']}>
              <FounderDashboard />
            </ProtectedRoute>
          } />

          <Route path="/my-startup" element={
            <ProtectedRoute allowedRoles={['founder']}>
              <MyStartupProfile />
            </ProtectedRoute>
          } />

          <Route path="/crm" element={
            <ProtectedRoute allowedRoles={['founder']}>
              <FundingCRM />
            </ProtectedRoute>
          } />

          <Route path="/cofounder-match" element={
            <ProtectedRoute allowedRoles={['founder', 'investor', 'super_admin']}>
              <CoFounderMatch />
            </ProtectedRoute>
          } />

          <Route path="/cofounder-match/new" element={
            <ProtectedRoute allowedRoles={['founder', 'investor', 'super_admin']}>
              <CoFounderProfileForm />
            </ProtectedRoute>
          } />

          <Route path="/jobs/new" element={
            <ProtectedRoute allowedRoles={['founder', 'super_admin']}>
              <PostJob />
            </ProtectedRoute>
          } />

          <Route path="/jobs/manage" element={
            <ProtectedRoute allowedRoles={['founder', 'super_admin']}>
              <ManageJobs />
            </ProtectedRoute>
          } />

          <Route path="/jobs/my-applications" element={
            <ProtectedRoute>
              <MyApplications />
            </ProtectedRoute>
          } />

          {/* ── Protected: any logged-in investor ─────────── */}
          <Route path="/dashboard/investor" element={
            <ProtectedRoute allowedRoles={['investor']}>
              <InvestorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/profile/investor" element={
            <ProtectedRoute allowedRoles={['investor']}>
              <InvestorProfileForm />
            </ProtectedRoute>
          } />

          {/* ── Protected: any logged-in incubator ─────────── */}
          <Route path="/my-incubator" element={
            <ProtectedRoute allowedRoles={['incubator']}>
              <MyIncubatorProfile />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/incubator" element={
            <ProtectedRoute allowedRoles={['incubator']}>
              <IncubatorDashboard />
            </ProtectedRoute>
          } />

          {/* ── Protected: super_admin only ────────────────── */}
          <Route path="/dashboard/admin" element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/admin/grants/new" element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <PostGrant />
            </ProtectedRoute>
          } />

          {/* ── Protected: all logged-in users ────────────── */}
          <Route path="/discover" element={
            <ProtectedRoute allowedRoles={['founder', 'investor', 'super_admin', 'incubator', 'service_provider', 'job_seeker']}>
              <DiscoverHub />
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />

          <Route path="/marketplace" element={
            <ProtectedRoute allowedRoles={['founder', 'investor', 'super_admin', 'incubator', 'service_provider', 'job_seeker']}>
              <ServiceMarketplace />
            </ProtectedRoute>
          } />

          <Route path="/marketplace/:id" element={
            <ProtectedRoute allowedRoles={['founder', 'investor', 'super_admin', 'incubator', 'service_provider', 'job_seeker']}>
              <ServiceDetail />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/service_provider" element={
            <ProtectedRoute allowedRoles={['service_provider']}>
              <ServiceProviderDashboard />
            </ProtectedRoute>
          } />

          <Route path="/events" element={
            <ProtectedRoute allowedRoles={['founder', 'investor', 'super_admin', 'incubator', 'service_provider', 'job_seeker']}>
              <EventsDirectory />
            </ProtectedRoute>
          } />

          <Route path="/events/:id" element={
            <ProtectedRoute allowedRoles={['founder', 'investor', 'super_admin', 'incubator', 'service_provider', 'job_seeker']}>
              <EventDetail />
            </ProtectedRoute>
          } />

          <Route path="/community" element={
            <ProtectedRoute allowedRoles={['founder', 'investor', 'super_admin', 'incubator', 'service_provider', 'job_seeker']}>
              <CommunityForum />
            </ProtectedRoute>
          } />

          <Route path="/community/new" element={
            <ProtectedRoute allowedRoles={['founder', 'investor', 'super_admin', 'incubator', 'service_provider', 'job_seeker']}>
              <CreatePost />
            </ProtectedRoute>
          } />

          <Route path="/community/:id" element={
            <ProtectedRoute allowedRoles={['founder', 'investor', 'super_admin', 'incubator', 'service_provider', 'job_seeker']}>
              <PostDetail />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/events/my-events" element={
            <ProtectedRoute>
              <MyEvents />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/events/new" element={
            <ProtectedRoute allowedRoles={['super_admin', 'incubator', 'community_partner']}>
              <CreateEvent />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/services/new" element={
            <ProtectedRoute allowedRoles={['service_provider']}>
              <ListService />
            </ProtectedRoute>
          } />

          <Route path="/ai" element={
            <ProtectedRoute allowedRoles={['founder', 'investor', 'super_admin', 'incubator', 'service_provider', 'job_seeker']}>
              <AIAssistant />
            </ProtectedRoute>
          } />

          <Route path="/vault" element={
            <ProtectedRoute allowedRoles={['founder', 'investor', 'super_admin', 'incubator', 'service_provider', 'job_seeker']}>
              <DocumentVault />
            </ProtectedRoute>
          } />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;