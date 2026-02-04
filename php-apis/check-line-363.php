<?php
/**
 * Verificar línea 363 específicamente
 */

$lines = file('gaby-agent.php');
$lineNumber = 363;

echo "Línea $lineNumber:\n";
echo "'" . $lines[$lineNumber - 1] . "'\n\n";

echo "Líneas alrededor:\n";
for ($i = $lineNumber - 3; $i <= $lineNumber + 2; $i++) {
    if (isset($lines[$i - 1])) {
        echo "Línea $i: '" . $lines[$i - 1] . "'\n";
    }
}
?>