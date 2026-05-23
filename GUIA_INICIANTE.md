# 🚀 Guia Super Simples: Como rodar o projeto no seu computador!

Se você não entende muito de tecnologia ou programação, não se preocupe! Este guia foi feito para ser tão simples que qualquer pessoa consegue seguir. Vamos juntos passo a passo!

---

## 🛠️ Passo 1: O Programa Mágico

Para o nosso projeto funcionar, você precisa instalar apenas UM programa no seu computador. Pense nele como a "caixa mágica":

**Docker Desktop:** Ele faz o nosso projeto funcionar dentro de um ambiente seguro, para não bagunçar nada no seu computador.
👉 **[Baixe o Docker Desktop aqui](https://www.docker.com/products/docker-desktop/)** e instale. 
*(Importante: Você vai precisar abrir o Docker Desktop depois de instalar e deixar ele rodando. Ele vai ficar com um ícone de "baleia" perto do relógio do seu computador).*

---

## 📥 Passo 2: Baixando o Projeto

Como o nosso projeto é fechado (privado), a forma mais fácil de baixar é direto pelo site (sem precisar de telas pretas):

1. Acesse a página do projeto no GitHub (garanta que você está logado com a conta que tem permissão de acesso).
2. Clique no botão verde escrito **"<> Code"**.
3. Escolha a opção **"Download ZIP"**.
4. Encontre o arquivo `.zip` que você acabou de baixar, clique com o botão direito nele e escolha **"Extrair Tudo..."** (ou "Extract all").
5. Entre na nova pasta que foi extraída (ela vai se chamar algo como `-insuranceiaagent-main`).

---

## 🚀 Passo 3: A Mágica do Atalho "iniciar"

Para que você não precise criar arquivos manualmente ou digitar comandos difíceis, nós criamos um atalho automático.

1. Dentro da pasta do projeto que você extraiu, encontre um arquivo chamado **`iniciar.bat`** (ou apenas `iniciar`) e dê um **duplo clique** nele.
2. Uma tela preta vai aparecer. Ele vai criar toda a estrutura para você e já vai começar a ligar os motores.
*(A primeira vez pode demorar alguns minutinhos, pode ir tomar uma água!)* 🥤

---

## 🔑 Passo 4: O Crachá do Robô

O nosso projeto usa o modelo Gemini (a inteligência artificial do Google). Para ele conseguir conversar, ele precisa de um "crachá" pessoal. Nós chamamos isso de "Chave de API".

1. Acesse o site do **[Google AI Studio (clique aqui)](https://aistudio.google.com/app/apikey)**.
2. Faça login com a sua conta do Google (seu Gmail normal).
3. Clique no botão azul para **Criar a Chave (Create API key)** e depois **copie** a chave gerada (uma sopa de letrinhas bem comprida).
4. Agora, de volta à pasta do nosso projeto, você vai notar que o arquivo `iniciar.bat` criou uma nova pasta chamada **`secrets`**.
5. Entre nessa pasta `secrets` e abra o arquivo de texto chamado **`gemini_api_key.txt`**.
6. Apague o que estiver lá dentro, **cole a sua chave** do Gemini e **salve** o arquivo.
7. Volte na pasta anterior e dê um **duplo clique no `iniciar.bat` DE NOVO**! (Isso serve apenas para reiniciar o robô para que ele leia a sua nova chave).

---

## 🌐 Passo 5: Brincando com o Projeto!

O melhor de tudo é que o atalho `iniciar.bat` **abre o navegador automaticamente** para você quando termina de carregar.

Caso feche sem querer, basta abrir o seu navegador (Google Chrome, Edge, Safari, etc.) e acessar:

👉 **[http://localhost:8080](http://localhost:8080)**

**Pronto! 🎉** A interface do nosso Assistente Virtual vai aparecer e você já pode começar a conversar com ele!
