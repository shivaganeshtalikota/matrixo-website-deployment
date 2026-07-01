'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaUsers, 
  FaSearch, 
  FaFilter,
  FaEdit,
  FaHistory,
  FaUserCircle,
  FaCalendarAlt,
  FaBuilding,
  FaIdBadge,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaSave,
  FaTimes,
  FaChevronDown,
  FaChartBar,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaSortAlphaDown,
  FaSortAmountDown,
  FaEye,
  FaDownload,
  FaFilePdf,
  FaFileExcel,
  FaFileCsv,
  FaEnvelope,
  FaCheck,
  FaHome,
  FaListAlt,
  FaEyeSlash
} from 'react-icons/fa'
import { useEmployeeAuth, EmployeeProfile, AttendanceRecord, ActivityLog, LeaveRequest, isAdminOrSubAdmin, formatDate, Holiday } from '@/lib/employeePortalContext'
import { Card, Button, Input, Select, Badge, Avatar, Modal, Spinner, EmptyState, Tabs, ProfileInfo, ProfileInfoData, employeeToProfileData, getLocalProfileImage } from './ui'
import { toast } from 'sonner'
import { Timestamp } from 'firebase/firestore'
import EventVisibilityManager from './EventVisibilityManager'

// ============================================
// LOCAL PROFILE IMAGE FALLBACKS (use centralized getLocalProfileImage from ui)
// ============================================
const getEmpProfileImage = getLocalProfileImage

// ============================================
// TYPES
// ============================================

interface EmployeeWithStats extends EmployeeProfile {
  attendancePercentage: number
  presentDays: number
  absentDays: number
  lateDays: number
  onDutyDays: number
  unauthLeaveDays: number
  wfhDays: number
  totalDays: number
  recentAttendance: AttendanceRecord[]
}

// ============================================
// EMPLOYEE PROFILE MODAL
// ============================================

function EmployeeProfileModal({
  employee,
  isOpen,
  onClose
}: {
  employee: EmployeeWithStats | null
  isOpen: boolean
  onClose: () => void
}) {
  const { getEmployeeAttendanceHistory } = useEmployeeAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [modifyingRecord, setModifyingRecord] = useState<AttendanceRecord | null>(null)
  const [stats, setStats] = useState({
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    onDutyDays: 0,
    unauthLeaveDays: 0,
    totalDays: 0,
    attendancePercentage: 0
  })

  // Load attendance history when modal opens
  useEffect(() => {
    if (employee) {
      setLoading(true)
      getEmployeeAttendanceHistory(employee.employeeId, 30)
        .then((history) => {
          setAttendanceHistory(history)
          // Calculate stats from history
          const present = history.filter(r => r.status === 'P' || r.status === 'W').length
          const absent = history.filter(r => r.status === 'A').length
          const leave = history.filter(r => r.status === 'L').length
          const onDuty = history.filter(r => r.status === 'O').length
          const unauthLeave = history.filter(r => r.status === 'U').length
          const total = history.length
          const percentage = total > 0 ? ((present + onDuty) / total) * 100 : 0
          
          setStats({
            presentDays: present,
            absentDays: absent,
            lateDays: leave,
            onDutyDays: onDuty,
            unauthLeaveDays: unauthLeave,
            totalDays: total,
            attendancePercentage: percentage
          })
        })
        .finally(() => setLoading(false))
    }
  }, [employee, getEmployeeAttendanceHistory])

  if (!employee) return null

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp?.toDate) return '-'
    return timestamp.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Format date string (YYYY-MM-DD) to readable format
  const formatDateString = (dateStr: string) => {
    if (!dateStr) return '-'
    const parts = dateStr.split('-')
    if (parts.length !== 3) return dateStr
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timestamp: Timestamp) => {
    if (!timestamp?.toDate) return '-'
    return timestamp.toDate().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatHistoryTime = (record: AttendanceRecord) => {
    if (record.status !== 'A') return formatTime(record.timestamp)
    if (!record.timestamp?.toDate) return '-'
    const absentTime = new Date(record.timestamp.toDate())
    absentTime.setHours(23, 59, 0, 0)
    return absentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Employee Profile"
      size="xl"
    >
      {/* Employee Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 p-4 sm:p-5 bg-gradient-to-r from-neutral-800/80 to-neutral-900/80 backdrop-blur-xl rounded-xl sm:rounded-2xl mb-4 sm:mb-6 border border-white/10">
        <div className="relative">
          <Avatar src={getEmpProfileImage(employee.profileImage, employee.employeeId)} name={employee.name} size="xl" showBorder={false} />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-neutral-900" />
        </div>
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <h3 className="text-xl sm:text-2xl font-bold text-white truncate">{employee.name}</h3>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
            <Badge variant="primary">{employee.employeeId}</Badge>
            {employee.department && employee.department !== employee.role && <Badge variant="info">{employee.department}</Badge>}
            <Badge variant={isAdminOrSubAdmin(employee.role) ? 'warning' : 'default'}>
              {employee.role === 'admin' ? '👑 Admin' : employee.role === 'sub-admin' ? '⭐ Sub-Admin' : employee.role}
            </Badge>
          </div>
          {employee.email && (
            <p className="text-sm text-neutral-400 mt-2 truncate">{employee.email}</p>
          )}
        </div>
        <div className="text-right bg-white/5 p-4 rounded-xl border border-white/10">
          {loading ? (
            <Spinner size="sm" />
          ) : (
            <>
              <div className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-cyan-400 bg-clip-text text-transparent">
                {stats.attendancePercentage.toFixed(1)}%
              </div>
              <p className="text-xs text-neutral-400 mt-1">Attendance Rate</p>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'notes', label: `Daily Reports (${attendanceHistory.filter(r => r.notes).length})` },
          { id: 'history', label: `Attendance History (${attendanceHistory.length})` }
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Tab Content */}
      <div className="mt-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : activeTab === 'overview' ? (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="p-4 bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-xl text-center">
                <div className="text-2xl font-bold text-green-400">{stats.presentDays}</div>
                <p className="text-sm text-neutral-400">Present</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 rounded-xl text-center">
                <div className="text-2xl font-bold text-red-400">{stats.absentDays}</div>
                <p className="text-sm text-neutral-400">Absent</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-xl text-center">
                <div className="text-2xl font-bold text-amber-400">{stats.lateDays}</div>
                <p className="text-sm text-neutral-400">Leave</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl text-center">
                <div className="text-2xl font-bold text-blue-400">{stats.onDutyDays}</div>
                <p className="text-sm text-neutral-400">On Duty</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 rounded-xl text-center">
                <div className="text-2xl font-bold text-orange-400">{stats.unauthLeaveDays}</div>
                <p className="text-sm text-neutral-400">Unauth. Leave</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-neutral-500/20 to-neutral-600/10 border border-neutral-500/30 rounded-xl text-center">
                <div className="text-2xl font-bold text-neutral-300">{stats.totalDays}</div>
                <p className="text-sm text-neutral-400">Total</p>
              </div>
            </div>

            {/* Recent Attendance (Last 10) */}
            <div>
              <h4 className="font-semibold text-white mb-3">Recent Attendance (Last 10)</h4>
              {attendanceHistory.length === 0 ? (
                <p className="text-neutral-500 text-center py-4">No attendance records found</p>
              ) : (
                <div className="space-y-2">
                  {attendanceHistory.slice(0, 10).map((record, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-neutral-800/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant={
                          record.status === 'P' ? 'success' :
                          record.status === 'W' ? 'info' :
                          record.status === 'A' ? 'error' :
                          record.status === 'L' ? 'warning' :
                          record.status === 'U' ? 'error' : 'default'
                        }>
                          {record.status === 'P' ? 'Present' :
                           record.status === 'W' ? 'WFH' :
                           record.status === 'A' ? 'Absent' :
                           record.status === 'L' ? 'Leave' :
                           record.status === 'O' ? 'On Duty' :
                           record.status === 'H' ? 'Holiday' :
                           record.status === 'U' ? 'Unauth. Leave' : record.status}
                        </Badge>
                        <span className="text-neutral-300">{formatDateString(record.date)}</span>
                      </div>
                      <span className="text-sm text-neutral-500">{formatTime(record.timestamp)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'history' ? (
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size="lg" />
              </div>
            ) : attendanceHistory.length === 0 ? (
              <EmptyState
                icon={<FaHistory className="text-2xl" />}
                title="No attendance history"
                description="No records found for this employee"
              />
            ) : (
              <table className="w-full">
                <thead className="bg-neutral-800/50 sticky top-0">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium text-neutral-400">Date</th>
                    <th className="text-left p-3 text-sm font-medium text-neutral-400">Status</th>
                    <th className="text-left p-3 text-sm font-medium text-neutral-400">Time</th>
                    <th className="text-left p-3 text-sm font-medium text-neutral-400">Location</th>
                    <th className="text-left p-3 text-sm font-medium text-neutral-400">Modified</th>
                    <th className="text-center p-3 text-sm font-medium text-neutral-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceHistory.map((record, i) => (
                    <tr key={i} className="border-t border-neutral-700/50">
                      <td className="p-3 text-white">{formatDateString(record.date)}</td>
                      <td className="p-3">
                        <Badge variant={
                          record.status === 'P' ? 'success' :
                          record.status === 'W' ? 'info' :
                          record.status === 'A' ? 'error' :
                          record.status === 'L' ? 'warning' :
                          record.status === 'U' ? 'error' : 'default'
                        }>
                          {record.status === 'P' && record.locationVerified && (
                            <FaCheckCircle className="inline mr-1 text-xs" />
                          )}
                          {record.status === 'P' ? 'Present' :
                           record.status === 'W' ? 'W' :
                           record.status === 'A' ? 'Absent' :
                           record.status === 'L' ? 'Leave' :
                           record.status === 'O' ? 'On Duty' :
                           record.status === 'H' ? 'Holiday' :
                           record.status === 'U' ? 'Unauth. Leave' : record.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-neutral-400">{formatHistoryTime(record)}</td>
                      <td className="p-3">
                        {record.locationVerified ? (
                          <Badge variant="success" size="sm">
                            <FaMapMarkerAlt className="mr-1" /> Verified
                          </Badge>
                        ) : record.latitude ? (
                          <Badge variant="warning" size="sm">Not in range</Badge>
                        ) : (
                          <span className="text-neutral-500">-</span>
                        )}
                      </td>
                      <td className="p-3">
                        {record.modifiedBy ? (
                          <div className="text-xs">
                            <div className="text-amber-400">By {record.modifiedByName || record.modifiedBy}</div>
                            {record.modifiedAt && (
                              <div className="text-neutral-500">
                                {new Date(record.modifiedAt.toDate()).toLocaleString()}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-neutral-500">-</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <Button
                          size="sm"
                          variant="secondary"
                          icon={<FaEdit />}
                          onClick={() => setModifyingRecord(record)}
                        >
                          Modify
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : activeTab === 'notes' ? (
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size="lg" />
              </div>
            ) : attendanceHistory.filter(r => r.notes).length === 0 ? (
              <EmptyState
                icon={<FaListAlt className="text-2xl" />}
                title="No daily reports"
                description="This employee has not submitted any daily reports yet"
              />
            ) : (
              <div className="space-y-3">
                {attendanceHistory
                  .filter(r => r.notes)
                  .map((record, i) => (
                    <div key={i} className="p-4 bg-neutral-800/30 rounded-xl border border-neutral-700/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-neutral-300">{formatDateString(record.date)}</span>
                          <Badge size="sm" variant={
                            record.status === 'P' ? 'success' :
                            record.status === 'W' ? 'info' :
                            record.status === 'A' ? 'error' :
                            record.status === 'L' ? 'warning' : 'default'
                          }>
                            {record.status === 'P' ? 'Present' :
                             record.status === 'W' ? 'WFH' :
                             record.status === 'A' ? 'Absent' :
                             record.status === 'L' ? 'Leave' :
                             record.status === 'O' ? 'On Duty' : record.status}
                          </Badge>
                        </div>
                        <span className="text-xs text-neutral-500">{formatTime(record.timestamp)}</span>
                      </div>
                      <p className="text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed">{record.notes}</p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ) : null}
      </div>
      
      {/* Modify Attendance Modal */}
      {modifyingRecord && (
        <EditAttendanceModal
          record={modifyingRecord}
          employee={employee}
          onClose={() => setModifyingRecord(null)}
          onSave={async () => {
            setModifyingRecord(null)
            if (employee) {
              setLoading(true)
              getEmployeeAttendanceHistory(employee.employeeId, 90)
                .then((history) => {
                  setAttendanceHistory(history)
                })
                .finally(() => setLoading(false))
            }
          }}
        />
      )}
      
      {/* Close Button at bottom */}
      <div className="flex justify-end mt-6 pt-4 border-t border-white/10">
        <Button variant="secondary" onClick={onClose} icon={<FaTimes />}>
          Close (ESC)
        </Button>
      </div>
    </Modal>
  )
}

// ============================================
// EDIT ATTENDANCE MODAL
// ============================================

function EditAttendanceModal({
  record,
  employee,
  onClose,
  onSave
}: {
  record: AttendanceRecord | null
  employee: EmployeeProfile | null
  onClose: () => void
  onSave: () => void
}) {
  const { updateEmployeeAttendance, employee: currentAdmin } = useEmployeeAuth()
  const [status, setStatus] = useState(record?.status || 'present')
  const [saving, setSaving] = useState(false)

  if (!record || !employee) return null

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateEmployeeAttendance(
        record.id!,
        { status: status as 'P' | 'A' | 'L' | 'O' | 'H' | 'U' },
        'Attendance updated by admin' // Default reason
      )
      toast.success('Attendance updated')
      onSave()
      onClose()
    } catch (error) {
      toast.error('Failed to update attendance')
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp?.toDate) return '-'
    return timestamp.toDate().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Edit Attendance"
      size="md"
    >
      <div className="space-y-4">
        {/* Employee Info */}
        <div className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg">
          <Avatar src={getEmpProfileImage(employee.profileImage, employee.employeeId)} name={employee.name} size="md" showBorder={false} />
          <div>
            <p className="font-medium text-white">{employee.name}</p>
            <p className="text-sm text-neutral-400">{employee.employeeId}</p>
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-1">Date</label>
          <p className="text-white">{formatDate(record.timestamp)}</p>
        </div>

        {/* Current Status */}
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Current Status</label>
            <Badge variant={
              record.status === 'P' ? 'success' :
              record.status === 'A' ? 'error' :
              record.status === 'L' ? 'warning' :
              record.status === 'U' ? 'error' :
              record.status === 'W' ? 'info' : 'default'
            }>
              {record.status === 'P' ? 'Present' :
               record.status === 'A' ? 'Absent' :
               record.status === 'L' ? 'Leave' :
               record.status === 'O' ? 'On Duty' :
               record.status === 'H' ? 'Holiday' :
               record.status === 'U' ? 'Unauth. Leave' :
               record.status === 'W' ? 'Work From Home' : record.status}
            </Badge>
          </div>
          <div className="text-2xl text-neutral-500">→</div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-neutral-400 mb-1">New Status</label>
            <Select
              value={status}
              onChange={(value) => setStatus(value)}
              options={[
                { value: 'P', label: '✅ Present' },
                { value: 'A', label: '❌ Absent' },
                { value: 'L', label: '🏖️ Leave' },
                { value: 'O', label: '💼 On Duty' },
                { value: 'H', label: '🎉 Holiday' },
                { value: 'U', label: '⚠️ Unauthorised Leave' },
                { value: 'W', label: '🏠 Work From Home' }
              ]}
            />
          </div>
        </div>

        {/* Audit Notice */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <div className="flex items-start gap-2">
            <FaExclamationTriangle className="text-amber-400 mt-1" />
            <div>
              <p className="text-sm text-amber-300">
                This change will be logged as modified by:
              </p>
              <p className="text-sm font-medium text-white mt-1">
                {currentAdmin?.name} ({currentAdmin?.employeeId})
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            loading={saving}
            icon={<FaSave />}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// ============================================
// ATTENDANCE TABLE
// ============================================

function AttendanceTable({
  attendanceRecords,
  employees,
  employeesWithStats,
  onEditRecord,
  onViewProfile
}: {
  attendanceRecords: AttendanceRecord[]
  employees: EmployeeProfile[]
  employeesWithStats: EmployeeWithStats[]
  onEditRecord: (record: AttendanceRecord, employee: EmployeeProfile) => void
  onViewProfile: (employee: EmployeeWithStats) => void
}) {
  const getEmployee = (empId: string) => employees.find(e => e.employeeId === empId)
  const getEmployeeWithStats = (empId: string) => employeesWithStats.find(e => e.employeeId === empId)

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp?.toDate) return '-'
    return timestamp.toDate().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (timestamp: Timestamp) => {
    if (!timestamp?.toDate) return '-'
    return timestamp.toDate().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (attendanceRecords.length === 0) {
    return (
      <EmptyState
        icon={<FaHistory className="text-2xl" />}
        title="No records found"
        description="Try adjusting your filters"
      />
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-neutral-800/50">
          <tr>
            <th className="text-left p-3 text-sm font-medium text-neutral-400">Employee</th>
            <th className="text-left p-3 text-sm font-medium text-neutral-400">Date</th>
            <th className="text-left p-3 text-sm font-medium text-neutral-400">Time</th>
            <th className="text-left p-3 text-sm font-medium text-neutral-400">Status</th>
            <th className="text-left p-3 text-sm font-medium text-neutral-400">Location</th>
            <th className="text-left p-3 text-sm font-medium text-neutral-400">Modified By</th>
            <th className="text-right p-3 text-sm font-medium text-neutral-400">Actions</th>
          </tr>
        </thead>
        <tbody>
          {attendanceRecords.map((record) => {
            const emp = getEmployee(record.employeeId)
            if (!emp) return null
            
            return (
              <motion.tr
                key={record.id || `${record.employeeId}_${record.date}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-t border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={getEmpProfileImage(emp.profileImage, emp.employeeId)} name={emp.name} size="sm" showBorder={false} />
                    <div>
                      <p className="font-medium text-white">{emp.name}</p>
                      <p className="text-xs text-neutral-500">{emp.employeeId}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-neutral-300">{formatDate(record.timestamp)}</td>
                <td className="p-3 text-neutral-400">{formatTime(record.timestamp)}</td>
                <td className="p-3">
                  <Badge variant={
                    record.status === 'P' ? 'success' :
                    record.status === 'A' ? 'error' :
                    record.status === 'L' ? 'warning' :
                    record.status === 'U' ? 'error' :
                    record.status === 'W' ? 'info' : 'default'
                  }>
                    {record.status === 'P' ? 'Present' :
                     record.status === 'A' ? 'Absent' :
                     record.status === 'L' ? 'Leave' :
                     record.status === 'O' ? 'On Duty' :
                     record.status === 'H' ? 'Holiday' :
                     record.status === 'U' ? 'Unauth. Leave' :
                     record.status === 'W' ? '🏠 Work From Home' : record.status}
                  </Badge>
                </td>
                <td className="p-3">
                  {record.locationVerified ? (
                    <Badge variant="success" size="sm">
                      <FaMapMarkerAlt className="mr-1" /> Verified
                    </Badge>
                  ) : record.latitude ? (
                    <Badge variant="warning" size="sm">Out of range</Badge>
                  ) : (
                    <span className="text-neutral-500">-</span>
                  )}
                </td>
                <td className="p-3">
                  {record.modifiedBy ? (
                    <div>
                      <p className="text-sm text-amber-400">{record.modifiedByName || record.modifiedBy}</p>
                      {record.modificationReason && (
                        <p className="text-xs text-neutral-500 truncate max-w-32">{record.modificationReason}</p>
                      )}
                    </div>
                  ) : (
                    <span className="text-neutral-500">-</span>
                  )}
                </td>
                <td className="p-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => {
                        const empWithStats = getEmployeeWithStats(emp.employeeId)
                        if (empWithStats) {
                          onViewProfile(empWithStats)
                        }
                      }}
                      className="p-2 text-neutral-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-all"
                      title="View Profile"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => onEditRecord(record, emp)}
                      className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                      title="Edit Attendance"
                    >
                      <FaEdit />
                    </button>
                  </div>
                </td>
              </motion.tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ============================================
// EMPLOYEE LIST
// ============================================

function EmployeeList({
  employees,
  onViewProfile
}: {
  employees: EmployeeWithStats[]
  onViewProfile: (employee: EmployeeWithStats) => void
}) {
  if (employees.length === 0) {
    return (
      <EmptyState
        icon={<FaUsers className="text-2xl" />}
        title="No employees found"
        description="Try adjusting your filters"
      />
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {employees.map((emp) => (
        <motion.div
          key={emp.employeeId}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card hover className="relative">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar src={getEmpProfileImage(emp.profileImage, emp.employeeId)} name={emp.name} size="lg" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-neutral-900 rounded-full flex items-center justify-center border border-primary-500/50">
                    <span className="text-[8px] font-bold text-primary-400">M</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{emp.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge size="sm">{emp.employeeId}</Badge>
                    {emp.department && (
                      <Badge variant="info" size="sm">{emp.department}</Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${
                    emp.attendancePercentage >= 90 ? 'text-green-400' :
                    emp.attendancePercentage >= 75 ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {emp.attendancePercentage.toFixed(0)}%
                  </div>
                  <p className="text-xs text-neutral-500">Attendance</p>
                </div>
              </div>
            
            <div className="mt-4 pt-4 border-t border-neutral-700/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-400">P: {emp.presentDays}</span>
                <span className="text-red-400">A: {emp.absentDays}</span>
                <span className="text-amber-400">L: {emp.lateDays}</span>
                <span className="text-blue-400">O: {emp.onDutyDays}</span>
                <button 
                  onClick={() => onViewProfile(emp)}
                  className="text-primary-400 hover:text-primary-300"
                >
                  <FaEye className="mr-1 inline" /> View
                </button>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

// ============================================
// EXPORT REPORT MODAL
// ============================================

function ExportReportModal({
  isOpen,
  onClose,
  employees,
  employeesWithStats
}: {
  isOpen: boolean
  onClose: () => void
  employees: EmployeeProfile[]
  employeesWithStats: EmployeeWithStats[]
}) {
  const { getEmployeeAttendanceHistory } = useEmployeeAuth()
  const [exportType, setExportType] = useState<'all' | 'individual'>('all')
  const [selectedEmployee, setSelectedEmployee] = useState<string>('')
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [dateRange, setDateRange] = useState<'full' | 'monthly' | 'custom'>('monthly')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [format, setFormat] = useState<'pdf' | 'csv' | 'xlsx'>('pdf')
  const [exporting, setExporting] = useState(false)

  // Filter employees based on search
  const filteredEmployees = useMemo(() => {
    if (!employeeSearch.trim()) return employees
    const query = employeeSearch.toLowerCase()
    return employees.filter(e => 
      (e.name || '').toLowerCase().includes(query) ||
      (e.employeeId || '').toLowerCase().includes(query) ||
      (e.department || '').toLowerCase().includes(query)
    )
  }, [employees, employeeSearch])

  // Set default dates (current month)
  useEffect(() => {
    if (dateRange === 'monthly') {
      const now = new Date()
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      setStartDate(firstDay.toISOString().split('T')[0])
      setEndDate(lastDay.toISOString().split('T')[0])
    } else if (dateRange === 'full') {
      setStartDate('')
      setEndDate('')
    }
  }, [dateRange])

  // Reset selection when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedEmployee('')
      setEmployeeSearch('')
    }
  }, [isOpen])

  const handleExport = async () => {
    setExporting(true)
    try {
      let dataToExport: EmployeeWithStats[] = []
      
      // Determine which employees to export
      if (exportType === 'all') {
        dataToExport = employeesWithStats
      } else if (selectedEmployee) {
        const emp = employeesWithStats.find(e => e.employeeId === selectedEmployee)
        if (emp) dataToExport = [emp]
      }

      if (dataToExport.length === 0) {
        toast.error('No data to export')
        setExporting(false)
        return
      }

      // Fetch detailed attendance for date range
      const detailedData = await Promise.all(
        dataToExport.map(async (emp) => {
          let history: AttendanceRecord[] = []
          if (dateRange === 'full') {
            history = await getEmployeeAttendanceHistory(emp.employeeId, 365)
          } else if (startDate && endDate) {
            history = await getEmployeeAttendanceHistory(emp.employeeId, 365)
            // Filter by date range
            history = history.filter(record => {
              const recordDate = record.date || record.timestamp?.toDate?.()?.toISOString?.()?.split('T')[0]
              return recordDate && recordDate >= startDate && recordDate <= endDate
            })
          } else {
            history = emp.recentAttendance
          }
          
          return { ...emp, attendanceHistory: history }
        })
      )

      // Generate export based on format
      if (format === 'csv') {
        exportToCSV(detailedData, startDate, endDate)
      } else if (format === 'xlsx') {
        exportToExcel(detailedData, startDate, endDate)
      } else if (format === 'pdf') {
        exportToPDF(detailedData, startDate, endDate)
      }

      toast.success('Report exported successfully')
      
      // Reset selection after export
      setSelectedEmployee('')
      setEmployeeSearch('')
      
      onClose()
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export report')
    } finally {
      setExporting(false)
    }
  }

  const exportToCSV = (data: any[], start: string, end: string) => {
    const rows = []
    
    // Header
    rows.push(['Employee Report'])
    rows.push([`Date Range: ${start || 'All Time'} to ${end || 'Present'}`])
    rows.push([`Generated: ${new Date().toLocaleString()}`])
    rows.push([])
    
    // Summary section
    rows.push(['SUMMARY'])
    rows.push(['Employee ID', 'Name', 'Department', 'Role', 'Attendance %', 'Present', 'Absent', 'Leave', 'On Duty', 'Total Days', 'Verified Days', 'Unverified Days'])
    
    data.forEach(emp => {
      const verifiedDays = emp.attendanceHistory?.filter((r: AttendanceRecord) => r.locationVerified === true).length || 0
      const unverifiedDays = emp.attendanceHistory?.filter((r: AttendanceRecord) => r.locationVerified === false).length || 0
      
      rows.push([
        emp.employeeId,
        emp.name,
        emp.department || 'N/A',
        emp.role,
        `${emp.attendancePercentage.toFixed(2)}%`,
        emp.presentDays,
        emp.absentDays,
        emp.lateDays,
        emp.onDutyDays,
        emp.totalDays,
        verifiedDays,
        unverifiedDays
      ])
    })
    
    rows.push([])
    
    // Detailed attendance records
    data.forEach(emp => {
      rows.push([])
      rows.push([`DETAILED ATTENDANCE: ${emp.name} (${emp.employeeId})`])
      rows.push(['Date', 'Status', 'Check In', 'Verification', 'Notes'])
      
      emp.attendanceHistory?.forEach((record: AttendanceRecord) => {
        const date = record.date || record.timestamp?.toDate?.()?.toISOString?.()?.split('T')[0] || 'N/A'
        const time = record.status === 'A' ? '-' : (record.timestamp?.toDate?.()?.toLocaleTimeString() || 'N/A')
        const statusMap: Record<string, string> = { 'P': 'Present', 'A': 'Absent', 'L': 'Leave', 'O': 'On Duty', 'U': 'Unauth. Leave', 'W': 'Work From Home' }
        const verification = record.locationVerified === true ? 'Verified' : record.locationVerified === false ? 'Not in range' : '-'
        
        rows.push([
          date,
          statusMap[record.status] || record.status,
          time,
          verification,
          record.notes || ''
        ])
      })
    })
    
    // Convert to CSV
    const csv = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `employee-report-${start || 'all'}-${end || 'present'}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportToExcel = (data: any[], start: string, end: string) => {
    // Create HTML table (browser will convert to Excel)
    let html = '<table border="1" cellspacing="0" cellpadding="5">'
    
    // Title
    html += '<tr><th colspan="10" style="background:#4f46e5;color:white;font-size:16px;">Employee Attendance Report</th></tr>'
    html += `<tr><td colspan="10">Date Range: ${start || 'All Time'} to ${end || 'Present'}</td></tr>`
    html += `<tr><td colspan="10">Generated: ${new Date().toLocaleString()}</td></tr>`
    html += '<tr><td colspan="10"></td></tr>'
    
    // Summary
    html += '<tr><th colspan="10" style="background:#6b7280;color:white;">SUMMARY</th></tr>'
    html += '<tr style="background:#9ca3af;font-weight:bold;"><td>Employee ID</td><td>Name</td><td>Department</td><td>Role</td><td>Attendance %</td><td>Present</td><td>Absent</td><td>Leave</td><td>On Duty</td><td>Total Days</td></tr>'
    
    data.forEach(emp => {
      const verifiedDays = emp.attendanceHistory?.filter((r: AttendanceRecord) => r.locationVerified === true).length || 0
      const unverifiedDays = emp.attendanceHistory?.filter((r: AttendanceRecord) => r.locationVerified === false).length || 0
      const color = emp.attendancePercentage >= 90 ? '#10b981' : emp.attendancePercentage >= 75 ? '#f59e0b' : '#ef4444'
      html += `<tr><td>${emp.employeeId}</td><td>${emp.name}</td><td>${emp.department || 'N/A'}</td><td>${emp.role}</td><td style="color:${color};font-weight:bold;">${emp.attendancePercentage.toFixed(2)}%</td><td>${emp.presentDays}</td><td>${emp.absentDays}</td><td>${emp.lateDays}</td><td>${emp.onDutyDays}</td><td>${emp.totalDays}</td></tr>`
      html += `<tr><td colspan="5" style="text-align:right;background:#f3f4f6;"><em>Location Verification:</em></td><td colspan="2" style="background:#f3f4f6;color:#10b981;font-weight:bold;">✓ Verified: ${verifiedDays}</td><td colspan="3" style="background:#f3f4f6;color:#f59e0b;font-weight:bold;">⚠ Not in range: ${unverifiedDays}</td></tr>`
    })
    
    // Detailed records
    data.forEach(emp => {
      html += '<tr><td colspan="10"></td></tr>'
      html += `<tr><th colspan="10" style="background:#4f46e5;color:white;">DETAILED ATTENDANCE: ${emp.name} (${emp.employeeId})</th></tr>`
      html += '<tr style="background:#9ca3af;font-weight:bold;"><td>Date</td><td>Status</td><td>Check In</td><td>Verification</td><td colspan="6">Notes</td></tr>'
      
      emp.attendanceHistory?.forEach((record: AttendanceRecord) => {
        const date = record.date || record.timestamp?.toDate?.()?.toISOString?.()?.split('T')[0] || 'N/A'
        const time = record.status === 'A' ? '-' : (record.timestamp?.toDate?.()?.toLocaleTimeString() || 'N/A')
        const statusMap: Record<string, string> = { 'P': 'Present', 'A': 'Absent', 'L': 'Leave', 'O': 'On Duty', 'U': 'Unauth. Leave', 'W': 'Work From Home' }
        const statusColor = record.status === 'P' ? '#10b981' : record.status === 'A' ? '#ef4444' : record.status === 'L' ? '#f59e0b' : record.status === 'U' ? '#f97316' : record.status === 'W' ? '#06b6d4' : '#3b82f6'
        const verification = record.locationVerified === true ? 'Verified' : record.locationVerified === false ? 'Not in range' : '-'
        const verificationColor = record.locationVerified === true ? '#10b981' : record.locationVerified === false ? '#f59e0b' : '#6b7280'
        
        html += `<tr><td>${date}</td><td style="color:${statusColor};font-weight:bold;">${statusMap[record.status] || record.status}</td><td>${time}</td><td style="color:${verificationColor};font-weight:bold;">${verification}</td><td colspan="6">${record.notes || ''}</td></tr>`
      })
    })
    
    html += '</table>'
    
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `employee-report-${start || 'all'}-${end || 'present'}.xls`
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportToPDF = (data: any[], start: string, end: string) => {
    // Create printable HTML
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error('Please allow popups to download PDF')
      return
    }
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Employee Attendance Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #4f46e5; border-bottom: 3px solid #4f46e5; padding-bottom: 10px; }
          h2 { color: #6b7280; margin-top: 30px; }
          .meta { color: #6b7280; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #4f46e5; color: white; font-weight: bold; }
          .summary-row { background-color: #f3f4f6; }
          .high { color: #10b981; font-weight: bold; }
          .medium { color: #f59e0b; font-weight: bold; }
          .low { color: #ef4444; font-weight: bold; }
          .section-break { page-break-before: always; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>📊 Employee Attendance Report</h1>
        <div class="meta">
          <p><strong>Date Range:</strong> ${start || 'All Time'} to ${end || 'Present'}</p>
          <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Total Employees:</strong> ${data.length}</p>
        </div>
        
        <h2>📈 Summary</h2>
        <table>
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Role</th>
              <th>Attendance %</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Leave</th>
              <th>On Duty</th>
            </tr>
          </thead>
          <tbody>
    `
    
    data.forEach(emp => {
      const verifiedDays = emp.attendanceHistory?.filter((r: AttendanceRecord) => r.locationVerified === true).length || 0
      const unverifiedDays = emp.attendanceHistory?.filter((r: AttendanceRecord) => r.locationVerified === false).length || 0
      const colorClass = emp.attendancePercentage >= 90 ? 'high' : emp.attendancePercentage >= 75 ? 'medium' : 'low'
      html += `
        <tr class="summary-row">
          <td>${emp.employeeId}</td>
          <td>${emp.name}</td>
          <td>${emp.department || 'N/A'}</td>
          <td>${emp.role}</td>
          <td class="${colorClass}">${emp.attendancePercentage.toFixed(2)}%</td>
          <td>${emp.presentDays}</td>
          <td>${emp.absentDays}</td>
          <td>${emp.lateDays}</td>
          <td>${emp.onDutyDays}</td>
        </tr>
        <tr style="background-color:#f9fafb;">
          <td colspan="5" style="text-align:right;font-style:italic;color:#6b7280;">Location Verification:</td>
          <td colspan="2" style="color:#10b981;font-weight:bold;">✅ Verified: ${verifiedDays}</td>
          <td colspan="2" style="color:#f59e0b;font-weight:bold;">⚠️ Not in range: ${unverifiedDays}</td>
        </tr>
      `
    })
    
    html += '</tbody></table>'
    
    // Detailed attendance for each employee
    data.forEach((emp, index) => {
      html += `
        <div class="${index > 0 ? 'section-break' : ''}">
          <h2>📅 Detailed Attendance: ${emp.name} (${emp.employeeId})</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Check In Time</th>
                <th>Verification</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
      `
      
      emp.attendanceHistory?.forEach((record: AttendanceRecord) => {
        const date = record.date || record.timestamp?.toDate?.()?.toISOString?.()?.split('T')[0] || 'N/A'
        const time = record.status === 'A' ? '-' : (record.timestamp?.toDate?.()?.toLocaleTimeString() || 'N/A')
        const statusMap: Record<string, string> = { 
          'P': '✅ Present', 
          'A': '❌ Absent', 
          'L': '🏖️ Leave', 
          'O': '💼 On Duty',
          'U': '⚠️ Unauth. Leave',
          'W': '🏠 Work From Home'
        }
        const verification = record.locationVerified === true 
          ? '✅ Verified' 
          : record.locationVerified === false 
            ? '⚠️ Not in range' 
            : '-'
        const verificationColor = record.locationVerified === true ? '#10b981' : record.locationVerified === false ? '#f59e0b' : '#6b7280'
        
        html += `
          <tr>
            <td>${date}</td>
            <td>${statusMap[record.status] || record.status}</td>
            <td>${time}</td>
            <td style="color:${verificationColor};font-weight:bold;">${verification}</td>
            <td>${record.notes || '-'}</td>
          </tr>
        `
      })
      
      html += '</tbody></table></div>'
    })
    
    html += `
        <div style="margin-top: 40px; text-align: center; color: #6b7280; border-top: 1px solid #ddd; padding-top: 20px;">
          <p><em>Generated by matriXO Employee Portal on ${new Date().toLocaleString()}</em></p>
          <button onclick="window.print()" style="background: #4f46e5; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin-top: 10px;">Print / Save as PDF</button>
        </div>
      </body>
      </html>
    `
    
    printWindow.document.write(html)
    printWindow.document.close()
    
    // Auto-print after a short delay
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Attendance Report" size="md">
      <div className="space-y-6">
        {/* Export Type */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Export Data For</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setExportType('all')}
              className={`p-4 rounded-lg border-2 transition-all ${
                exportType === 'all'
                  ? 'border-primary-500 bg-primary-500/10 text-white'
                  : 'border-neutral-700 bg-neutral-800 text-neutral-400 hover:border-neutral-600'
              }`}
            >
              <FaUsers className="text-2xl mb-2 mx-auto" />
              <div className="font-medium">All Employees</div>
              <div className="text-xs mt-1">Complete report</div>
            </button>
            <button
              onClick={() => setExportType('individual')}
              className={`p-4 rounded-lg border-2 transition-all ${
                exportType === 'individual'
                  ? 'border-primary-500 bg-primary-500/10 text-white'
                  : 'border-neutral-700 bg-neutral-800 text-neutral-400 hover:border-neutral-600'
              }`}
            >
              <FaUserCircle className="text-2xl mb-2 mx-auto" />
              <div className="font-medium">Individual</div>
              <div className="text-xs mt-1">Single employee</div>
            </button>
          </div>
        </div>

        {/* Individual Employee Selection */}
        {exportType === 'individual' && (
          <div>
            <label className="block text-sm font-medium text-white mb-2">Select Employee</label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-3.5 text-neutral-500 z-10" />
              <input
                type="text"
                placeholder="Search by name, ID, or department..."
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              />
            </div>
            {employeeSearch && (
              <div className="mt-2 max-h-60 overflow-y-auto bg-neutral-800 border border-neutral-700 rounded-xl">
                {filteredEmployees.length === 0 ? (
                  <div className="p-4 text-center text-neutral-500">No employees found</div>
                ) : (
                  filteredEmployees.map((emp) => (
                    <button
                      key={emp.employeeId}
                      type="button"
                      onClick={() => {
                        setSelectedEmployee(emp.employeeId)
                        setEmployeeSearch('')
                      }}
                      className={`w-full p-3 text-left transition-all flex items-center gap-3 border-b border-neutral-700/50 last:border-0 ${
                        selectedEmployee === emp.employeeId
                          ? 'bg-primary-500/20 text-primary-400'
                          : 'hover:bg-neutral-700/50 text-white'
                      }`}
                    >
                      <Avatar src={getEmpProfileImage(emp.profileImage, emp.employeeId)} name={emp.name} size="sm" showBorder={false} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{emp.name}</div>
                        <div className="text-xs text-neutral-500 truncate">{emp.employeeId} • {emp.department}</div>
                      </div>
                      {selectedEmployee === emp.employeeId && (
                        <FaCheckCircle className="text-primary-500" />
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
            {selectedEmployee && (
              <div className="mt-2 p-3 bg-primary-500/10 border border-primary-500/30 rounded-lg flex items-center justify-between">
                <span className="text-sm text-white">
                  Selected: {employees.find(e => e.employeeId === selectedEmployee)?.name}
                </span>
                <button
                  onClick={() => setSelectedEmployee('')}
                  className="text-neutral-400 hover:text-white"
                >
                  <FaTimes />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Date Range</label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setDateRange('monthly')}
              className={`p-3 rounded-lg border-2 transition-all ${
                dateRange === 'monthly'
                  ? 'border-primary-500 bg-primary-500/10 text-white'
                  : 'border-neutral-700 bg-neutral-800 text-neutral-400 hover:border-neutral-600'
              }`}
            >
              <FaCalendarAlt className="text-xl mb-1 mx-auto" />
              <div className="text-sm font-medium">This Month</div>
            </button>
            <button
              onClick={() => setDateRange('custom')}
              className={`p-3 rounded-lg border-2 transition-all ${
                dateRange === 'custom'
                  ? 'border-primary-500 bg-primary-500/10 text-white'
                  : 'border-neutral-700 bg-neutral-800 text-neutral-400 hover:border-neutral-600'
              }`}
            >
              <FaFilter className="text-xl mb-1 mx-auto" />
              <div className="text-sm font-medium">Custom</div>
            </button>
            <button
              onClick={() => setDateRange('full')}
              className={`p-3 rounded-lg border-2 transition-all ${
                dateRange === 'full'
                  ? 'border-primary-500 bg-primary-500/10 text-white'
                  : 'border-neutral-700 bg-neutral-800 text-neutral-400 hover:border-neutral-600'
              }`}
            >
              <FaHistory className="text-xl mb-1 mx-auto" />
              <div className="text-sm font-medium">All Time</div>
            </button>
          </div>
        </div>

        {/* Custom Date Inputs */}
        {dateRange === 'custom' && (
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              label="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              type="date"
              label="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        )}

        {/* Export Format */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Export Format</label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setFormat('pdf')}
              className={`p-4 rounded-lg border-2 transition-all ${
                format === 'pdf'
                  ? 'border-primary-500 bg-primary-500/10 text-white'
                  : 'border-neutral-700 bg-neutral-800 text-neutral-400 hover:border-neutral-600'
              }`}
            >
              <FaFilePdf className="text-2xl mb-2 mx-auto text-red-500" />
              <div className="font-medium">PDF</div>
              <div className="text-xs mt-1">Print-ready</div>
            </button>
            <button
              onClick={() => setFormat('csv')}
              className={`p-4 rounded-lg border-2 transition-all ${
                format === 'csv'
                  ? 'border-primary-500 bg-primary-500/10 text-white'
                  : 'border-neutral-700 bg-neutral-800 text-neutral-400 hover:border-neutral-600'
              }`}
            >
              <FaFileCsv className="text-2xl mb-2 mx-auto text-green-500" />
              <div className="font-medium">CSV</div>
              <div className="text-xs mt-1">Spreadsheet</div>
            </button>
            <button
              onClick={() => setFormat('xlsx')}
              className={`p-4 rounded-lg border-2 transition-all ${
                format === 'xlsx'
                  ? 'border-primary-500 bg-primary-500/10 text-white'
                  : 'border-neutral-700 bg-neutral-800 text-neutral-400 hover:border-neutral-600'
              }`}
            >
              <FaFileExcel className="text-2xl mb-2 mx-auto text-emerald-500" />
              <div className="font-medium">Excel</div>
              <div className="text-xs mt-1">Formatted XLS</div>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-neutral-700">
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            loading={exporting}
            disabled={exportType === 'individual' && !selectedEmployee}
            className="flex-1"
            icon={<FaDownload />}
          >
            Export Report
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// ============================================
// LEAVE REQUESTS PANEL
// ============================================

function LeaveRequestsPanel() {
  const { getAllLeaveRequests, approveLeaveRequest, rejectLeaveRequest, employee } = useEmployeeAuth()
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('Pending')
  const [processing, setProcessing] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null)

  const fetchLeaveRequests = useCallback(async () => {
    setLoading(true)
    try {
      const requests = await getAllLeaveRequests()
      setLeaveRequests(requests)
    } catch (error) {
      console.error('Failed to fetch leave requests:', error)
      toast.error('Failed to load leave requests')
    } finally {
      setLoading(false)
    }
  }, [getAllLeaveRequests])

  useEffect(() => {
    fetchLeaveRequests()
  }, [fetchLeaveRequests])

  const handleApprove = async (request: LeaveRequest) => {
    if (!request.id) return
    setProcessing(request.id)
    try {
      await approveLeaveRequest(request.id)
      toast.success(`Leave approved for ${request.employeeName}`)
      fetchLeaveRequests()
    } catch (error) {
      toast.error('Failed to approve leave request')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (request: LeaveRequest) => {
    if (!request.id) return
    setProcessing(request.id)
    try {
      await rejectLeaveRequest(request.id)
      toast.success(`Leave rejected for ${request.employeeName} — marked as Unauthorised Leave`)
      fetchLeaveRequests()
    } catch (error) {
      toast.error('Failed to reject leave request')
    } finally {
      setProcessing(null)
    }
  }

  const filteredRequests = useMemo(() => {
    if (!filterStatus) return leaveRequests
    return leaveRequests.filter(r => r.status === filterStatus)
  }, [leaveRequests, filterStatus])

  const pendingCount = leaveRequests.filter(r => r.status === 'Pending').length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <Card padding="md">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-amber-400">{leaveRequests.filter(r => r.status === 'Pending').length}</div>
            <p className="text-sm text-neutral-400">Pending</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">{leaveRequests.filter(r => r.status === 'Approved').length}</div>
            <p className="text-sm text-neutral-400">Approved</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-400">{leaveRequests.filter(r => r.status === 'Rejected').length}</div>
            <p className="text-sm text-neutral-400">Rejected</p>
          </div>
        </div>
      </Card>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select
          value={filterStatus}
          onChange={(value) => setFilterStatus(value)}
          options={[
            { value: '', label: 'All Requests' },
            { value: 'Pending', label: '⏳ Pending' },
            { value: 'Approved', label: '✅ Approved' },
            { value: 'Rejected', label: '❌ Rejected' }
          ]}
        />
        <Button variant="secondary" onClick={fetchLeaveRequests} loading={loading}>
          Refresh
        </Button>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <EmptyState
          icon={<FaEnvelope className="text-2xl" />}
          title="No leave requests"
          description={filterStatus ? `No ${filterStatus.toLowerCase()} leave requests found` : 'No leave requests submitted yet'}
        />
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((request) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card padding="md" hover>
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Employee Info + Request Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div>
                        <h4 className="font-semibold text-white">{request.employeeName}</h4>
                        <p className="text-xs text-neutral-500">{request.employeeId}</p>
                      </div>
                      <Badge variant={
                        request.status === 'Pending' ? 'warning' :
                        request.status === 'Approved' ? 'success' : 'error'
                      } size="sm">
                        {request.status}
                      </Badge>
                    </div>

                    <div className="space-y-1 mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <FaCalendarAlt className="text-neutral-500" />
                        <span className="text-neutral-300">
                          Date: <span className="text-white font-medium">{request.date}</span>
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-neutral-400">Subject: </span>
                        <span className="text-white">{request.subject}</span>
                      </div>
                    </div>

                    {/* Expandable letter/reason */}
                    <button
                      onClick={() => setSelectedRequest(selectedRequest?.id === request.id ? null : request)}
                      className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
                    >
                      {selectedRequest?.id === request.id ? 'Hide Details ▲' : 'View Details ▼'}
                    </button>

                    <AnimatePresence>
                      {selectedRequest?.id === request.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 p-3 bg-neutral-800/50 rounded-lg space-y-2">
                            <div>
                              <p className="text-xs text-neutral-500 mb-1">Leave Letter</p>
                              <p className="text-sm text-neutral-300 whitespace-pre-wrap">{request.letter}</p>
                            </div>
                            {request.reason && (
                              <div>
                                <p className="text-xs text-neutral-500 mb-1">Reason</p>
                                <p className="text-sm text-neutral-300">{request.reason}</p>
                              </div>
                            )}
                            {request.reviewedByName && (
                              <div className="pt-2 border-t border-neutral-700">
                                <p className="text-xs text-neutral-500">
                                  {request.status === 'Approved' ? 'Approved' : 'Rejected'} by{' '}
                                  <span className="text-white">{request.reviewedByName}</span>
                                  {request.reviewedAt && (
                                    <> on {new Date(request.reviewedAt.toDate()).toLocaleString()}</>
                                  )}
                                </p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Action Buttons - Only for pending */}
                  {request.status === 'Pending' && (
                    <div className="flex sm:flex-col gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="primary"
                        icon={<FaCheck />}
                        onClick={() => handleApprove(request)}
                        loading={processing === request.id}
                        disabled={processing !== null}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={<FaTimes />}
                        onClick={() => handleReject(request)}
                        loading={processing === request.id}
                        disabled={processing !== null}
                        className="hover:!bg-red-500/20 hover:!text-red-400 hover:!border-red-500/30"
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>

                {/* Submitted timestamp */}
                <div className="mt-2 pt-2 border-t border-neutral-800">
                  <p className="text-xs text-neutral-500">
                    Submitted {request.createdAt ? new Date(request.createdAt.toDate()).toLocaleString() : 'Recently'}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================
// MAIN ADMIN PANEL COMPONENT
// ============================================

export function AdminPanel() {
  const {
    employee,
    getAllEmployees,
    getAllEmployeesAttendance,
    getEmployeeAttendanceHistory,
    runAutoAbsentJob,
    workMode,
    setGlobalWorkMode,
    holidays,
    isHoliday: checkIsHoliday,
  } = useEmployeeAuth()
  
  const [activeTab, setActiveTab] = useState('employees')
  const [employees, setEmployees] = useState<EmployeeProfile[]>([])
  const [employeesWithStats, setEmployeesWithStats] = useState<EmployeeWithStats[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  
  // Modals
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithStats | null>(null)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<{ record: AttendanceRecord, employee: EmployeeProfile } | null>(null)
  const [showExportModal, setShowExportModal] = useState(false)

  const handleViewProfile = useCallback((emp: EmployeeWithStats) => {
    setSelectedEmployee(emp)
    setIsProfileModalOpen(true)
  }, [])

  const handleCloseProfile = useCallback(() => {
    setIsProfileModalOpen(false)
    setTimeout(() => setSelectedEmployee(null), 300)
  }, [])

  // Auto-absent job: Run once when AdminPanel loads (marks yesterday's missing as absent)
  useEffect(() => {
    const runAutoAbsent = async () => {
      try {
        await runAutoAbsentJob()
        console.log('Auto-absent job completed')
      } catch (error) {
        // Silent fail - this runs in background
        console.log('Auto-absent skipped or failed:', error)
      }
    }
    runAutoAbsent()
  }, [runAutoAbsentJob])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      // Get last 90 days of attendance
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 90)
      
      const [emps, attendance] = await Promise.all([
        getAllEmployees(),
        getAllEmployeesAttendance(
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        )
      ])
      
      // Deduplicate employees by employeeId and hide test/developer accounts
      const uniqueEmps = emps.filter((emp, index, self) => 
        index === self.findIndex(e => e.employeeId === emp.employeeId) &&
        emp.employeeId !== 'Admin' // Hide admin test account from employee list
      )
      
      // Deduplicate attendance records - use employeeId + date as unique key
      // Priority: L (Leave) > P/W/O (Present/WFH/OnDuty) > H (Holiday) > U (Unauth) > A (Absent)
      const statusPriority = (s: string) => {
        if (s === 'L') return 4
        if (s === 'P' || s === 'W' || s === 'O') return 3
        if (s === 'H') return 2
        if (s === 'U') return 1
        return 0 // 'A'
      }
      
      const attendanceMap = new Map<string, AttendanceRecord>()
      attendance.forEach((record) => {
        // Create unique key from employeeId + date
        const dateStr = record.date || (record.timestamp?.toDate?.()?.toISOString?.()?.split('T')[0]) || ''
        const key = `${record.employeeId}_${dateStr}`
        
        const existing = attendanceMap.get(key)
        if (!existing) {
          attendanceMap.set(key, record)
        } else {
          const existingPriority = statusPriority(existing.status)
          const newPriority = statusPriority(record.status)
          
          if (newPriority > existingPriority) {
            attendanceMap.set(key, record)
          } else if (newPriority === existingPriority) {
            // Same priority, keep the one with more recent timestamp
            const existingTime = existing.timestamp?.toDate?.()?.getTime?.() || 0
            const currentTime = record.timestamp?.toDate?.()?.getTime?.() || 0
            if (currentTime > existingTime) {
              attendanceMap.set(key, record)
            }
          }
        }
      })
      const uniqueAttendance = Array.from(attendanceMap.values())
      
      // Filter out attendance records that are before each employee's joining date
      const joiningDateMap = new Map<string, string>()
      uniqueEmps.forEach(emp => {
        if (emp.joiningDate) joiningDateMap.set(emp.employeeId, emp.joiningDate)
      })
      const filteredAttendance = uniqueAttendance.filter(record => {
        const joinDate = joiningDateMap.get(record.employeeId)
        if (joinDate && record.date < joinDate) return false
        return true
      })
      
      setEmployees(uniqueEmps)
      setAttendanceRecords(filteredAttendance)
      
      // Calculate stats for each employee
      const empsWithStats: EmployeeWithStats[] = await Promise.all(
        uniqueEmps.map(async (emp) => {
          const history = await getEmployeeAttendanceHistory(emp.employeeId, 30)

          // Monthly attendance: filter to current month, use working days as denominator
          const now = new Date()
          const year = now.getFullYear()
          const month = now.getMonth()
          const monthEnd = new Date(year, month + 1, 0)

          // Determine effective start date (joining date or 1st of month)
          const joiningDate = emp.joiningDate ? new Date(emp.joiningDate) : null
          let startDate = new Date(year, month, 1)
          if (joiningDate && joiningDate.getFullYear() === year && joiningDate.getMonth() === month) {
            startDate = joiningDate
          }

          // Calculate working days (exclude Sundays + holidays)
          let totalWorkingDays = 0
          const cursor = new Date(startDate)
          cursor.setHours(0, 0, 0, 0)
          while (cursor <= monthEnd) {
            const dateStr = formatDate(cursor)
            const isSunday = cursor.getDay() === 0
            const isHol = checkIsHoliday(dateStr)
            if (!isSunday && !isHol) {
              totalWorkingDays++
            }
            cursor.setDate(cursor.getDate() + 1)
          }

          const startStr = formatDate(startDate)
          const endStr = formatDate(monthEnd)
          const monthlyHistory = history.filter(r => r.date >= startStr && r.date <= endStr)

          const presentDays = monthlyHistory.filter(r => r.status === 'P' || r.status === 'W').length
          const absentDays = monthlyHistory.filter(r => r.status === 'A').length
          const lateDays = monthlyHistory.filter(r => r.status === 'L').length
          const onDutyDays = monthlyHistory.filter(r => r.status === 'O').length
          const unauthLeaveDays = monthlyHistory.filter(r => r.status === 'U').length
          const totalDays = monthlyHistory.length
          // HR formula: (present+wfh + onDuty) / totalWorkingDays
          const attendancePercentage = totalWorkingDays > 0
            ? parseFloat(((presentDays + onDutyDays) / totalWorkingDays * 100).toFixed(2))
            : 0

          return {
            ...emp,
            attendancePercentage,
            presentDays,
            absentDays,
            lateDays,
            onDutyDays,
            unauthLeaveDays,
            wfhDays: 0,
            totalDays,
            recentAttendance: history.slice(0, 10)
          }
        })
      )
      
      setEmployeesWithStats(empsWithStats)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [getAllEmployees, getAllEmployeesAttendance, getEmployeeAttendanceHistory])

  // Fetch data on mount
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Get unique departments (including core departments)
  const departments = useMemo(() => {
    const deptSet = new Set(employees.map(e => e.department).filter(Boolean))
    const coreDepartments = ['Operations', 'Marketing', 'Management']
    coreDepartments.forEach(dept => deptSet.add(dept))
    return Array.from(deptSet).filter(d => d !== 'Admin').sort()
  }, [employees])

  // Filter attendance records
  const filteredAttendance = useMemo(() => {
    return attendanceRecords.filter(record => {
      // Search filter
      if (searchQuery) {
        const emp = employees.find(e => e.employeeId === record.employeeId)
        const query = searchQuery.toLowerCase()
        const matchesSearch = 
          (emp?.name || '').toLowerCase().includes(query) ||
          (record.employeeId || '').toLowerCase().includes(query)
        if (!matchesSearch) return false
      }
      
      // Department filter
      if (filterDepartment) {
        const emp = employees.find(e => e.employeeId === record.employeeId)
        if (emp?.department !== filterDepartment) return false
      }
      
      // Status filter
      if (filterStatus && record.status !== filterStatus) return false
      
      // Date filters
      if (filterDateFrom) {
        const recordDate = record.timestamp?.toDate?.()
        if (recordDate && recordDate < new Date(filterDateFrom)) return false
      }
      if (filterDateTo) {
        const recordDate = record.timestamp?.toDate?.()
        if (recordDate && recordDate > new Date(filterDateTo)) return false
      }
      
      return true
    })
  }, [attendanceRecords, employees, searchQuery, filterDepartment, filterStatus, filterDateFrom, filterDateTo])

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return employeesWithStats.filter(emp => {
      // Exclude admins from the employee grid
      if (emp.role === 'admin') return false

      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matches = 
          (emp.name || '').toLowerCase().includes(query) ||
          (emp.employeeId || '').toLowerCase().includes(query)
        if (!matches) return false
      }
      
      if (filterDepartment && emp.department !== filterDepartment) return false
      
      return true
    })
  }, [employeesWithStats, searchQuery, filterDepartment])

  const clearFilters = () => {
    setSearchQuery('')
    setFilterDepartment('')
    setFilterStatus('')
    setFilterDateFrom('')
    setFilterDateTo('')
  }

  const hasFilters = searchQuery || filterDepartment || filterStatus || filterDateFrom || filterDateTo

  if (!isAdminOrSubAdmin(employee?.role)) {
    return (
      <EmptyState
        icon={<FaExclamationTriangle className="text-2xl text-red-400" />}
        title="Access Denied"
        description="You don't have permission to access the admin panel"
      />
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <FaUsers className="text-primary-500" />
            Admin Panel
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base mt-1">
            Manage employees and attendance
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {/* WFH/WFO Toggle */}
          <div className="flex items-center gap-3 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg">
            <FaBuilding className={`text-sm ${workMode === 'WFO' ? 'text-primary-400' : 'text-neutral-500'}`} />
            <span className={`text-sm font-medium ${workMode === 'WFO' ? 'text-white' : 'text-neutral-500'}`}>WFO</span>
            <button
              onClick={async () => {
                const newMode = workMode === 'WFO' ? 'WFH' : 'WFO'
                await setGlobalWorkMode(newMode)
                toast.success(`Work mode switched to ${newMode === 'WFH' ? 'Work From Home' : 'Work From Office'}`)
              }}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                workMode === 'WFH' ? 'bg-cyan-500' : 'bg-neutral-600'
              }`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
                workMode === 'WFH' ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
            <FaHome className={`text-sm ${workMode === 'WFH' ? 'text-cyan-400' : 'text-neutral-500'}`} />
            <span className={`text-sm font-medium ${workMode === 'WFH' ? 'text-white' : 'text-neutral-500'}`}>WFH</span>
          </div>

          <Button
            variant="primary"
            onClick={() => setShowExportModal(true)}
            icon={<FaDownload />}
            className="w-full sm:w-auto"
          >
            Export Reports
          </Button>
          
          <Button
            variant="secondary"
            onClick={fetchData}
            loading={loading}
            className="w-full sm:w-auto"
          >
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'employees', label: 'All Employees' },
          { id: 'attendance', label: 'Recent Activity' },
          { id: 'events', label: 'Event Visibility' },
          { id: 'leaveRequests', label: 'Leave Requests' }
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Filters - hidden for leave requests tab */}
      {activeTab !== 'leaveRequests' && (
      <div className="relative" style={{ zIndex: 10 }}>
        <Card padding="md">
        <div className="flex items-center gap-2 mb-4">
          <FaFilter className="text-neutral-400" />
          <span className="font-medium text-white">Filters</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or ID..."
                className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          
          {/* Department */}
          <Select
            value={filterDepartment}
            onChange={(value) => setFilterDepartment(value)}
            options={[
              { value: '', label: 'All Departments' },
              ...departments.map(d => ({ value: d, label: d }))
            ]}
          />
          
          {/* Status (only for attendance tab) */}
          {activeTab === 'attendance' && (
            <Select
              value={filterStatus}
              onChange={(value) => setFilterStatus(value)}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'P', label: '✅ Present' },
                { value: 'A', label: '❌ Absent' },
                { value: 'L', label: '🏖️ Leave' },
                { value: 'O', label: '💼 On Duty' },
                { value: 'H', label: '🎉 Holiday' },
                { value: 'U', label: '⚠️ Unauth. Leave' },
                { value: 'W', label: '🏠 Work From Home' }
              ]}
            />
          )}

          {/* Clear Filters */}
          {hasFilters && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              icon={<FaTimes />}
            >
              Clear
            </Button>
          )}
        </div>
        
        {/* Date Range (only for attendance tab) */}
        {activeTab === 'attendance' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">From Date</label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">To Date</label>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        )}
      </Card>
      </div>
      )}

      {/* Stats Summary */}
      {activeTab === 'attendance' && !loading && (
        <Card padding="md">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <FaChartBar className="text-neutral-400" />
            <span className="font-medium text-white text-sm sm:text-base">Summary</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-white">{filteredAttendance.length}</div>
              <p className="text-xs sm:text-sm text-neutral-400">Total Records</p>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-green-400">
                {filteredAttendance.filter(r => r.status === 'P').length}
              </div>
              <p className="text-xs sm:text-sm text-neutral-400">Present</p>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-red-400">
                {filteredAttendance.filter(r => r.status === 'A').length}
              </div>
              <p className="text-xs sm:text-sm text-neutral-400">Absent</p>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-amber-400">
                {filteredAttendance.filter(r => r.status === 'L').length}
              </div>
              <p className="text-xs sm:text-sm text-neutral-400">Leave</p>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-orange-400">
                {filteredAttendance.filter(r => r.status === 'U').length}
              </div>
              <p className="text-xs sm:text-sm text-neutral-400">Unauth. Leave</p>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-cyan-400">
                {filteredAttendance.filter(r => r.status === 'W').length}
              </div>
              <p className="text-xs sm:text-sm text-neutral-400">WFH</p>
            </div>
          </div>
        </Card>
      )}

      {/* Content */}
      {activeTab === 'leaveRequests' ? (
        <LeaveRequestsPanel />
      ) : loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : activeTab === 'events' ? (
        <EventVisibilityManager />
      ) : activeTab === 'attendance' ? (
        <Card padding="none">
          <AttendanceTable
            attendanceRecords={filteredAttendance}
            employees={employees}
            employeesWithStats={employeesWithStats}
            onEditRecord={(record, emp) => setEditingRecord({ record, employee: emp })}
            onViewProfile={handleViewProfile}
          />
        </Card>
      ) : (
        <EmployeeList
          employees={filteredEmployees}
          onViewProfile={handleViewProfile}
        />
      )}

      {/* Modals */}
      <EmployeeProfileModal
        employee={selectedEmployee}
        isOpen={isProfileModalOpen}
        onClose={handleCloseProfile}
      />
      
      <EditAttendanceModal
        record={editingRecord?.record || null}
        employee={editingRecord?.employee || null}
        onClose={() => setEditingRecord(null)}
        onSave={fetchData}
      />
      
      <ExportReportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        employees={employees}
        employeesWithStats={employeesWithStats}
      />
    </div>
  )
}

export default AdminPanel
