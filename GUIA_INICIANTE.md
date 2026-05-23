# 🚀 Guia Super Simples: Como rodar o projeto no seu computador!

Se você não entende muito de tecnologia ou programação, não se preocupe! Este guia foi feito para ser tão simples que qualquer pessoa consegue seguir. Vamos juntos passo a passo!

---

## 🛠️ Passo 1: Os Programas Mágicos

Para o nosso projeto funcionar, você precisa instalar dois programas no seu computador. Pense neles como as "ferramentas do construtor":

1. **O Entregador (Git):** Ele serve para baixar o projeto da internet para o seu computador.
   👉 **[Baixe o Git aqui](https://git-scm.com/downloads)** e instale normalmente (só ir clicando em "Avançar" ou "Next").

2. **A Caixa Mágica (Docker Desktop):** Ele faz o nosso projeto funcionar dentro de uma caixinha segura, para não bagunçar nada no seu computador.
   👉 **[Baixe o Docker Desktop aqui](https://www.docker.com/products/docker-desktop/)** e instale. 
   *(Importante: Você vai precisar abrir o Docker Desktop depois de instalar e deixar ele rodando. Ele vai ficar com um ícone de "baleia" perto do relógio do seu computador).*

---

## 📥 Passo 2: Baixando o Projeto

Agora que você tem as ferramentas, vamos baixar o projeto!

1. Abra o menu Iniciar do seu computador, procure por **Prompt de Comando** (ou **Terminal**) e abra-o.
2. Vai aparecer uma tela preta. Digite o seguinte comando e aperte **ENTER**:
   ```bash
   git clone https://github.com/contatomauricio/-insuranceiaagent.git
   ```
3. Pode fechar a tela preta! O projeto já foi baixado para o seu computador em uma pasta chamada `-insuranceiaagent`.

---

## 🚀 Passo 3: A Mágica do Atalho "iniciar"

Para que você não precise criar arquivos manualmente ou digitar comandos difíceis, nós criamos um atalho automático.

1. Acesse as pastas do seu computador e abra a pasta do projeto (`-insuranceiaagent`) que você acabou de baixar.
2. Encontre um arquivo chamado **`iniciar.bat`** (ou apenas `iniciar`) e dê um **duplo clique** nele.
3. Uma tela preta vai aparecer. Ele vai criar toda a estrutura para você e já vai começar a ligar os motores.
*(A primeira vez pode demorar alguns minutinhos, pode ir tomar uma água!)* 🥤

---

## 🔑 Passo 4: O Crachá do Robô

O nosso projeto usa o modelo Gemini (a inteligência artificial do Google). Para ele conseguir conversar, ele precisa de um "crachá" pessoal. Nós chamamos isso de "Chave de API".

1. Acesse o site do **[Google AI Studio (clique aqui)](https://aistudio.google.com/app/apikey)**.
2. Faça login com a sua conta do Google (seu Gmail normal).
3. Clique no botão azul para **Criar a Chave (Create API key)** e depois **copie** a chave gerada (uma sopa de letrinhas bem comprida).
4. Agora, de volta à pasta do nosso projeto (`-insuranceiaagent`), você vai notar que o arquivo `iniciar.bat` criou uma nova pasta chamada **`secrets`**.
5. Entre nessa pasta `secrets` e abra o arquivo de texto chamado **`gemini_api_key.txt`**.
6. Apague o que estiver lá dentro, **cole a sua chave** do Gemini e **salve** o arquivo.
7. Volte na pasta anterior e dê um **duplo clique no `iniciar.bat` DE NOVO**! (Isso serve apenas para reiniciar o robô para que ele leia a sua nova chave).

---

## 🌐 Passo 5: Brincando com o Projeto!

O melhor de tudo é que o atalho `iniciar.bat` **abre o navegador automaticamente** para você quando termina de carregar.

Caso feche sem querer, basta abrir o seu navegador (Google Chrome, Edge, Safari, etc.) e acessar:

👉 **[http://localhost:8080](http://localhost:8080)**

**Pronto! 🎉** A interface do nosso Assistente Virtual vai aparecer e você já pode começar a conversar com ele!
