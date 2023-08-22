<?php
    include_once('config.php');
    $nome = $_POST['nome'];
    $email =  $_POST['email']; 
    $data_nascimento = $_POST['data_nascimento'];
    $telefone = $_POST['telefone'];
    $data_ida = $_POST['data_ida'];
    $data_volta = $_POST['data_volta'];
    $quantidade_pessoas = $_POST['quantidade_pessoas'];
    $reservar_mesa = $_POST['reservar_mesa'];
    $preferencias = $_POST['preferencias'];

    $query1 = "INSERT INTO dados_pessoais (nome, email, data_nascimento, telefone) VALUES ('$nome', '$email', '$data_nascimento', '$telefone')";
    
    if (mysqli_query($conn, $query1)) {
        $id_dados_pessoais = mysqli_insert_id($conn);
        $query2 = "INSERT INTO pedidos (data_ida, data_volta, quantidade_pessoas, reservar_mesa, preferencias, id_dados_pessoais) VALUES ('$data_ida', '$data_volta','$quantidade_pessoas', '$reservar_mesa', '$preferencias', $id_dados_pessoais)";
        
        if (mysqli_query($conn, $query2)) {
            echo "Pedido realizado com sucesso!";
        } else {
            echo "Erro ao inserir pedido: " . mysqli_error($conn);
        }
    } else {
        echo "Erro ao inserir dados pessoais: " . mysqli_error($conn);
    }
    
    $result1 = mysqli_query($conn, $query1);
    $result2 = mysqli_query($conn, $query2);
?>
