-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('Admin', 'HR', 'Employee', 'Candidate') NOT NULL,
  department VARCHAR(50),
  designation VARCHAR(50),
  phone VARCHAR(15),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create JobPost Table
CREATE TABLE IF NOT EXISTS job_posts (
  job_id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(100) NOT NULL,
  department VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  skills TEXT NOT NULL,
  deadline DATE NOT NULL,
  status ENUM('Open', 'Closed', 'On Hold') DEFAULT 'Open',
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- Create Applications Table
CREATE TABLE IF NOT EXISTS applications (
  application_id INT PRIMARY KEY AUTO_INCREMENT,
  candidate_id INT NOT NULL,
  job_id INT NOT NULL,
  resume VARCHAR(255),
  status ENUM('Pending', 'Shortlisted', 'Interview', 'Hired', 'Rejected') DEFAULT 'Pending',
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (candidate_id) REFERENCES users(user_id),
  FOREIGN KEY (job_id) REFERENCES job_posts(job_id)
);

-- Create Interviews Table
CREATE TABLE IF NOT EXISTS interviews (
  interview_id INT PRIMARY KEY AUTO_INCREMENT,
  application_id INT NOT NULL,
  mode ENUM('Online', 'In-Person') NOT NULL,
  interview_date DATE NOT NULL,
  interview_time TIME NOT NULL,
  status ENUM('Scheduled', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
  feedback TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(application_id)
);

-- Create Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
  attendance_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  check_in DATETIME,
  check_out DATETIME,
  attendance_date DATE NOT NULL,
  status ENUM('Present', 'Absent', 'Leave') DEFAULT 'Absent',
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Create Leave Table
CREATE TABLE IF NOT EXISTS leaves (
  leave_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  leave_type ENUM('Sick', 'Annual', 'Casual', 'Maternity') NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
  approved_by INT,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (approved_by) REFERENCES users(user_id)
);

-- Create Payroll Table
CREATE TABLE IF NOT EXISTS payroll (
  payroll_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  month VARCHAR(20) NOT NULL,
  basic_salary DECIMAL(10, 2) NOT NULL,
  bonus DECIMAL(10, 2) DEFAULT 0,
  deductions DECIMAL(10, 2) DEFAULT 0,
  net_salary DECIMAL(10, 2) NOT NULL,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Create KPI Table
CREATE TABLE IF NOT EXISTS kpi (
  kpi_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  evaluation_period VARCHAR(50) NOT NULL,
  rating DECIMAL(3, 2),
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Create Resignation Table
CREATE TABLE IF NOT EXISTS resignations (
  resignation_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  resignation_date DATE NOT NULL,
  reason TEXT,
  status ENUM('Pending', 'Approved', 'Completed') DEFAULT 'Pending',
  feedback TEXT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Create Clearance Table
CREATE TABLE IF NOT EXISTS clearances (
  clearance_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  department VARCHAR(50) NOT NULL,
  status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
  approval_feedback TEXT,
  approved_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);
