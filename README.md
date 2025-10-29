# HR-360: AI-Powered Workforce & Payroll Automation System

A comprehensive full-stack HR management system built with Node.js, React, MySQL, and AI integration for resume screening and intelligent chatbot support.

## Project Overview

HR-360 is a complete HR solution designed to automate and streamline workforce management, recruitment, attendance tracking, payroll processing, and employee exit procedures. The system supports multiple user roles (Admin, HR, Employee, Candidate) with role-based access control.

## Key Features

### 1. Authentication & Authorization
- JWT-based secure authentication
- Role-based access control (Admin, HR, Employee, Candidate)
- Password encryption with bcryptjs
- Token-based session management

### 2. Recruitment Module
- Job posting creation and management
- Candidate registration and job applications
- Resume upload and AI-powered resume parsing
- Application tracking and status management
- Interview scheduling with date/time/mode selection
- Candidate shortlisting and rejection workflow

### 3. Attendance & Leave Management
- Daily check-in/check-out system
- Leave application with multiple leave types (Sick, Annual, Casual, Maternity)
- HR approval/rejection workflow
- Automatic attendance status updates
- Monthly attendance reports

### 4. Payroll Processing
- Automated salary calculation based on attendance
- Bonus and deduction management
- Payslip generation and employee access
- Monthly payroll records
- Salary structure management

### 5. Performance Management
- KPI creation and tracking
- Employee performance ratings
- Evaluation period management
- Performance review records

### 6. Exit Process
- Employee resignation submission
- Exit interview scheduling
- Department-wise clearance process
- Final settlement and data archiving
- Exit feedback collection

### 7. Admin Dashboard
- System-wide statistics and analytics
- User management and profile updates
- Employee directory
- Payroll overview
- Recruitment metrics

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **File Upload**: Multer
- **API Calls**: Axios

### Frontend
- **Library**: React 18
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Language**: TypeScript

### AI Integration
- **Resume Parser**: Python with spaCy NLP
- **Framework**: Flask
- **Libraries**: PyMuPDF (PDF extraction), spaCy (NLP)

## Project Structure

\`\`\`
hr-360/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MySQL connection pool
│   │   ├── models/                   # Data models (optional)
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── recruitmentRoutes.js
│   │   │   ├── interviewRoutes.js
│   │   │   ├── attendanceRoutes.js
│   │   │   ├── payrollRoutes.js
│   │   │   ├── leaveRoutes.js
│   │   │   ├── exitRoutes.js
│   │   │   └── adminRoutes.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── recruitmentController.js
│   │   │   ├── interviewController.js
│   │   │   ├── attendanceController.js
│   │   │   ├── payrollController.js
│   │   │   ├── leaveController.js
│   │   │   ├── exitController.js
│   │   │   └── adminController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   └── roleMiddleware.js
│   │   ├── app.js
│   │   └── server.js
│   ├── requirements/
│   │   ├── resume_parser.py
│   │   └── requirements.txt
│   ├── scripts/
│   │   └── schema.sql
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── EmployeeDashboard.tsx
│   │   │   ├── CandidateDashboard.tsx
│   │   │   └── HRDashboard.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
\`\`\`

## Database Schema

### Core Tables
- **users**: User accounts with roles
- **job_posts**: Job listings
- **applications**: Job applications
- **interviews**: Interview schedules
- **attendance**: Daily attendance records
- **leaves**: Leave applications
- **payroll**: Salary records
- **kpi**: Performance evaluations
- **resignations**: Resignation records
- **clearances**: Exit clearance tracking

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Recruitment
- `GET /api/recruitment/jobs` - Get all job posts
- `POST /api/recruitment/job-post` - Create job post (HR)
- `POST /api/recruitment/apply` - Apply for job (Candidate)
- `GET /api/recruitment/applications/:job_id` - Get applications (HR)
- `PUT /api/recruitment/application/:application_id` - Update application status (HR)

### Interviews
- `POST /api/interviews/schedule` - Schedule interview (HR)
- `GET /api/interviews/list` - Get all interviews (HR)
- `PUT /api/interviews/:interview_id` - Update interview status (HR)
- `GET /api/interviews/dashboard/stats` - Get dashboard stats (HR)

### Attendance
- `POST /api/attendance/check-in` - Check in (Employee)
- `POST /api/attendance/check-out` - Check out (Employee)
- `GET /api/attendance/records` - Get attendance records (HR)

### Payroll
- `POST /api/payroll/create` - Create payroll (HR)
- `GET /api/payroll/records` - Get payroll records (HR)
- `POST /api/payroll/calculate` - Calculate salary (HR)
- `GET /api/payroll/payslip/:payroll_id` - Get payslip (Employee)

### Leave
- `POST /api/leave/apply` - Apply for leave (Employee)
- `GET /api/leave/applications` - Get leave applications (HR)
- `PUT /api/leave/:leave_id` - Approve/reject leave (HR)

### Exit Process
- `POST /api/exit/resign` - Submit resignation (Employee)
- `GET /api/exit/resignations` - Get resignations (HR)
- `PUT /api/exit/resign/:resignation_id` - Approve resignation (HR)
- `POST /api/exit/clearance` - Submit clearance (HR)
- `GET /api/exit/clearances` - Get clearances (HR)
- `PUT /api/exit/clearance/:clearance_id` - Approve clearance (HR)

### Admin
- `GET /api/admin/users` - Get all users (Admin)
- `PUT /api/admin/users/:user_id` - Update user profile (Admin)
- `GET /api/admin/stats` - Get system statistics (Admin)
- `POST /api/admin/kpi` - Create KPI record (Admin)
- `GET /api/admin/kpi` - Get KPI records (Admin)

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- MySQL (v5.7+)
- Python (v3.8+)
- npm or yarn

### Backend Setup

1. **Install dependencies**
   \`\`\`bash
   cd backend
   npm install
   \`\`\`

2. **Configure environment variables**
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your database credentials
   \`\`\`

3. **Create database and tables**
   \`\`\`bash
   mysql -u root -p < scripts/schema.sql
   \`\`\`

4. **Start the backend server**
   \`\`\`bash
   npm run dev
   \`\`\`

### Python Resume Parser Setup

1. **Install Python dependencies**
   \`\`\`bash
   cd backend/requirements
   pip install -r requirements.txt
   python -m spacy download en_core_web_sm
   \`\`\`

2. **Start the Python server**
   \`\`\`bash
   python resume_parser.py
   \`\`\`

### Frontend Setup

1. **Install dependencies**
   \`\`\`bash
   cd frontend
   npm install
   \`\`\`

2. **Configure API URL**
   \`\`\`bash
   # Create .env file
   REACT_APP_API_URL=http://localhost:5000/api
   \`\`\`

3. **Start the frontend**
   \`\`\`bash
   npm start
   \`\`\`

## User Roles & Permissions

### Admin
- Full system access
- User management
- System statistics
- KPI management

### HR
- Recruitment management
- Interview scheduling
- Attendance tracking
- Payroll management
- Leave approval
- Exit process management

### Employee
- Check-in/check-out
- View payslips
- Apply for leave
- Submit resignation
- View profile

### Candidate
- Browse job postings
- Submit applications
- Upload resume
- Track application status

## Security Features

- JWT token-based authentication
- Password hashing with bcryptjs
- Role-based access control (RBAC)
- SQL injection prevention
- CORS configuration
- Secure file upload handling

## Future Enhancements

- Email notifications for leave approvals, interview schedules
- Advanced resume screening with ML models
- AI chatbot for HR queries
- Mobile app for attendance
- Performance analytics dashboard
- Integration with payroll systems
- Multi-language support
- Advanced reporting and exports

## Deployment

### Backend Deployment (Vercel/Render)
\`\`\`bash
npm run build
npm start
\`\`\`

### Frontend Deployment (Vercel)
\`\`\`bash
npm run build
# Deploy the build folder
\`\`\`

## Testing

Run unit tests for API endpoints:
\`\`\`bash
npm test
\`\`\`

## Troubleshooting

### Database Connection Issues
- Verify MySQL is running
- Check database credentials in .env
- Ensure database exists

### Resume Parser Errors
- Verify Python dependencies are installed
- Check Flask server is running on port 5001
- Ensure file upload permissions

### Authentication Issues
- Clear browser localStorage
- Verify JWT_SECRET in .env
- Check token expiration

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues or questions, please contact the development team or open an issue in the repository.

---

**Built with** Node.js, React, MySQL, and AI Integration
**Version**: 1.0.0
**Last Updated**: October 2025
"# HR-360-SYSTEM" 
