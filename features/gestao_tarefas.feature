# language: pt
Funcionalidade: Gestão de tarefas

  Como usuário do sistema
  Quero cadastrar, consultar, editar, excluir e pesquisar tarefas
  Para organizar e acompanhar meu trabalho da criação até a conclusão

  Contexto:
    Dado que a aplicação esteja em execução em http://localhost:3000
    E que o banco em memória esteja carregado com os dados iniciais de teste

  # CT01 | Prioridade: Alta | Rastreabilidade: RN1
  Cenário: CT01 Validar que não é possível cadastrar uma tarefa sem título
    Dado que o usuário tenha uma descrição válida para a tarefa
    E que o usuário tenha uma prioridade válida para a tarefa
    Quando acessar o cadastro de tarefas
    E informar a descrição
    E informar a prioridade
    E deixar o título em branco
    E submeter o cadastro
    Então o sistema retornará o status 400
    E uma mensagem será apresentada dizendo que o título é obrigatório
    E nenhuma tarefa nova será criada

  # CT02 | Prioridade: Alta | Rastreabilidade: RN4
  Cenário: CT02 Validar que não é possível cadastrar uma tarefa com prazo anterior à data de criação
    Dado que o usuário tenha um título, uma descrição e uma prioridade válidos
    E que o usuário tenha um prazo no passado, como 01/01/2020
    Quando acessar o cadastro de tarefas
    E informar o título, a descrição e a prioridade
    E informar o prazo no passado
    E submeter o cadastro
    Então o sistema retornará o status 400
    E uma mensagem será apresentada dizendo que o prazo não pode ser anterior à data de criação
    E nenhuma tarefa nova será criada

  # CT03 | Prioridade: Alta | Rastreabilidade: RN4
  Cenário: CT03 Validar que é possível cadastrar uma tarefa com prazo para hoje
    Dado que o usuário tenha um título, uma descrição e uma prioridade válidos
    E que o usuário tenha um prazo igual à data de hoje
    Quando acessar o cadastro de tarefas
    E informar o título, a descrição e a prioridade
    E informar o prazo de hoje
    E submeter o cadastro
    Então o sistema retornará o status 201
    E a tarefa será criada com o prazo de hoje
    E a tarefa será criada com o status pendente

  # CT04 | Prioridade: Alta | Rastreabilidade: RN5
  Cenário: CT04 Validar que uma tarefa concluída não volta para pendente
    Dado que o usuário tenha uma tarefa com o status concluída
    Quando acessar a lista de tarefas
    E escolher a tarefa concluída
    E alterar o status para pendente
    Então o sistema retornará o status 409
    E uma mensagem será apresentada dizendo que uma tarefa concluída não pode voltar para pendente
    E a tarefa continuará com o status concluída

  # CT05 | Prioridade: Média | Rastreabilidade: RN7
  Cenário: CT05 Validar que o sistema informa quando a tarefa não for encontrada
    Dado que o usuário tenha um identificador que não exista no sistema
    Quando consultar a tarefa por esse identificador
    Então o sistema retornará o status 404
    E uma mensagem será apresentada dizendo Tarefa não encontrada

  # CT06 | Prioridade: Média | Rastreabilidade: RN6
  Cenário: CT06 Validar que é possível editar uma tarefa
    Dado que o usuário tenha uma tarefa cadastrada
    E que o usuário tenha um novo título, uma nova descrição e uma nova prioridade
    Quando acessar a lista de tarefas
    E escolher a tarefa
    E selecionar a opção de edição
    E informar o novo título, a nova descrição e a nova prioridade
    E submeter a edição
    Então o sistema retornará o status 200
    E a tarefa será apresentada com os dados novos
    E a data de atualização da tarefa será alterada

  # CT07 | Prioridade: Média | Rastreabilidade: Funcionalidade Exclusão
  Cenário: CT07 Validar que é possível excluir uma tarefa
    Dado que o usuário tenha uma tarefa cadastrada
    Quando acessar a lista de tarefas
    E escolher a tarefa
    E selecionar a opção de exclusão
    E confirmar a exclusão
    Então o sistema retornará o status 204
    E a tarefa não será mais apresentada na lista
    E ao consultar a tarefa excluída o sistema retornará o status 404

  # CT08A | Prioridade: Média | Rastreabilidade: Funcionalidade Pesquisa
  Cenário: CT08A Validar a pesquisa de tarefas por texto
    Dado que o usuário tenha a tarefa Revisar contrato do fornecedor cadastrada
    Quando acessar a lista de tarefas
    E pesquisar pelo texto contrato
    Então a lista apresentará a tarefa Revisar contrato do fornecedor
    E as tarefas que não contêm o texto não serão apresentadas

  # CT08B | Prioridade: Média | Rastreabilidade: Funcionalidade Pesquisa
  Cenário: CT08B Validar a pesquisa de tarefas por status
    Dado que o usuário tenha a tarefa Enviar relatório mensal com o status concluída
    Quando acessar a lista de tarefas
    E filtrar pelo status concluída
    Então a lista apresentará apenas tarefas com o status concluída
    E a tarefa Enviar relatório mensal será apresentada

  # CT08C | Prioridade: Média | Rastreabilidade: Funcionalidade Pesquisa
  Cenário: CT08C Validar a pesquisa de tarefas por prioridade
    Dado que o usuário tenha a tarefa Agendar consulta no dentista com a prioridade baixa
    Quando acessar a lista de tarefas
    E filtrar pela prioridade baixa
    Então a lista apresentará apenas tarefas com a prioridade baixa
    E a tarefa Agendar consulta no dentista será apresentada

  # CT09A | Prioridade: Alta | Rastreabilidade: RN2
  Cenário: CT09A Validar que não é possível cadastrar uma tarefa sem prioridade
    Dado que o usuário tenha um título e uma descrição válidos
    Quando acessar o cadastro de tarefas
    E informar o título e a descrição
    E enviar o cadastro sem informar a prioridade
    Então o sistema retornará o status 400
    E uma mensagem será apresentada dizendo que a prioridade é obrigatória
    E nenhuma tarefa nova será criada

  # CT09B | Prioridade: Alta | Rastreabilidade: RN1
  Cenário: CT09B Validar que não é possível cadastrar uma tarefa sem descrição
    Dado que o usuário tenha um título e uma prioridade válidos
    Quando acessar o cadastro de tarefas
    E informar o título e a prioridade
    E deixar a descrição em branco
    E submeter o cadastro
    Então o sistema retornará o status 400
    E uma mensagem será apresentada dizendo que a descrição é obrigatória
    E nenhuma tarefa nova será criada

  # CT10 | Prioridade: Alta | Rastreabilidade: RN5 e RN6
  Cenário: CT10 Validar que editar uma tarefa concluída não altera o seu status
    Dado que o usuário tenha uma tarefa com o status concluída
    E que o usuário tenha uma nova descrição para a tarefa
    Quando acessar a lista de tarefas
    E escolher a tarefa concluída
    E selecionar a opção de edição
    E alterar somente a descrição
    E submeter a edição
    Então o sistema retornará o status 200
    E a tarefa será apresentada com a nova descrição
    E a tarefa continuará com o status concluída
