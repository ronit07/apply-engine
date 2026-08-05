import { Route, Routes } from 'react-router-dom'
import { Sidebar } from './components/layout/Sidebar'
import { DashboardPage } from './pages/DashboardPage'
import { ProfileSetupPage } from './pages/ProfileSetupPage'
import { AddJobPage } from './pages/AddJobPage'
import { JobDetailPage } from './pages/JobDetailPage'

function App() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <Sidebar />
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfileSetupPage />} />
        <Route path="/jobs/new" element={<AddJobPage />} />
        <Route path="/jobs/:jobId" element={<JobDetailPage />} />
      </Routes>
    </div>
  )
}

export default App
