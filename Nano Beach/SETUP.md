# Configuração do Ambiente - Nano Beach

## 📋 Pré-requisitos

Para executar o projeto Nano Beach localmente, você precisará de:

- **Servidor Web**: Apache, Nginx ou similar
- **PHP**: Versão 7.4 ou superior
- **MySQL**: Versão 5.7 ou superior
- **Navegador**: Chrome, Firefox, Safari ou Edge

## 🚀 Instalação Local

### 1. Usando XAMPP (Recomendado para desenvolvimento)

1. **Baixe e instale o XAMPP**:
   - Windows: https://www.apachefriends.org/download.html
   - Selecione a versão com PHP 7.4+

2. **Configure o projeto**:
   ```bash
   # Navegue até a pasta htdocs do XAMPP
   cd C:\xampp\htdocs
   
   # Clone ou copie o projeto
   mkdir nanobeach
   # Copie todos os arquivos da pasta "Nano Beach" para "nanobeach"
   ```

3. **Configure o banco de dados**:
   - Abra o XAMPP Control Panel
   - Inicie Apache e MySQL
   - Acesse http://localhost/phpmyadmin
   - Crie um banco chamado `nanobeach_local`
   - Importe o arquivo `database.sql`

4. **Atualize as configurações**:
   - Edite o arquivo `config.php`
   - Altere as configurações para ambiente local:
   ```php
   $hostname = "localhost";
   $username = "root";
   $password = ""; // Vazio por padrão no XAMPP
   $database = "nanobeach_local";
   ```

5. **Acesse o projeto**:
   - Navegue para: http://localhost/nanobeach

### 2. Usando WAMP (Windows)

1. **Baixe e instale o WAMP**:
   - https://www.wampserver.com/

2. **Siga passos similares ao XAMPP**:
   - Pasta do projeto: `C:\wamp64\www\nanobeach`
   - Acesso: http://localhost/nanobeach

### 3. Usando MAMP (Mac)

1. **Baixe e instale o MAMP**:
   - https://www.mamp.info/

2. **Configure conforme XAMPP**:
   - Pasta do projeto: `/Applications/MAMP/htdocs/nanobeach`

## 🔧 Configurações de Produção

### 1. Configuração do config.php para produção:

```php
<?php
// Configurações de produção
$hostname = "seu_servidor_mysql";
$username = "seu_usuario";
$password = "sua_senha_segura";
$database = "nome_do_banco";

// Desabilitar exibição de erros
ini_set('display_errors', 0);
error_reporting(0);

// Configurações de segurança
$conn = new mysqli($hostname, $username, $password, $database);
$conn->set_charset("utf8mb4");
?>
```

### 2. Configurações do servidor web:

#### Apache (.htaccess)
```apache
# Segurança
Options -Indexes
ServerSignature Off

# Cache para arquivos estáticos
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/jpg "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
</IfModule>

# Compressão GZIP
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Proteger arquivos sensíveis
<Files "config.php">
    Order Allow,Deny
    Deny from all
</Files>

<Files "database.sql">
    Order Allow,Deny
    Deny from all
</Files>
```

#### Nginx
```nginx
server {
    listen 80;
    server_name seudominio.com;
    root /caminho/para/projeto;
    index index.html index.php;

    # Cache para arquivos estáticos
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1M;
        add_header Cache-Control "public, immutable";
    }

    # Processar PHP
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
    }

    # Proteger arquivos sensíveis
    location ~ \.(sql|conf)$ {
        deny all;
    }
}
```

## 🛡️ Checklist de Segurança

### ✅ Implementado:
- [x] Proteção contra SQL Injection (Prepared Statements)
- [x] Validação de dados no servidor
- [x] Sanitização de entrada
- [x] Headers de segurança
- [x] Tratamento de erros seguro
- [x] Transações de banco de dados

### 🔄 Recomendações adicionais:
- [ ] HTTPS obrigatório
- [ ] Rate limiting
- [ ] CAPTCHA para formulários
- [ ] Log de auditoria
- [ ] Backup automático
- [ ] Monitoramento de segurança

## 📊 Monitoramento

### Logs importantes:
- **Apache/Nginx**: Acesso e erros
- **PHP**: Erros de aplicação
- **MySQL**: Slow queries e erros
- **Aplicação**: Log personalizado em `enviar.php`

### Métricas a acompanhar:
- Tempo de resposta
- Taxa de erro
- Uso de recursos
- Tentativas de invasão

## 🔄 Backup

### Script de backup automático:
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u usuario -p banco > backup_$DATE.sql
tar -czf backup_files_$DATE.tar.gz /caminho/para/projeto
```

## 📱 Teste em Dispositivos

### Ferramentas recomendadas:
- **Chrome DevTools**: Simulação de dispositivos
- **BrowserStack**: Teste em dispositivos reais
- **Responsinator**: Visualização rápida
- **Google PageSpeed Insights**: Performance

### Dispositivos prioritários:
- iPhone SE, 12, 13
- Samsung Galaxy S20, S21
- iPad, iPad Pro
- Desktop 1920x1080
- Laptop 1366x768

## 🚀 Deploy

### Vercel (Frontend):
1. Conecte o repositório GitHub
2. Configure build commands se necessário
3. Defina variáveis de ambiente

### Heroku (Full Stack):
1. Crie app no Heroku
2. Configure add-on MySQL (ClearDB)
3. Configure variáveis de ambiente
4. Deploy via Git

### Hospedagem Tradicional:
1. Upload via FTP/SFTP
2. Configure banco de dados
3. Ajuste permissões de arquivos
4. Teste todas as funcionalidades

---

**Para dúvidas ou suporte, consulte a documentação ou entre em contato com a equipe de desenvolvimento.**
