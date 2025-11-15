# Estudo de Criação de um Bot para Discord (WIP)

Neste repositório estou documentando meu processo de aprendizado na criação de um bot para o Discord utilizando TypeScript e a biblioteca discord.js.

Optei por utilizar TypeScript pois a tipagem estática ajuda a evitar muitos erros comuns durante o desenvolvimento, mas também por facilitar na utilização de classes, pois pareceu mais apropriado criar uma estrutura orientada a objetos para o bot.

## Tecnologias Utilizadas

-   TypeScript
-   discord.js
-   pm2 (para gerenciamento do processo em produção)
-   pino (para logging)
-   dotenv (para gerenciamento de variáveis de ambiente)
-   PostgreSQL (banco de dados relacional)
-   node-postgres (driver para PostgreSQL)
-   node-pg-migrate (ferramenta de migração de banco de dados)
-   Docker (para containerização do banco de dados, apenas localmente)

## Observações adicionais

Enquanto em desenvolvimento, eu não pretento hospedar o bot em um servidor 24/7, então estou utilizando o PM2 apenas para facilitar o gerenciamento do processo localmente. Docker me pareceu uma opção desnecessária para este tipo de aplicação por enquanto, por isso a escolha de utilizá-lo apenas para o banco de dados localmente. O banco de dados é principalmente para testar possíveis integrações com um bot.

Aproveitei o projeto para testar funcionalidades do Claude Code, mas estarei delegando apenas pequenas tarefas a ele, até mesmo para facilitar a revisão do código gerado.
