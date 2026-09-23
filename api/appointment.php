<?php
declare(strict_types=1);
require_once __DIR__ . '/bootstrap.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(['success'=>false,'message'=>'POST required.'],405);
$data=jsonInput();
$hospitalId=(int)($data['hospital_id']??0); $name=cleanString($data['name']??'',120); $phone=cleanString($data['phone']??'',40); $date=cleanString($data['date']??'',20); $time=cleanString($data['time']??'',30); $department=cleanString($data['department']??'',100);
if($hospitalId<1||$name===''||$phone===''||$date===''||$department==='') respond(['success'=>false,'message'=>'Please complete the required fields.'],422);
$h=$pdo->prepare('SELECT id FROM hospitals WHERE id=:id AND is_active=1');$h->execute(['id'=>$hospitalId]);if(!$h->fetch())respond(['success'=>false,'message'=>'Hospital not found.'],404);
$stmt=$pdo->prepare('INSERT INTO appointment_requests (hospital_id,name,phone,preferred_date,preferred_time,department,status) VALUES (:hospital_id,:name,:phone,:date,:time,:department,\'new\')');
$stmt->execute(['hospital_id'=>$hospitalId,'name'=>$name,'phone'=>$phone,'date'=>$date,'time'=>$time,'department'=>$department]);
respond(['success'=>true,'message'=>'Appointment request saved.','request_id'=>(int)$pdo->lastInsertId()]);
