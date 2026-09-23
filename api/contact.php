<?php
declare(strict_types=1);
require_once __DIR__ . '/bootstrap.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(['success'=>false,'message'=>'POST required.'],405);
$data=jsonInput();$name=cleanString($data['name']??'',120);$email=cleanString($data['email']??'',160);$reason=cleanString($data['reason']??'General feedback',80);$message=cleanString($data['message']??'',2000);
if($name===''||!filter_var($email,FILTER_VALIDATE_EMAIL)||$message==='')respond(['success'=>false,'message'=>'Please provide a valid name, email and message.'],422);
$stmt=$pdo->prepare('INSERT INTO contact_messages (name,email,reason,message) VALUES (:name,:email,:reason,:message)');$stmt->execute(compact('name','email','reason','message'));
respond(['success'=>true,'message'=>'Thanks. Your message was saved.']);
