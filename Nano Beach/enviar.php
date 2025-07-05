<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

include_once('config.php');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método não permitido. Use POST.'
    ]);
    exit;
}

$response = ['success' => false, 'message' => '', 'errors' => []];

try {
    $required_fields = ['nome', 'email', 'data_nascimento', 'telefone', 'data_ida', 'data_volta', 'quantidade_pessoas'];
    
    foreach ($required_fields as $field) {
        if (!isset($_POST[$field]) || empty(trim($_POST[$field]))) {
            $response['errors'][$field] = "Campo obrigatório não preenchido.";
        }
    }
    
    if (!empty($response['errors'])) {
        $response['message'] = 'Preencha todos os campos obrigatórios.';
        echo json_encode($response);
        exit;
    }
    
    $nome = sanitizeInput($_POST['nome']);
    $email = sanitizeInput($_POST['email']);
    $data_nascimento = sanitizeInput($_POST['data_nascimento']);
    $telefone = sanitizeInput($_POST['telefone']);
    $data_ida = sanitizeInput($_POST['data_ida']);
    $data_volta = sanitizeInput($_POST['data_volta']);
    $quantidade_pessoas = (int) $_POST['quantidade_pessoas'];
    $reservar_mesa = isset($_POST['reservar_mesa']) ? sanitizeInput($_POST['reservar_mesa']) : 'n';
    
    $preferencias = '';
    if (isset($_POST['preferencias']) && is_array($_POST['preferencias'])) {
        $preferencias = implode(',', array_map('sanitizeInput', $_POST['preferencias']));
    } elseif (isset($_POST['preferencias'])) {
        $preferencias = sanitizeInput($_POST['preferencias']);
    }
    
    if (strlen($nome) < 2) {
        $response['errors']['nome'] = 'Nome deve ter pelo menos 2 caracteres.';
    }
    
    if (!validateEmail($email)) {
        $response['errors']['email'] = 'E-mail inválido.';
    }
    
    if (!validateDate($data_nascimento)) {
        $response['errors']['data_nascimento'] = 'Data de nascimento inválida.';
    } else {
        $birth_date = new DateTime($data_nascimento);
        $today = new DateTime();
        $age = $birth_date->diff($today)->y;
        
        if ($age < 16) {
            $response['errors']['data_nascimento'] = 'Idade mínima: 16 anos.';
        }
    }
    
    if (!validatePhone($telefone)) {
        $response['errors']['telefone'] = 'Telefone inválido.';
    }
    
    if (!validateDate($data_ida)) {
        $response['errors']['data_ida'] = 'Data de ida inválida.';
    }
    
    if (!validateDate($data_volta)) {
        $response['errors']['data_volta'] = 'Data de volta inválida.';
    }
    
    if (validateDate($data_ida) && validateDate($data_volta)) {
        $ida = new DateTime($data_ida);
        $volta = new DateTime($data_volta);
        $hoje = new DateTime();
        
        if ($ida < $hoje) {
            $response['errors']['data_ida'] = 'Data de ida não pode ser anterior a hoje.';
        }
        
        if ($volta <= $ida) {
            $response['errors']['data_volta'] = 'Data de volta deve ser posterior à data de ida.';
        }
        
        $diff = $volta->diff($ida)->days;
        if ($diff > 30) {
            $response['errors']['data_volta'] = 'Período máximo de reserva: 30 dias.';
        }
    }
    
    if ($quantidade_pessoas < 1 || $quantidade_pessoas > 50) {
        $response['errors']['quantidade_pessoas'] = 'Quantidade deve ser entre 1 e 50 pessoas.';
    }
    
    if (!empty($response['errors'])) {
        $response['message'] = 'Dados inválidos. Verifique os campos destacados.';
        echo json_encode($response);
        exit;
    }
    
    $conn->autocommit(FALSE);
    
    $stmt1 = $conn->prepare("INSERT INTO dados_pessoais (nome, email, data_nascimento, telefone) VALUES (?, ?, ?, ?)");
    $stmt1->bind_param("ssss", $nome, $email, $data_nascimento, $telefone);
    
    if (!$stmt1->execute()) {
        throw new Exception("Erro ao inserir dados pessoais: " . $stmt1->error);
    }
    
    $id_dados_pessoais = $conn->insert_id;
    
    $stmt2 = $conn->prepare("INSERT INTO pedidos (data_ida, data_volta, quantidade_pessoas, reservar_mesa, preferencias, id_dados_pessoais) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt2->bind_param("ssissi", $data_ida, $data_volta, $quantidade_pessoas, $reservar_mesa, $preferencias, $id_dados_pessoais);
    
    if (!$stmt2->execute()) {
        throw new Exception("Erro ao inserir pedido: " . $stmt2->error);
    }
    
    $conn->commit();
    
    $stmt1->close();
    $stmt2->close();
    
    $response['success'] = true;
    $response['message'] = 'Pedido realizado com sucesso! Você receberá um e-mail de confirmação em breve.';
    $response['pedido_id'] = $id_dados_pessoais;
    
    error_log("Novo pedido realizado - ID: $id_dados_pessoais, Email: $email");
    
} catch (Exception $e) {
    $conn->rollback();
    
    error_log("Erro no envio do formulário: " . $e->getMessage());
    
    $response['success'] = false;
    $response['message'] = 'Erro interno do servidor. Tente novamente mais tarde.';
    
    if (isset($_GET['debug']) && $_GET['debug'] === '1') {
        $response['debug'] = $e->getMessage();
    }
}

$conn->close();

echo json_encode($response, JSON_UNESCAPED_UNICODE);
?>
