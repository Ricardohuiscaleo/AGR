<?php
/**
 * Test del web scraping en la página de Agente RAG
 */

// Configurar cabeceras para JSON
header('Content-Type: application/json');

// Función simple de scraping para probar
function testScraping($url) {
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_USERAGENT => 'Mozilla/5.0 (compatible; GabyBot/1.0)',
        CURLOPT_SSL_VERIFYPEER => false
    ]);
    
    $html = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($html === false || $httpCode !== 200) {
        return ['error' => "HTTP Error: {$httpCode}"];
    }
    
    // Parsear HTML básico
    $dom = new DOMDocument();
    @$dom->loadHTML(mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8'));
    $xpath = new DOMXPath($dom);
    
    // Extraer título
    $titleNodes = $xpath->query('//title');
    $title = $titleNodes->length > 0 ? trim($titleNodes->item(0)->textContent) : 'Sin título';
    
    // Extraer algunos párrafos
    $content = '';
    $paragraphs = $xpath->query('//p | //h1 | //h2 | //h3');
    $count = 0;
    foreach ($paragraphs as $p) {
        if ($count >= 5) break; // Solo los primeros 5
        $text = trim($p->textContent);
        if (strlen($text) > 20) {
            $content .= $text . "\n\n";
            $count++;
        }
    }
    
    return [
        'success' => true,
        'url' => $url,
        'title' => $title,
        'content' => substr($content, 0, 800) . '...',
        'content_length' => strlen($content)
    ];
}

// Probar con la página principal
$result = testScraping('https://agenterag.com');

echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>