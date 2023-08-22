<?php
// Configuração da conexão com o banco de dados
$hostname = "db4free.net";
$username = "ma_silva_007";
$password = "1234567890";
$database = "ma_silva_007";


// Cria a conexão com o banco de dados
$conn = new mysqli($hostname, $username, $password, $database);

// Verifica se houve erro na conexão
if ($conn->connect_errno) {
    echo "Falha ao conectar ao MySQL";
}
else {
    echo "Conexão feita";
}
?>
