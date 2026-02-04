<?php
/**
 * Test simple del web scraping
 */

echo "=== TEST DE WEB SCRAPING ===\n\n";

$url = 'https://agenterag.com';
echo "Probando URL: {$url}\n\n";

$html = file_get_contents($url);

if ($html) {
    echo "✅ HTML obtenido exitosamente\n";
    echo "Longitud: " . strlen($html) . " caracteres\n\n";
    
    // Extraer título básico
    if (preg_match('/<title>(.*?)<\/title>/i', $html, $matches)) {
        echo "📄 Título: " . trim($matches[1]) . "\n\n";
    }
    
    // Extraer algunos párrafos
    if (preg_match_all('/<p[^>]*>(.*?)<\/p>/is', $html, $matches)) {
        echo "📝 Párrafos encontrados: " . count($matches[1]) . "\n";
        echo "Primeros 3 párrafos:\n";
        for ($i = 0; $i < min(3, count($matches[1])); $i++) {
            $text = strip_tags($matches[1][$i]);
            $text = trim(preg_replace('/\s+/', ' ', $text));
            if (strlen($text) > 20) {
                echo "- " . substr($text, 0, 100) . "...\n";
            }
        }
    }
    
    echo "\n✅ Scraping básico exitoso\n";
} else {
    echo "❌ Error obteniendo HTML\n";
}
?>