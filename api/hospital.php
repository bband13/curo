<?php
declare(strict_types=1);
require_once __DIR__ . '/bootstrap.php';
$id = (int)($_GET['id'] ?? 0);
if ($id < 1) respond(['success'=>false,'message'=>'A valid hospital id is required.'], 400);

$stmt = $pdo->prepare('SELECT id,slug,name,short_name,city,area,distance_km,type,is_verified,rating,reviews_count,emergency_hours,cost_label,cost_value,address,phone,hours,about,beds_label,insurance_label FROM hospitals WHERE id=:id AND is_active=1 LIMIT 1');
$stmt->execute(['id'=>$id]);
$h = $stmt->fetch();
if (!$h) respond(['success'=>false,'message'=>'Hospital not found.'],404);

$d = $pdo->prepare('SELECT d.name FROM hospital_departments hd JOIN departments d ON d.id=hd.department_id WHERE hd.hospital_id=:id ORDER BY d.name');
$d->execute(['id'=>$id]);
$s = $pdo->prepare('SELECT s.name,hs.description FROM hospital_services hs JOIN services s ON s.id=hs.service_id WHERE hs.hospital_id=:id ORDER BY s.name');
$s->execute(['id'=>$id]);
$services=[]; foreach($s as $row) $services[]=$row;

$h['id']=(string)$h['id']; $h['verified']=(bool)$h['is_verified']; $h['distance']=(float)$h['distance_km']; $h['rating']=(float)$h['rating']; $h['reviews']=(int)$h['reviews_count']; $h['costValue']=(int)$h['cost_value']; $h['cost']=$h['cost_label']; $h['beds']=$h['beds_label']; $h['insurance']=$h['insurance_label']; $h['departments']=array_column($d->fetchAll(),'name'); $h['services']=$services; $h['emergency']=false; $h['icu']=false; $h['diagnostics']=false; $h['cashless']=false;
foreach($services as $service){ $n=$service['name']; if($n==='Emergency care')$h['emergency']=true; if($n==='ICU')$h['icu']=true; if($n==='Diagnostics')$h['diagnostics']=true; if($n==='Cashless')$h['cashless']=true; }
unset($h['is_verified'],$h['distance_km'],$h['reviews_count'],$h['cost_label'],$h['cost_value'],$h['emergency_hours'],$h['beds_label'],$h['insurance_label']);
respond(['success'=>true,'data'=>$h]);
