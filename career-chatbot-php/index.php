<?php
require 'config.php';

$reply = "";
$career = "";
$careerPage = "";
$careerMapping = [
    "Data Scientist" => "careers/Data_Scientist.php",
    "Business Analyst" => "careers/Business_Analyst.php",
    "AI ML Specialist" => "careers/AI_ML_Specialist.php",
    "Customer Service Executive" => "careers/Customer_service_executive.php",
    "Application Support Engineer" => "careers/Application_Support_Engineer.php"
];

if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["message"])) {
    $message = $_POST["message"];

    $postData = [
        "model" => "gpt-3.5-turbo",
        "messages" => [
            ["role" => "system", "content" => "You're a career guidance bot. Suggest a career path based on user input. Only use one from this list: Data Scientist, Business Analyst, AI ML Specialist, Customer Service Executive, Application Support Engineer."],
            ["role" => "user", "content" => $message]
        ]
    ];

    $ch = curl_init("https://api.openai.com/v1/chat/completions");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Content-Type: application/json",
        "Authorization: Bearer $OPENAI_API_KEY"
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));

    $apiResponse = curl_exec($ch);
    curl_close($ch);

    $responseData = json_decode($apiResponse, true);
    $reply = $responseData["choices"][0]["message"]["content"] ?? "Sorry, I couldn't understand that.";

    foreach ($careerMapping as $key => $file) {
        if (stripos($reply, $key) !== false) {
            $career = $key;
            $careerPage = $file;
            break;
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Career Chatbot</title>
  <style>
    body { font-family: Arial; padding: 40px; }
    form { max-width: 600px; margin: auto; }
    textarea { width: 100%; height: 100px; }
    .message { margin-top: 20px; }
    .bot { color: green; }
    .user { color: blue; }
  </style>
</head>
<body>
  <h2>Career Chatbot (PHP Backend)</h2>
  <form method="POST">
    <textarea name="message" required placeholder="Describe your interests or feedback..."></textarea>
    <br><br>
    <button type="submit">Send</button>
  </form>

  <?php if ($reply): ?>
    <div class="message user"><strong>You:</strong> <?= htmlspecialchars($_POST["message"]) ?></div>
    <div class="message bot"><strong>Bot:</strong> <?= htmlspecialchars($reply) ?></div>
    <?php if ($careerPage): ?>
      <p><a href="<?= $careerPage ?>" target="_blank">👉 Learn more about becoming a <?= htmlspecialchars($career) ?></a></p>
    <?php endif; ?>
  <?php endif; ?>
</body>
</html>
