@echo off
echo ==========================================
echo    Iniciando o SeguroAuto AI...
echo ==========================================
echo.

:: 1. Verifica e cria o arquivo .env se não existir
if not exist .env (
    echo [1/4] Arquivo .env não encontrado. Criando a partir do exemplo...
    copy .env.example .env >nul
) else (
    echo [1/4] Arquivo .env já existe. OK!
)

:: 2. Verifica e cria a pasta secrets e o arquivo da chave se não existir
if not exist secrets (
    echo [2/4] Pasta secrets não encontrada. Criando...
    mkdir secrets
)

if not exist secrets\gemini_api_key.txt (
    echo [3/4] Arquivo de chave nao encontrado. Criando um em branco...
    type nul > secrets\gemini_api_key.txt
    echo ATENCAO: Voce podera configurar sua chave do Gemini direto na tela que vai abrir no navegador!
    echo.
) else (
    echo [2/4] Pasta e arquivo de chaves verificados. OK!
)

:: 3. Roda o Docker
echo [4/4] Ligando os motores no Docker (Isso pode demorar um pouco na primeira vez)...
docker compose up -d

echo.
echo ==========================================
echo   TUDO PRONTO! O SISTEMA ESTA RODANDO!
echo ==========================================
echo Abrindo o navegador...
timeout /t 3 >nul
start http://localhost:8080

pause
