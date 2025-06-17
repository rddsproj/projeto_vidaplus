# Vidaplus

## Sobre o Projeto

## Instalação

### Clone o repositorio
```bash
git clone https://github.com/rddsproj/Projeto-Vidaplus.git
```
### Acesse a pasta do projeto
```bash
cd Projeto-Vidaplus
```
### Configure o arquivo .env com a chave secreta e a URI do mongoDB
Crie um arquivo .env na raiz do projeto com o seguinte conteudo:
```bash
#Substitua "sua-chave-secreta" e "sua-uri-do-mongodb" pelos valores reais.
JWT_SECRET="sua-chave-secreta" 
MONGODB_URI="sua-uri-do-mongodb"
```
### Instale as depencias
```bash
npm install
```
### Inicie o servidor
```bash
node app.js
#ou
npm start
```
