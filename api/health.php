<?php
declare(strict_types=1);
require_once __DIR__ . '/bootstrap.php';
try { $pdo->query('SELECT 1'); respond(['success'=>true,'status'=>'ok','database'=>'connected']); } catch(Throwable $e){ respond(['success'=>false,'status'=>'error'],500); }
