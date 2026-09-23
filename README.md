# Curo — Hospital Finder Academic Project

Curo is a clean, accessible hospital-discovery and comparison website built for a college submission. The frontend uses HTML, CSS and JavaScript. The backend uses PHP + MySQL.

## Current project flow

Home → Find care → Search/filter hospitals → Hospital details → Compare hospitals → Save hospitals → Appointment request

The AI assistant is intentionally **not included yet**. It can be added after the database and core user flow are stable.

## Tech stack
- HTML5
- CSS3
- Vanilla JavaScript
- PHP 8+
- MySQL / MariaDB
- PDO prepared statements
- localStorage for lightweight browser preferences such as language, saved hospitals and comparison selection

## Run locally with WAMP

1. Put this whole `curo-frontend` folder inside your WAMP web root, for example:
   `C:\wamp\www\curo`
2. Start **Apache** and **MySQL** in WAMP.
3. Open phpMyAdmin.
4. Import `database/curo.sql`.
5. Copy `api/config.example.php` to `api/config.php` and check the MySQL credentials. A default WAMP install commonly uses `root` with an empty password.
6. Open `http://localhost/curo/`.
7. Test `http://localhost/curo/api/health.php`. It should return a JSON response showing the database is connected.

Do not open `index.html` directly with `file:///...` when testing the PHP backend. Use Apache through `http://localhost/...`.

## API

| Endpoint | Purpose |
|---|---|
| `GET api/health.php` | Database health check |
| `GET api/hospitals.php` | Search/filter hospital records |
| `GET api/hospital.php?id=1` | Load one hospital |
| `POST api/appointment.php` | Save an appointment request |
| `POST api/contact.php` | Save contact/feedback form |

Example search:
`api/hospitals.php?q=heart%20care&location=Pune&sort=distance`

## Database

The schema separates hospitals, departments and services and stores appointment requests and contact messages. This is enough for the college prototype while leaving room for a future admin panel, user accounts and verified data workflow.

## Important data note

The seeded hospital records, costs, ratings, distances and verification flags are **illustrative academic demo data**. They are not presented as verified real-world statistics. A real healthcare product would need authoritative data sources, source URLs, update dates, audit history and an admin verification process.
