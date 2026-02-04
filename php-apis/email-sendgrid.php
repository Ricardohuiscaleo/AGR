<?php
/**
 * Integración con SendGrid para emails profesionales
 * Reemplaza el mail() básico de PHP
 */

function sendEmailWithSendGrid($to, $subject, $body, $apiKey) {
    $data = [
        'personalizations' => [
            [
                'to' => [['email' => $to]],
                'subject' => $subject
            ]
        ],
        'from' => [
            'email' => 'gaby@agenterag.com',
            'name' => 'Gaby - Agente RAG'
        ],
        'content' => [
            [
                'type' => 'text/html',
                'value' => $body
            ]
        ]
    ];
    
    $options = [
        'http' => [
            'header' => [
                'Authorization: Bearer ' . $apiKey,
                'Content-Type: application/json'
            ],
            'method' => 'POST',
            'content' => json_encode($data)
        ]
    ];
    
    $context = stream_context_create($options);
    $response = file_get_contents('https://api.sendgrid.com/v3/mail/send', false, $context);
    
    return $response !== FALSE;
}
?>