.PHONY: setup up down logs restart clean

# Comando padrão caso a pessoa digite apenas 'make'
all: up

setup:
	@echo "==> Configurando o ambiente..."
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo " [OK] Arquivo .env criado."; \
	else \
		echo " [INFO] Arquivo .env ja existe."; \
	fi
	@mkdir -p secrets
	@if [ ! -f secrets/gemini_api_key.txt ]; then \
		echo "cole_sua_chave_aqui" > secrets/gemini_api_key.txt; \
		echo " [ATENCAO] Criado secrets/gemini_api_key.txt."; \
		echo " Por favor, cole sua chave do Google AI Studio nele antes de continuar!"; \
	fi

up: setup
	@echo "==> Ligando o projeto no Docker..."
	docker compose up -d
	@echo "==> Tudo pronto! Acesse a interface em: http://localhost:8080"

down:
	@echo "==> Desligando o projeto..."
	docker compose down

logs:
	@echo "==> Mostrando logs (pressione Ctrl+C para sair)..."
	docker compose logs -f

restart:
	@echo "==> Reiniciando os containers..."
	docker compose restart

clean: down
	@echo "==> Limpando tudo (Aviso: O banco de dados sera apagado!)..."
	docker compose down -v
