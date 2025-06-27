# Vidaplus

## Sobre o Projeto
Sistema de Gestão Hospitalar e de Serviços de Saúde (SGHSS), desenvolvido com foco em back-end utilizando Node.js, Express.js e MongoDB. O sistema permite o cadastro e gerenciamento de pacientes, consultas, internações, receitas médicas, prontuários, controle de usuários e acesso por permissões (roles).
Inclui autenticação com JWT, registro de logs e organização baseada no padrão MVC.
## Instalação

### Clone o repositorio
```bash
git clone https://github.com/rddsproj/projeto_vidaplus.git
```
### Acesse a pasta do projeto
```bash
cd projeto-vidaplus
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
### Usuário padrão
Ao iniciar o sistema pela primeira vez, é criado automaticamente um usuário administrador para permitir a configuração inicial da aplicação.

#### Credenciais padrão:

> Email: admin@vidaplus.com

> Senha: 123456

> ⚠️ Recomenda-se alterar essa senha assim que possível, por motivos de segurança.  
> A alteração pode ser feita utilizando a rota **Editar Usuário**. Consulte a documentação da API para mais informações.

### Estrutura do projeto
```bash
├── Controllers/
├── db/
├── Models/
├── Public/
├── Routes/
├── utils
├── Views
├── .env
├── app.js
├── package.json
```
### Autenticação
O sistema utiliza JWT para autenticação.
Cada usuário possui um perfil (role), que define seu nível de acesso:

- admin

- paciente

- medico

- atendente

- enfermeiro

### Documentação da API
A documentação completa com todos os endpoints, exemplos e respostas está disponível no arquivo PDF:
📎 [documentacao-vidaplus.pdf](./documentacao-vidaplus.pdf)

### Tecnologias utilizadas
- Node.js

- Express.js

- MongoDB + Mongoose

- JWT

- Postman (para testes)

- Dotenv