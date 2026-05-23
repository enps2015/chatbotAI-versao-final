# Guia Prático de Uso do Make

Este documento foi criado para facilitar a vida de quem vai executar e gerenciar o projeto. Nós configuramos um arquivo chamado `Makefile` que funciona como um "atalho" para os comandos mais longos e difíceis de memorizar.

## O que é o Make?
O `make` é uma ferramenta que automatiza a execução de comandos no terminal. Em vez de você ter que lembrar a ordem exata das coisas ou digitar comandos longos do Docker repetidas vezes, você pode simplesmente usar comandos curtos e fáceis como `make up`.

---

## 🚀 O Fim do "docker compose up -d"

Se você está acostumado a digitar `docker compose up -d` para subir o projeto, **esqueca isso!** 

Agora, tudo o que você precisa fazer é abrir o seu terminal, na pasta raiz do projeto, e digitar:

```bash
make up
```

**O que o `make up` faz por baixo dos panos?**
1. Ele verifica se você tem o arquivo `.env`. Se não tiver, ele cria um a partir do `.env.example`.
2. Ele verifica se a pasta `secrets` e o arquivo `gemini_api_key.txt` existem, e cria um modelo caso não existam.
3. Finalmente, ele sobe os containers do Docker automaticamente (`docker compose up -d`).
4. Exibe uma mensagem informando que o sistema está no ar e a URL de acesso (http://localhost:8080).

Ou seja, com **apenas duas palavras** (`make up`), você configura o ambiente e roda o projeto de uma só vez!

---

## 📋 Lista de Comandos Disponíveis

Aqui estão todos os "atalhos" que já deixamos prontos para você:

| Comando | O que ele faz? | Quando usar? |
| --- | --- | --- |
| `make setup` | Cria os arquivos de configuração `.env` e a pasta `secrets` (se não existirem). | Quando baixar o projeto pela primeira vez e quiser apenas configurar sem rodar. (O `make up` já faz isso automaticamente). |
| `make up` | **Liga o projeto** no Docker em segundo plano. | Toda vez que quiser rodar a aplicação. |
| `make down` | **Desliga o projeto**, parando os containers. | Quando terminar de trabalhar e quiser liberar a memória do seu computador. |
| `make logs` | Mostra os logs do Docker em tempo real. | Se algo der errado e você precisar ver as mensagens de erro ou atividade do sistema. Pressione `Ctrl+C` para sair. |
| `make restart` | Reinicia os containers rapidamente. | Se a aplicação travar ou você fizer uma mudança que precise de reinício rápido. |
| `make build` | Força a reconstrução das imagens do Docker (`--no-cache`). | Útil quando você adiciona novas bibliotecas e precisa que o Docker crie as imagens do zero. |
| `make shell-backend` | Abre o terminal interativo do backend. | Para debugar o backend por dentro do container (ex: rodar comandos node/npm manuais). |
| `make shell-frontend` | Abre o terminal interativo do frontend. | Para debugar o frontend por dentro do container. |
| `make clean` | Desliga o projeto e **apaga o banco de dados** e volumes. | **Cuidado!** Use apenas se quiser "resetar" todo o ambiente e apagar os dados salvos localmente. |

---

## 💡 Precisamos de mais automatizações?

O `Makefile` atual já cobre a maior parte das necessidades do dia a dia. No entanto, se a equipe achar necessário no futuro, podemos adicionar novos atalhos. Por exemplo:

- **`make db-reset`**: Um comando específico para apagar os dados do banco e recriar as tabelas ou rodar "seeds" (dados de teste), sem ter que derrubar todo o sistema.

**Conclusão:** O ambiente está excelente para quem vai operar o sistema. Se a equipe sentir falta de algo no dia a dia, é fácil adicionar novas linhas no `Makefile`!
