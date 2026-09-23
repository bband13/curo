<?php
declare(strict_types=1);
require_once __DIR__ . '/bootstrap.php';

$q = cleanString($_GET['q'] ?? '', 100);
$location = cleanString($_GET['location'] ?? '', 100);
$sort = cleanString($_GET['sort'] ?? 'relevance', 30);
$distance = isset($_GET['distance']) && is_numeric($_GET['distance']) ? (float)$_GET['distance'] : null;
$limit = min(max((int)($_GET['limit'] ?? 50), 1), 100);

$where = ['h.is_active = 1'];
$params = [];

if ($q !== '') {
    $searchTerms = [$q];
    $lowerQ = mb_strtolower($q);
    $synonyms = [
        'heart' => ['cardiology','cardiac'], 'cardiac' => ['cardiology'],
        'bone' => ['orthopaedics'], 'joint' => ['orthopaedics'], 'orthopedic' => ['orthopaedics'],
        'cancer' => ['oncology'], 'diabetes' => ['diabetes'], 'women' => ['women'],
        'brain' => ['neurology'], 'nerve' => ['neurology'], 'diagnostic' => ['diagnostics'],
        'test' => ['diagnostics'], 'general' => ['general medicine']
    ];
    foreach ($synonyms as $needle => $terms) if (str_contains($lowerQ, $needle)) $searchTerms = array_merge($searchTerms, $terms);
    $clauses=[]; $i=0;
    foreach (array_values(array_unique($searchTerms)) as $term) {
        $key='q'.$i++;
        $clauses[]="(h.name LIKE :$key OR h.city LIKE :$key OR h.area LIKE :$key OR h.type LIKE :$key OR h.about LIKE :$key OR EXISTS (SELECT 1 FROM hospital_departments hd2 JOIN departments d2 ON d2.id = hd2.department_id WHERE hd2.hospital_id = h.id AND d2.name LIKE :$key) OR EXISTS (SELECT 1 FROM hospital_services hs2 JOIN services s2 ON s2.id = hs2.service_id WHERE hs2.hospital_id = h.id AND s2.name LIKE :$key))";
        $params[$key]='%'.$term.'%';
    }
    $where[]='('.implode(' OR ',$clauses).')';
}
if ($location !== '') {
    $where[] = '(h.city LIKE :location OR h.area LIKE :location OR h.address LIKE :location)';
    $params['location'] = '%' . $location . '%';
}
if ($distance !== null) {
    $where[] = 'h.distance_km <= :distance';
    $params['distance'] = $distance;
}

$serviceFilters = ['emergency' => 'Emergency care', 'icu' => 'ICU', 'diagnostics' => 'Diagnostics', 'cashless' => 'Cashless'];
foreach ($serviceFilters as $key => $serviceName) {
    if (!empty($_GET[$key])) {
        $where[] = 'EXISTS (SELECT 1 FROM hospital_services hsf JOIN services sf ON sf.id = hsf.service_id WHERE hsf.hospital_id = h.id AND sf.name = :svc_' . $key . ')';
        $params['svc_' . $key] = $serviceName;
    }
}

if (!empty($_GET['type'])) {
    $type = cleanString($_GET['type'], 50);
    $where[] = 'h.type = :type';
    $params['type'] = $type;
}

$order = 'h.is_verified DESC, h.rating DESC, h.reviews_count DESC';
if ($sort === 'distance') $order = 'h.distance_km ASC';
if ($sort === 'cost') $order = 'h.cost_value ASC';
if ($sort === 'rating') $order = 'h.rating DESC, h.reviews_count DESC';

$sql = 'SELECT h.id,h.slug,h.name,h.short_name,h.city,h.area,h.distance_km,h.type,h.is_verified,h.rating,h.reviews_count,h.emergency_hours,h.cost_label,h.cost_value,h.address,h.phone,h.hours,h.about,h.beds_label,h.insurance_label FROM hospitals h WHERE ' . implode(' AND ', $where) . ' ORDER BY ' . $order . ' LIMIT ' . $limit;
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$hospitals = $stmt->fetchAll();

if ($hospitals) {
    $ids = array_column($hospitals, 'id');
    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $dStmt = $pdo->prepare("SELECT hd.hospital_id,d.name FROM hospital_departments hd JOIN departments d ON d.id=hd.department_id WHERE hd.hospital_id IN ($placeholders) ORDER BY d.name");
    $dStmt->execute($ids);
    $departments = [];
    foreach ($dStmt as $row) $departments[$row['hospital_id']][] = $row['name'];
    $sStmt = $pdo->prepare("SELECT hs.hospital_id,s.name FROM hospital_services hs JOIN services s ON s.id=hs.service_id WHERE hs.hospital_id IN ($placeholders) ORDER BY s.name");
    $sStmt->execute($ids);
    $services = [];
    foreach ($sStmt as $row) $services[$row['hospital_id']][] = $row['name'];
    foreach ($hospitals as &$h) {
        $h['id'] = (string)$h['id'];
        $h['verified'] = (bool)$h['is_verified']; unset($h['is_verified']);
        $h['emergency'] = in_array('Emergency care', $services[$h['id']] ?? [], true);
        $h['icu'] = in_array('ICU', $services[$h['id']] ?? [], true);
        $h['diagnostics'] = in_array('Diagnostics', $services[$h['id']] ?? [], true);
        $h['cashless'] = in_array('Cashless', $services[$h['id']] ?? [], true);
        $h['distance'] = (float)$h['distance_km']; unset($h['distance_km']);
        $h['cost'] = $h['cost_label']; unset($h['cost_label']);
        $h['costValue'] = (int)$h['cost_value']; unset($h['cost_value']);
        $h['reviews'] = (int)$h['reviews_count']; unset($h['reviews_count']);
        $h['departments'] = $departments[$h['id']] ?? [];
        $h['services'] = $services[$h['id']] ?? [];
        $h['emergencyHours'] = $h['emergency_hours']; unset($h['emergency_hours']);
        $h['beds'] = $h['beds_label']; unset($h['beds_label']);
        $h['insurance'] = $h['insurance_label']; unset($h['insurance_label']);
    }
    unset($h);
}
respond(['success' => true, 'count' => count($hospitals), 'data' => $hospitals]);
