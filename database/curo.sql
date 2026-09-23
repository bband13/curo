CREATE DATABASE IF NOT EXISTS curo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE curo;

DROP TABLE IF EXISTS contact_messages;
DROP TABLE IF EXISTS appointment_requests;
DROP TABLE IF EXISTS hospital_services;
DROP TABLE IF EXISTS hospital_departments;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS hospitals;

CREATE TABLE hospitals (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(120) NOT NULL UNIQUE,
  name VARCHAR(180) NOT NULL,
  short_name VARCHAR(120) NOT NULL,
  city VARCHAR(100) NOT NULL,
  area VARCHAR(100) NOT NULL,
  distance_km DECIMAL(6,2) NOT NULL DEFAULT 0,
  type VARCHAR(60) NOT NULL,
  is_verified TINYINT(1) NOT NULL DEFAULT 0,
  rating DECIMAL(2,1) NOT NULL DEFAULT 0,
  reviews_count INT UNSIGNED NOT NULL DEFAULT 0,
  emergency_hours VARCHAR(120) NOT NULL,
  cost_label VARCHAR(100) NOT NULL,
  cost_value INT UNSIGNED NOT NULL DEFAULT 0,
  address VARCHAR(255) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  hours VARCHAR(120) NOT NULL,
  about TEXT NOT NULL,
  beds_label VARCHAR(60) NOT NULL,
  insurance_label VARCHAR(255) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE departments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE services (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255) NULL
) ENGINE=InnoDB;

CREATE TABLE hospital_departments (
  hospital_id INT UNSIGNED NOT NULL,
  department_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (hospital_id, department_id),
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE hospital_services (
  hospital_id INT UNSIGNED NOT NULL,
  service_id INT UNSIGNED NOT NULL,
  description VARCHAR(255) NULL,
  PRIMARY KEY (hospital_id, service_id),
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE appointment_requests (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  hospital_id INT UNSIGNED NOT NULL,
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time VARCHAR(30) NULL,
  department VARCHAR(100) NOT NULL,
  status ENUM('new','contacted','closed') NOT NULL DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
) ENGINE=InnoDB;

CREATE TABLE contact_messages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  reason VARCHAR(80) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO hospitals (slug,name,short_name,city,area,distance_km,type,is_verified,rating,reviews_count,emergency_hours,cost_label,cost_value,address,phone,hours,about,beds_label,insurance_label) VALUES
('citycare','CityCare Multispeciality Hospital','CityCare Hospital','Pune','Kothrud',2.4,'Multi-specialty',1,4.6,128,'24 hours · Emergency open','₹25,000 — ₹1.2L',25000,'Kothrud, Pune, Maharashtra','+91 20 4000 2200','24 hours · Emergency open','A multi-specialty hospital offering emergency services, diagnostics and specialist departments in one location.','250+','Major insurance & cashless plans'),
('lifeline','Lifeline Heart & Medical Centre','Lifeline Medical Centre','Pune','Shivajinagar',4.1,'Specialty',1,4.8,94,'24 hours · Emergency open','₹30,000 — ₹1.5L',30000,'Shivajinagar, Pune, Maharashtra','+91 20 4100 1818','24 hours · Emergency open','A focused cardiac-care centre with cardiology, diagnostics and critical-care services.','120+','Selected insurance & cashless plans'),
('sanjeevani','Sanjeevani General Hospital','Sanjeevani Hospital','Pune','Wakad',6.7,'Multi-specialty',1,4.4,71,'24 hours · Emergency open','₹18,000 — ₹95,000',18000,'Wakad, Pune, Maharashtra','+91 20 4300 7654','24 hours · Emergency open','General and specialist care with emergency, ICU and diagnostic services.','180+','Insurance accepted; cashless varies'),
('greenvalley','Green Valley Medical Institute','Green Valley','Pune','Baner',8.3,'Multi-specialty',0,4.2,56,'8 am — 10 pm · Emergency available','₹22,000 — ₹1.05L',22000,'Baner, Pune, Maharashtra','+91 20 4550 1010','8 am — 10 pm · Emergency available','A modern community hospital with specialist clinics and diagnostic services.','100+','Major insurance & cashless plans'),
('metro','MetroCare Institute of Health','MetroCare','Pune','Hadapsar',9.8,'Multi-specialty',1,4.5,83,'24 hours · Emergency open','₹28,000 — ₹1.3L',28000,'Hadapsar, Pune, Maharashtra','+91 20 4700 9000','24 hours · Emergency open','A broad specialist hospital with critical care, diagnostics and multiple clinical departments.','300+','Major insurance & cashless plans'),
('aarogyam','Aarogyam Care Hospital','Aarogyam Care','Pune','Viman Nagar',11.2,'Multi-specialty',0,4.1,48,'7 am — 11 pm','₹16,000 — ₹88,000',16000,'Viman Nagar, Pune, Maharashtra','+91 20 4820 3120','7 am — 11 pm','A community-focused hospital with general and specialist outpatient services.','90+','Insurance accepted; confirm cashless eligibility');

INSERT INTO departments(name) VALUES ('Cardiac Surgery'),('Cardiology'),('Diabetes'),('General Medicine'),('Neurology'),('Oncology'),('Orthopaedics'),('Women’s Health');
INSERT INTO services(name,description) VALUES ('Cashless','Cashless insurance information is listed for the hospital.'),('Diagnostics','Diagnostic and laboratory services.'),('Emergency care','Emergency care availability listed by the hospital record.'),('ICU','Critical-care / intensive-care services.');

INSERT INTO hospital_departments(hospital_id,department_id) SELECT h.id,d.id FROM hospitals h JOIN departments d ON (h.slug='citycare' AND d.name IN ('Cardiology','Neurology','Orthopaedics','General Medicine')) OR (h.slug='lifeline' AND d.name IN ('Cardiology','Cardiac Surgery','General Medicine')) OR (h.slug='sanjeevani' AND d.name IN ('Cardiology','General Medicine','Orthopaedics')) OR (h.slug='greenvalley' AND d.name IN ('Cardiology','Women’s Health','General Medicine')) OR (h.slug='metro' AND d.name IN ('Cardiology','Oncology','Orthopaedics','Neurology')) OR (h.slug='aarogyam' AND d.name IN ('Cardiology','General Medicine','Diabetes'));
INSERT INTO hospital_services(hospital_id,service_id) SELECT h.id,s.id FROM hospitals h JOIN services s ON (h.slug IN ('citycare','lifeline','sanjeevani','metro') AND s.name IN ('Emergency care','ICU','Diagnostics','Cashless')) OR (h.slug='greenvalley' AND s.name IN ('Emergency care','Diagnostics','Cashless')) OR (h.slug='aarogyam' AND s.name IN ('ICU','Diagnostics'));
