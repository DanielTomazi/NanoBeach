-- Script SQL para criar as tabelas do banco de dados Nano Beach
-- Execute este script no seu banco MySQL

-- Criar banco de dados (se necessário)
-- CREATE DATABASE IF NOT EXISTS basedgoddaniels CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE basedgoddaniels;

-- Tabela para dados pessoais dos clientes
CREATE TABLE IF NOT EXISTS dados_pessoais (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    data_nascimento DATE NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_data_criacao (data_criacao)
);

-- Tabela para pedidos/reservas
CREATE TABLE IF NOT EXISTS pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    data_ida DATE NOT NULL,
    data_volta DATE NOT NULL,
    quantidade_pessoas INT NOT NULL CHECK (quantidade_pessoas > 0 AND quantidade_pessoas <= 50),
    reservar_mesa ENUM('s', 'n') DEFAULT 'n',
    preferencias TEXT,
    id_dados_pessoais INT NOT NULL,
    status ENUM('pendente', 'confirmado', 'cancelado', 'concluido') DEFAULT 'pendente',
    valor_total DECIMAL(10,2) DEFAULT 0.00,
    observacoes TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_dados_pessoais) REFERENCES dados_pessoais(id) ON DELETE CASCADE,
    INDEX idx_data_ida (data_ida),
    INDEX idx_status (status),
    INDEX idx_data_criacao (data_criacao),
    CONSTRAINT chk_datas CHECK (data_volta > data_ida)
);

-- Tabela para log de ações (opcional, para auditoria)
CREATE TABLE IF NOT EXISTS log_acoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    acao VARCHAR(50) NOT NULL,
    tabela_afetada VARCHAR(50),
    id_registro INT,
    dados_anteriores JSON,
    dados_novos JSON,
    ip_usuario VARCHAR(45),
    user_agent TEXT,
    data_acao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_acao (acao),
    INDEX idx_data_acao (data_acao)
);

-- Inserir alguns dados de exemplo (opcional)
-- INSERT INTO dados_pessoais (nome, email, data_nascimento, telefone) VALUES
-- ('João Silva', 'joao@email.com', '1990-05-15', '(11) 99999-9999'),
-- ('Maria Santos', 'maria@email.com', '1985-08-22', '(21) 88888-8888');

-- Triggers para log de auditoria (opcional)
DELIMITER //

CREATE TRIGGER tr_dados_pessoais_insert 
AFTER INSERT ON dados_pessoais 
FOR EACH ROW 
BEGIN
    INSERT INTO log_acoes (acao, tabela_afetada, id_registro, dados_novos, ip_usuario) 
    VALUES ('INSERT', 'dados_pessoais', NEW.id, JSON_OBJECT(
        'nome', NEW.nome,
        'email', NEW.email,
        'data_nascimento', NEW.data_nascimento,
        'telefone', NEW.telefone
    ), COALESCE(@user_ip, 'unknown'));
END//

CREATE TRIGGER tr_pedidos_insert 
AFTER INSERT ON pedidos 
FOR EACH ROW 
BEGIN
    INSERT INTO log_acoes (acao, tabela_afetada, id_registro, dados_novos, ip_usuario) 
    VALUES ('INSERT', 'pedidos', NEW.id, JSON_OBJECT(
        'data_ida', NEW.data_ida,
        'data_volta', NEW.data_volta,
        'quantidade_pessoas', NEW.quantidade_pessoas,
        'reservar_mesa', NEW.reservar_mesa,
        'preferencias', NEW.preferencias,
        'id_dados_pessoais', NEW.id_dados_pessoais,
        'status', NEW.status
    ), COALESCE(@user_ip, 'unknown'));
END//

DELIMITER ;

-- Visualizações úteis
CREATE VIEW vw_pedidos_completos AS
SELECT 
    p.id as pedido_id,
    dp.nome,
    dp.email,
    dp.telefone,
    p.data_ida,
    p.data_volta,
    p.quantidade_pessoas,
    p.reservar_mesa,
    p.preferencias,
    p.status,
    p.valor_total,
    DATEDIFF(p.data_volta, p.data_ida) as dias_hospedagem,
    p.data_criacao as data_pedido
FROM pedidos p
JOIN dados_pessoais dp ON p.id_dados_pessoais = dp.id
ORDER BY p.data_criacao DESC;

-- Índices adicionais para performance
CREATE INDEX idx_dados_pessoais_nome ON dados_pessoais(nome);
CREATE INDEX idx_pedidos_periodo ON pedidos(data_ida, data_volta);
CREATE INDEX idx_pedidos_pessoas ON pedidos(quantidade_pessoas);

-- Comentários nas tabelas
ALTER TABLE dados_pessoais COMMENT = 'Tabela para armazenar dados pessoais dos clientes';
ALTER TABLE pedidos COMMENT = 'Tabela para armazenar pedidos/reservas dos clientes';
ALTER TABLE log_acoes COMMENT = 'Tabela para auditoria e log de ações do sistema';

-- Script para backup automático (exemplo)
-- mysqldump -u basedgoddaniels -p basedgoddaniels > backup_nanobeach_$(date +%Y%m%d_%H%M%S).sql
