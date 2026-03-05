# Employee Database Components

## Backend Models
- **EmployeePersonnel.js** - Employee headcount/FTE by category, school, year
- **EmployeeAdminSupport.js** - Admin staff exempt/non-exempt counts
- **BenchmarkEmployee.js** - Employee benchmark submissions (category, counts, salary data)

## Backend Routes
- **routes/employee.js** - Two GET endpoints: `/api/employee/personnel`, `/api/employee/admin-support`
- **routes/admission.js** - Extended `/stats/peer-comparison` with Employee category support
- **routes/benchmarkEmployee.js** - POST endpoint for employee benchmark form submissions

## Frontend Hooks
- **useDashboardData.js** ⭐ **Core** - Fetches & aggregates employee data
  - Employee category mapping (20 codes → friendly names)
  - Calculates: totalEmployees, fullTimeRate, studentTeacherRatio, topCategory
  - Creates trend data and pie chart data

## Frontend Dashboard Components
- **DashboardControls.jsx** - Category selector (Admissions/Employee)
- **KpiCards.jsx** - 5 employee KPI cards (total, FT rate, S:T ratio, S:E ratio, top category)
- **ChartsSection.jsx** - Line chart (S:T ratio trend) + Pie chart (category distribution)
- **Dashboard.jsx** - Main orchestrator, passes employee data to sub-components
- **PeerComparison.jsx** - Bar chart comparing employee metrics vs peers

## Frontend Benchmark Components (Employee Data Support)
- **benchmark.jsx** - Benchmark page with dual-category selector (Admissions/Employee) for form switching
- **BenchmarkForm.jsx** - Dynamic form for both Admissions and Employee benchmark submissions
  - Admissions Fields: SCHOOL_ID, SCHOOL_YR_ID, GRADE_DEF_ID, capacity, enrollments, applications
  - Employee Fields: SCHOOL_ID, SCHOOL_YR_ID, EMP_CAT_CD (dropdown), employee counts, salary range
  - Voice-fill button integration for Admissions forms
- **BenchmarkVoiceFillButton.jsx** - Voice input modal for benchmark form
  - **Category-Based Theming**: Blue button for Admissions, Purple for Employee
  - Full voice filling functionality for Admissions benchmark entries
  - Displays transcript, pending changes, apply/undo options

## Key Features
- **Teacher Count**: Filters EMP_CAT_CD in ["EMPCAT_T", "EMPCAT_TS"]
- **Category Mapping**: EMPCAT_T→Teachers, EMPCAT_ADM→Admin, etc.
- **Ratios**: Student-to-Teacher, Student-to-Employee
- **Peer Comparison**: Total Employees, Full-Time Rate, Teacher Count

## Database Fields
- EmployeePersonnel: SCHOOL_ID, SCHOOL_YR_ID, EMP_CAT_CD, TOTAL_EMPLOYEES, FT_EMPLOYEES, SUBCONTRACT_FTE
- EmployeeAdminSupport: SCHOOL_ID, SCHOOL_YR_ID, NR_EXEMPT, NR_NONEXEMPT

