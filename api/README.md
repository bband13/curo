# Curo PHP + MySQL backend

This backend turns the Curo academic prototype into a local PHP/MySQL application. It is intentionally simple so it can be explained in a college viva and extended later.

## Requirements
- WAMP/XAMPP with PHP 8+ and MySQL/MariaDB
- PDO MySQL enabled
- VS Code

## 1. Put Curo in your web root
For WAMP, for example:

`C:\wamp\www\curo`

The folder should contain `index.html`, `style.css`, `api/`, `database/`, etc.

## 2. Create the database
Open phpMyAdmin → SQL and import:

`database/curo.sql`

It creates the `curo` database, tables and the illustrative hospital records.

## 3. Configure PHP
Copy:

`api/config.example.php` → `api/config.php`

For a default WAMP MySQL installation, the settings are normally:

- host: `127.0.0.1`
- port: `3306`
- database: `curo`
- username: `root`
- password: empty (unless you set one)

## 4. Start WAMP
Start Apache and MySQL.

Open:

`http://localhost/curo/`

Do **not** open the HTML files directly with `file:///...` when testing the PHP backend. PHP only runs through Apache.

## API endpoints
- `GET api/health.php`
- `GET api/hospitals.php?q=heart&location=Pune`
- `GET api/hospital.php?id=1`
- `POST api/appointment.php`
- `POST api/contact.php`

## Important academic-project note
The seeded hospital records, prices, ratings, distances and verification flags are illustrative demo data. They are not verified real-world hospital statistics. For a real deployment, these fields would need authoritative source data, update dates, provenance and an admin verification workflow.
