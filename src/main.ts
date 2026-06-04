import * as readline from "readline"
import Aeronave from "./Aeronave"
import Funcionario from "./Funcionario"
import Peca from "./Peca"
import Etapa from "./Etapa"
import Teste from "./Teste"
import Relatorio from "./Relatorio"

import TipoAeronave from "./enum/TipoAeronave"
import TipoPeca from "./enum/TipoPeca"
import TipoTeste from "./enum/TipoTeste"
import StatusEtapa from "./enum/StatusEtapa"
import StatusPeca from "./enum/StatusPeca"
import NivelPermissao from "./enum/NivelPermissao"
import ResultadoTeste from "./enum/ResultadoTeste"


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

let usuarioLogado: Funcionario | null = null

function pergunta(texto: string): Promise<string> {
    return new Promise((resolve) => rl.question(texto, resolve))
}

function limpar() {
    console.clear()
}

function pausar(): Promise<void> {
    return new Promise((resolve) => rl.question("\nPressione ENTER para continuar...", () => resolve()))
}

async function login(): Promise<boolean> {
    limpar()
    console.log("╔══════════════════════════════════╗")
    console.log("║        AEROCODE - LOGIN           ║")
    console.log("╚══════════════════════════════════╝")
    const usuario = await pergunta("Usuário: ")
    const senha = await pergunta("Senha  : ")
    const func = Funcionario.buscarPorUsuario(usuario)
    if (func && func.autenticar(usuario, senha)) {
        usuarioLogado = func
        console.log(`\nBem-vindo, ${func.nome}! [${func.nivelPermissao}]`)
        await pausar()
        return true
    }
    console.log("\nUsuário ou senha inválidos.")
    await pausar()
    return false
}

function exigirPermissao(niveis: NivelPermissao[]): boolean {
    if (!usuarioLogado || !niveis.includes(usuarioLogado.nivelPermissao)) {
        console.log("\n⛔ Acesso negado. Permissão insuficiente.")
        return false
    }
    return true
}

// ─── AERONAVES ───────────────────────────────────────────────────────────────

async function menuAeronaves() {
    while (true) {
        limpar()
        console.log("╔══════════════════════════════════╗")
        console.log("║         GESTÃO DE AERONAVES       ║")
        console.log("╚══════════════════════════════════╝")
        console.log("1. Cadastrar aeronave")
        console.log("2. Listar aeronaves")
        console.log("3. Ver detalhes de uma aeronave")
        console.log("4. Editar aeronave")
        console.log("5. Excluir aeronave")
        console.log("0. Voltar")
        const op = await pergunta("\nOpção: ")

        if (op === "1") {
            if (!exigirPermissao([NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO])) {
                await pausar()
                continue
            }
            const codigo = await pergunta("Código: ")
            if (Aeronave.codigoExiste(codigo)) {
                console.log("Já existe uma aeronave com este código.")
                await pausar()
                continue
            }
            const modelo = await pergunta("Modelo: ")
            console.log("Tipo: 1-COMERCIAL  2-MILITAR")
            const tipoOp = await pergunta("Tipo: ")
            const tipo = tipoOp === "2" ? TipoAeronave.MILITAR : TipoAeronave.COMERCIAL
            const capacidade = parseInt(await pergunta("Capacidade (passageiros): "))
            const alcance = parseInt(await pergunta("Alcance (km): "))
            const aeronave = new Aeronave(codigo, modelo, tipo, capacidade, alcance)
            aeronave.salvar()
            console.log("✅ Aeronave cadastrada com sucesso!")
            await pausar()

        } else if (op === "2") {
            const aeronaves = Aeronave.carregarTodos()
            if (aeronaves.length === 0) {
                console.log("Nenhuma aeronave cadastrada.")
            } else {
                console.log("\n--- AERONAVES ---")
                aeronaves.forEach((a) =>
                    console.log(`[${a.codigo}] ${a.modelo} | ${a.tipo} | ${a.capacidade} pax | ${a.alcance} km`)
                )
            }
            await pausar()

        } else if (op === "3") {
            const codigo = await pergunta("Código da aeronave: ")
            const aeronave = Aeronave.buscarPorCodigo(codigo)
            if (!aeronave) {
                console.log("Aeronave não encontrada.")
            } else {
                aeronave.detalhar()
            }
            await pausar()

        } else if (op === "4") {
            // EDITAR
            if (!exigirPermissao([NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO])) {
                await pausar()
                continue
            }
            const codigo = await pergunta("Código da aeronave a editar: ")
            const aeronave = Aeronave.buscarPorCodigo(codigo)
            if (!aeronave) {
                console.log("Aeronave não encontrada.")
                await pausar()
                continue
            }
            console.log(`Modelo atual: ${aeronave.modelo} (deixe em branco para manter)`)
            const novoModelo = await pergunta("Novo modelo: ")
            if (novoModelo.trim()) aeronave.modelo = novoModelo.trim()

            console.log(`Tipo atual: ${aeronave.tipo}`)
            console.log("Tipo: 1-COMERCIAL  2-MILITAR  (deixe em branco para manter)")
            const tipoOp = await pergunta("Tipo: ")
            if (tipoOp === "1") aeronave.tipo = TipoAeronave.COMERCIAL
            else if (tipoOp === "2") aeronave.tipo = TipoAeronave.MILITAR

            console.log(`Capacidade atual: ${aeronave.capacidade} (deixe em branco para manter)`)
            const capStr = await pergunta("Nova capacidade: ")
            if (capStr.trim()) aeronave.capacidade = parseInt(capStr)

            console.log(`Alcance atual: ${aeronave.alcance} km (deixe em branco para manter)`)
            const alcStr = await pergunta("Novo alcance (km): ")
            if (alcStr.trim()) aeronave.alcance = parseInt(alcStr)

            aeronave.salvar()
            console.log("✅ Aeronave atualizada com sucesso!")
            await pausar()

        } else if (op === "5") {
            // EXCLUIR
            if (!exigirPermissao([NivelPermissao.ADMINISTRADOR])) {
                await pausar()
                continue
            }
            const codigo = await pergunta("Código da aeronave a excluir: ")
            const confirmacao = await pergunta(`⚠️  Confirma exclusão da aeronave "${codigo}"? (s/n): `)
            if (confirmacao.toLowerCase() === "s") {
                const ok = Aeronave.deletar(codigo)
                console.log(ok ? "✅ Aeronave excluída." : "Aeronave não encontrada.")
            } else {
                console.log("Operação cancelada.")
            }
            await pausar()

        } else if (op === "0") {
            break
        }
    }
}

// ─── PEÇAS ───────────────────────────────────────────────────────────────────

async function menuPecas() {
    while (true) {
        limpar()
        console.log("╔══════════════════════════════════╗")
        console.log("║           GESTÃO DE PEÇAS         ║")
        console.log("╚══════════════════════════════════╝")
        console.log("1. Adicionar peça a uma aeronave")
        console.log("2. Listar peças de uma aeronave")
        console.log("3. Atualizar status de uma peça")
        console.log("4. Editar peça")
        console.log("5. Remover peça")
        console.log("0. Voltar")
        const op = await pergunta("\nOpção: ")

        if (op === "1") {
            if (!exigirPermissao([NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO])) {
                await pausar()
                continue
            }
            const codigo = await pergunta("Código da aeronave: ")
            const aeronave = Aeronave.buscarPorCodigo(codigo)
            if (!aeronave) {
                console.log("Aeronave não encontrada.")
                await pausar()
                continue
            }
            const nome = await pergunta("Nome da peça: ")
            console.log("Tipo: 1-NACIONAL  2-IMPORTADA")
            const tipoOp = await pergunta("Tipo: ")
            const tipo = tipoOp === "2" ? TipoPeca.IMPORTADA : TipoPeca.NACIONAL
            const fornecedor = await pergunta("Fornecedor: ")
            console.log("Status: 1-EM_PRODUCAO  2-EM_TRANSPORTE  3-PRONTA")
            const statusOp = await pergunta("Status: ")
            const statusMap: { [k: string]: StatusPeca } = {
                "1": StatusPeca.EM_PRODUCAO,
                "2": StatusPeca.EM_TRANSPORTE,
                "3": StatusPeca.PRONTA,
            }
            const status = statusMap[statusOp] || StatusPeca.EM_PRODUCAO
            aeronave.pecas.push(new Peca(nome, tipo, fornecedor, status))
            aeronave.salvar()
            console.log("✅ Peça adicionada!")
            await pausar()

        } else if (op === "2") {
            const codigo = await pergunta("Código da aeronave: ")
            const aeronave = Aeronave.buscarPorCodigo(codigo)
            if (!aeronave) {
                console.log("Aeronave não encontrada.")
                await pausar()
                continue
            }
            if (aeronave.pecas.length === 0) {
                console.log("Nenhuma peça cadastrada para esta aeronave.")
            } else {
                console.log("\n--- PEÇAS ---")
                aeronave.pecas.forEach((p, i) =>
                    console.log(`${i + 1}. ${p.nome} | ${p.tipo} | ${p.fornecedor} | ${p.status}`)
                )
            }
            await pausar()

        } else if (op === "3") {
            if (!exigirPermissao([NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO, NivelPermissao.OPERADOR])) {
                await pausar()
                continue
            }
            const codigo = await pergunta("Código da aeronave: ")
            const aeronave = Aeronave.buscarPorCodigo(codigo)
            if (!aeronave) {
                console.log("Aeronave não encontrada.")
                await pausar()
                continue
            }
            aeronave.pecas.forEach((p, i) => console.log(`${i + 1}. ${p.nome} - ${p.status}`))
            const idx = parseInt(await pergunta("Número da peça: ")) - 1
            if (idx < 0 || idx >= aeronave.pecas.length) {
                console.log("Índice inválido.")
                await pausar()
                continue
            }
            console.log("Novo status: 1-EM_PRODUCAO  2-EM_TRANSPORTE  3-PRONTA")
            const statusOp = await pergunta("Status: ")
            const statusMap: { [k: string]: StatusPeca } = {
                "1": StatusPeca.EM_PRODUCAO,
                "2": StatusPeca.EM_TRANSPORTE,
                "3": StatusPeca.PRONTA,
            }
            aeronave.pecas[idx].atualizarStatus(statusMap[statusOp] || StatusPeca.EM_PRODUCAO)
            aeronave.salvar()
            await pausar()

        } else if (op === "4") {
            // EDITAR PEÇA
            if (!exigirPermissao([NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO])) {
                await pausar()
                continue
            }
            const codigo = await pergunta("Código da aeronave: ")
            const aeronave = Aeronave.buscarPorCodigo(codigo)
            if (!aeronave) {
                console.log("Aeronave não encontrada.")
                await pausar()
                continue
            }
            if (aeronave.pecas.length === 0) {
                console.log("Nenhuma peça cadastrada.")
                await pausar()
                continue
            }
            aeronave.pecas.forEach((p, i) => console.log(`${i + 1}. ${p.nome} | ${p.tipo} | ${p.fornecedor}`))
            const idx = parseInt(await pergunta("Número da peça a editar: ")) - 1
            if (idx < 0 || idx >= aeronave.pecas.length) {
                console.log("Índice inválido.")
                await pausar()
                continue
            }
            const peca = aeronave.pecas[idx]
            console.log(`Nome atual: ${peca.nome} (deixe em branco para manter)`)
            const novoNome = await pergunta("Novo nome: ")
            if (novoNome.trim()) peca.nome = novoNome.trim()

            console.log(`Fornecedor atual: ${peca.fornecedor} (deixe em branco para manter)`)
            const novoFornecedor = await pergunta("Novo fornecedor: ")
            if (novoFornecedor.trim()) peca.fornecedor = novoFornecedor.trim()

            console.log(`Tipo atual: ${peca.tipo}`)
            console.log("Tipo: 1-NACIONAL  2-IMPORTADA  (deixe em branco para manter)")
            const tipoOp = await pergunta("Tipo: ")
            if (tipoOp === "1") peca.tipo = TipoPeca.NACIONAL
            else if (tipoOp === "2") peca.tipo = TipoPeca.IMPORTADA

            aeronave.salvar()
            console.log("✅ Peça atualizada!")
            await pausar()

        } else if (op === "5") {
            // REMOVER PEÇA
            if (!exigirPermissao([NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO])) {
                await pausar()
                continue
            }
            const codigo = await pergunta("Código da aeronave: ")
            const aeronave = Aeronave.buscarPorCodigo(codigo)
            if (!aeronave) {
                console.log("Aeronave não encontrada.")
                await pausar()
                continue
            }
            if (aeronave.pecas.length === 0) {
                console.log("Nenhuma peça cadastrada.")
                await pausar()
                continue
            }
            aeronave.pecas.forEach((p, i) => console.log(`${i + 1}. ${p.nome}`))
            const idx = parseInt(await pergunta("Número da peça a remover: ")) - 1
            if (idx < 0 || idx >= aeronave.pecas.length) {
                console.log("Índice inválido.")
                await pausar()
                continue
            }
            const confirmacao = await pergunta(`⚠️  Confirma remoção da peça "${aeronave.pecas[idx].nome}"? (s/n): `)
            if (confirmacao.toLowerCase() === "s") {
                aeronave.pecas.splice(idx, 1)
                aeronave.salvar()
                console.log("✅ Peça removida.")
            } else {
                console.log("Operação cancelada.")
            }
            await pausar()

        } else if (op === "0") {
            break
        }
    }
}

// ─── ETAPAS ──────────────────────────────────────────────────────────────────

async function menuEtapas() {
  while (true) {
    limpar()
    console.log("╔══════════════════════════════════╗")
    console.log("║         GESTÃO DE ETAPAS          ║")
    console.log("╚══════════════════════════════════╝")
    console.log("1. Adicionar etapa a uma aeronave")
    console.log("2. Listar etapas de uma aeronave")
    console.log("3. Iniciar etapa")
    console.log("4. Finalizar etapa")
    console.log("5. Associar funcionário a uma etapa")
    console.log("6. Listar funcionários de uma etapa")
    console.log("7. Editar etapa")
    console.log("8. Remover etapa")
    console.log("0. Voltar")
    const op = await pergunta("\nOpção: ")

    if (op === "1") {
        if (!exigirPermissao([NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO])) {
            await pausar()
            continue
        }
        const codigo = await pergunta("Código da aeronave: ")
        const aeronave = Aeronave.buscarPorCodigo(codigo)
        if (!aeronave) {
            console.log("Aeronave não encontrada.")
            await pausar()
            continue
        }
        const nome = await pergunta("Nome da etapa: ")
        const prazo = await pergunta("Prazo (ex: 2025-12-31): ")

        // ── CORREÇÃO: exigir ao menos um funcionário responsável ──────────────
        const todosFuncionarios = Funcionario.carregarTodos()
        if (todosFuncionarios.length === 0) {
            console.log("⚠️  Não há funcionários cadastrados. Cadastre ao menos um funcionário antes de criar uma etapa.")
            await pausar()
            continue
        }
        console.log("\nSelecione o(s) funcionário(s) responsável(is) pela etapa.")
        console.log("(Uma etapa precisa de ao menos um responsável para ser criada.)\n")
        todosFuncionarios.forEach((f, i) => console.log(`${i + 1}. [${f.id}] ${f.nome} - ${f.nivelPermissao}`))
        
        const funcionariosSelecionados: Funcionario[] = []
        while (true) {
            const entrada = await pergunta(
                funcionariosSelecionados.length === 0
                    ? "Número do funcionário responsável: "
                    : "Adicionar outro funcionário? (número ou ENTER para finalizar): "
            )
            if (entrada.trim() === "" && funcionariosSelecionados.length > 0) break
            const fidx = parseInt(entrada) - 1
            if (isNaN(fidx) || fidx < 0 || fidx >= todosFuncionarios.length) {
                console.log("Índice inválido.")
                continue
            }
            const funcEscolhido = todosFuncionarios[fidx]
            if (funcionariosSelecionados.some((f) => f.id === funcEscolhido.id)) {
                console.log("Funcionário já adicionado.")
                continue
            }
            funcionariosSelecionados.push(funcEscolhido)
            console.log(`✔ ${funcEscolhido.nome} adicionado.`)
        }
        // ─────────────────────────────────────────────────────────────────────

        const novaEtapa = new Etapa(nome, prazo, StatusEtapa.PENDENTE, funcionariosSelecionados)
        aeronave.etapas.push(novaEtapa)
        aeronave.salvar()
        console.log(`✅ Etapa adicionada com ${funcionariosSelecionados.length} responsável(is)!`)
        await pausar()

    } else if (op === "2") {
        const codigo = await pergunta("Código da aeronave: ")
        const aeronave = Aeronave.buscarPorCodigo(codigo)
        if (!aeronave) {
            console.log("Aeronave não encontrada.")
            await pausar()
            continue
        }
        if (aeronave.etapas.length === 0) {
            console.log("Nenhuma etapa cadastrada.")
        } else {
            console.log("\n--- ETAPAS ---")
            aeronave.etapas.forEach((e, i) =>
                console.log(`${i + 1}. ${e.nome} | Prazo: ${e.prazo} | Status: ${e.status} | Responsáveis: ${e.funcionarios.length}`)
            )
        }
        await pausar()

    } else if (op === "3") {
        if (!exigirPermissao([NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO, NivelPermissao.OPERADOR])) {
            await pausar()
            continue
        }
        const codigo = await pergunta("Código da aeronave: ")
        const aeronave = Aeronave.buscarPorCodigo(codigo)
        if (!aeronave) {
            console.log("Aeronave não encontrada.")
            await pausar()
            continue
        }
        aeronave.etapas.forEach((e, i) => console.log(`${i + 1}. ${e.nome} - ${e.status}`))
        const idx = parseInt(await pergunta("Número da etapa: ")) - 1
        if (idx < 0 || idx >= aeronave.etapas.length) {
            console.log("Índice inválido.")
            await pausar()
            continue
        }
        // CORREÇÃO: bloquear início se não há responsável
        if (aeronave.etapas[idx].funcionarios.length === 0) {
            console.log("⚠️  Esta etapa não possui nenhum funcionário responsável. Associe ao menos um antes de iniciá-la.")
            await pausar()
            continue
        }
        aeronave.etapas[idx].iniciar()
        aeronave.salvar()
        await pausar()

    } else if (op === "4") {
        if (!exigirPermissao([NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO])) {
            await pausar()
            continue
        }
        const codigo = await pergunta("Código da aeronave: ")
        const aeronave = Aeronave.buscarPorCodigo(codigo)
        if (!aeronave) {
            console.log("Aeronave não encontrada.")
            await pausar()
            continue
        }
        aeronave.etapas.forEach((e, i) => console.log(`${i + 1}. ${e.nome} - ${e.status}`))
        const idx = parseInt(await pergunta("Número da etapa: ")) - 1
        if (idx < 0 || idx >= aeronave.etapas.length) {
            console.log("Índice inválido.")
            await pausar()
            continue
        }
        const anterior = idx > 0 ? aeronave.etapas[idx - 1] : undefined
        aeronave.etapas[idx].finalizar(anterior)
        aeronave.salvar()
        await pausar()

    } else if (op === "5") {
        if (!exigirPermissao([NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO])) {
            await pausar()
            continue
        }
        const codigo = await pergunta("Código da aeronave: ")
        const aeronave = Aeronave.buscarPorCodigo(codigo)
        if (!aeronave) {
            console.log("Aeronave não encontrada.")
            await pausar()
            continue
        }
        aeronave.etapas.forEach((e, i) => console.log(`${i + 1}. ${e.nome}`))
        const idx = parseInt(await pergunta("Número da etapa: ")) - 1
        if (idx < 0 || idx >= aeronave.etapas.length) {
            console.log("Índice inválido.")
            await pausar()
            continue
        }
        const funcionarios = Funcionario.carregarTodos()
        funcionarios.forEach((f, i) => console.log(`${i + 1}. [${f.id}] ${f.nome}`))
        const fidx = parseInt(await pergunta("Número do funcionário: ")) - 1
        if (fidx < 0 || fidx >= funcionarios.length) {
            console.log("Índice inválido.")
            await pausar()
            continue
        }
        aeronave.etapas[idx].associarFuncionario(funcionarios[fidx])
        aeronave.salvar()
        await pausar()

    } else if (op === "6") {
        const codigo = await pergunta("Código da aeronave: ")
        const aeronave = Aeronave.buscarPorCodigo(codigo)
        if (!aeronave) {
            console.log("Aeronave não encontrada.")
            await pausar()
            continue
        }
        aeronave.etapas.forEach((e, i) => console.log(`${i + 1}. ${e.nome}`))
        const idx = parseInt(await pergunta("Número da etapa: ")) - 1
        if (idx < 0 || idx >= aeronave.etapas.length) {
            console.log("Índice inválido.")
            await pausar()
            continue
        }
        const lista = aeronave.etapas[idx].listarFuncionarios()
        if (lista.length === 0) {
            console.log("Nenhum funcionário associado.")
        } else {
            lista.forEach((f) => console.log(`- ${f.nome} [${f.nivelPermissao}]`))
        }
        await pausar()

    } else if (op === "7") {
        // EDITAR ETAPA
        if (!exigirPermissao([NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO])) {
            await pausar()
            continue
        }
        const codigo = await pergunta("Código da aeronave: ")
        const aeronave = Aeronave.buscarPorCodigo(codigo)
        if (!aeronave) {
            console.log("Aeronave não encontrada.")
            await pausar()
            continue
        }
        if (aeronave.etapas.length === 0) {
            console.log("Nenhuma etapa cadastrada.")
            await pausar()
            continue
        }
        aeronave.etapas.forEach((e, i) => console.log(`${i + 1}. ${e.nome} | Prazo: ${e.prazo}`))
        const idx = parseInt(await pergunta("Número da etapa a editar: ")) - 1
        if (idx < 0 || idx >= aeronave.etapas.length) {
            console.log("Índice inválido.")
            await pausar()
            continue
        }
        const etapa = aeronave.etapas[idx]
        console.log(`Nome atual: ${etapa.nome} (deixe em branco para manter)`)
        const novoNome = await pergunta("Novo nome: ")
        if (novoNome.trim()) etapa.nome = novoNome.trim()

        console.log(`Prazo atual: ${etapa.prazo} (deixe em branco para manter)`)
        const novoPrazo = await pergunta("Novo prazo (ex: 2025-12-31): ")
        if (novoPrazo.trim()) etapa.prazo = novoPrazo.trim()

        aeronave.salvar()
        console.log("✅ Etapa atualizada!")
        await pausar()

    } else if (op === "8") {
        // REMOVER ETAPA
        if (!exigirPermissao([NivelPermissao.ADMINISTRADOR])) {
            await pausar()
            continue
        }
        const codigo = await pergunta("Código da aeronave: ")
        const aeronave = Aeronave.buscarPorCodigo(codigo)
        if (!aeronave) {
            console.log("Aeronave não encontrada.")
            await pausar()
            continue
        }
        if (aeronave.etapas.length === 0) {
            console.log("Nenhuma etapa cadastrada.")
            await pausar()
            continue
        }
        aeronave.etapas.forEach((e, i) => console.log(`${i + 1}. ${e.nome} - ${e.status}`))
        const idx = parseInt(await pergunta("Número da etapa a remover: ")) - 1
        if (idx < 0 || idx >= aeronave.etapas.length) {
            console.log("Índice inválido.")
            await pausar()
            continue
        }
        if (aeronave.etapas[idx].status !== StatusEtapa.PENDENTE) {
            console.log("⚠️  Só é possível remover etapas com status PENDENTE.")
            await pausar()
            continue
        }
        const confirmacao = await pergunta(`⚠️  Confirma remoção da etapa "${aeronave.etapas[idx].nome}"? (s/n): `)
        if (confirmacao.toLowerCase() === "s") {
            aeronave.etapas.splice(idx, 1)
            aeronave.salvar()
            console.log("✅ Etapa removida.")
        } else {
            console.log("Operação cancelada.")
        }
        await pausar()

    } else if (op === "0") {
        break
    }
  }
}

// ─── TESTES ──────────────────────────────────────────────────────────────────

async function menuTestes() {
    while (true) {
        limpar()
        console.log("╔══════════════════════════════════╗")
        console.log("║          GESTÃO DE TESTES         ║")
        console.log("╚══════════════════════════════════╝")
        console.log("1. Registrar teste em uma aeronave")
        console.log("2. Listar testes de uma aeronave")
        console.log("3. Editar resultado de um teste")
        console.log("4. Remover teste")
        console.log("0. Voltar")
        const op = await pergunta("\nOpção: ")

        if (op === "1") {
            if (!exigirPermissao([NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO])) {
                await pausar()
                continue
            }
            const codigo = await pergunta("Código da aeronave: ")
            const aeronave = Aeronave.buscarPorCodigo(codigo)
            if (!aeronave) {
                console.log("Aeronave não encontrada.")
                await pausar()
                continue
            }
            console.log("Tipo: 1-ELETRICO  2-HIDRAULICO  3-AERODINAMICO")
            const tipoOp = await pergunta("Tipo: ")
            const tipoMap: { [k: string]: TipoTeste } = {
                "1": TipoTeste.ELETRICO,
                "2": TipoTeste.HIDRAULICO,
                "3": TipoTeste.AERODINAMICO,
            }
            const tipo = tipoMap[tipoOp] || TipoTeste.ELETRICO
            console.log("Resultado: 1-APROVADO  2-REPROVADO")
            const resOp = await pergunta("Resultado: ")
            const resultado = resOp === "2" ? ResultadoTeste.REPROVADO : ResultadoTeste.APROVADO
            aeronave.testes.push(new Teste(tipo, resultado))
            aeronave.salvar()
            console.log("✅ Teste registrado!")
            await pausar()

        } else if (op === "2") {
            const codigo = await pergunta("Código da aeronave: ")
            const aeronave = Aeronave.buscarPorCodigo(codigo)
            if (!aeronave) {
                console.log("Aeronave não encontrada.")
                await pausar()
                continue
            }
            if (aeronave.testes.length === 0) {
                console.log("Nenhum teste registrado.")
            } else {
                aeronave.testes.forEach((t, i) =>
                    console.log(`${i + 1}. ${t.tipo} | ${t.resultado}`)
                )
            }
            await pausar()

        } else if (op === "3") {
            // EDITAR RESULTADO DE TESTE
            if (!exigirPermissao([NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO])) {
                await pausar()
                continue
            }
            const codigo = await pergunta("Código da aeronave: ")
            const aeronave = Aeronave.buscarPorCodigo(codigo)
            if (!aeronave) {
                console.log("Aeronave não encontrada.")
                await pausar()
                continue
            }
            if (aeronave.testes.length === 0) {
                console.log("Nenhum teste registrado.")
                await pausar()
                continue
            }
            aeronave.testes.forEach((t, i) => console.log(`${i + 1}. ${t.tipo} | ${t.resultado}`))
            const idx = parseInt(await pergunta("Número do teste a editar: ")) - 1
            if (idx < 0 || idx >= aeronave.testes.length) {
                console.log("Índice inválido.")
                await pausar()
                continue
            }
            console.log("Novo resultado: 1-APROVADO  2-REPROVADO")
            const resOp = await pergunta("Resultado: ")
            aeronave.testes[idx].resultado = resOp === "2" ? ResultadoTeste.REPROVADO : ResultadoTeste.APROVADO
            aeronave.salvar()
            console.log("✅ Resultado atualizado!")
            await pausar()

        } else if (op === "4") {
            // REMOVER TESTE
            if (!exigirPermissao([NivelPermissao.ADMINISTRADOR])) {
                await pausar()
                continue
            }
            const codigo = await pergunta("Código da aeronave: ")
            const aeronave = Aeronave.buscarPorCodigo(codigo)
            if (!aeronave) {
                console.log("Aeronave não encontrada.")
                await pausar()
                continue
            }
            if (aeronave.testes.length === 0) {
                console.log("Nenhum teste registrado.")
                await pausar()
                continue
            }
            aeronave.testes.forEach((t, i) => console.log(`${i + 1}. ${t.tipo} | ${t.resultado}`))
            const idx = parseInt(await pergunta("Número do teste a remover: ")) - 1
            if (idx < 0 || idx >= aeronave.testes.length) {
                console.log("Índice inválido.")
                await pausar()
                continue
            }
            const confirmacao = await pergunta(`⚠️  Confirma remoção do teste "${aeronave.testes[idx].tipo}"? (s/n): `)
            if (confirmacao.toLowerCase() === "s") {
                aeronave.testes.splice(idx, 1)
                aeronave.salvar()
                console.log("✅ Teste removido.")
            } else {
                console.log("Operação cancelada.")
            }
            await pausar()

        } else if (op === "0") {
            break
        }
    }
}

// ─── FUNCIONÁRIOS ─────────────────────────────────────────────────────────────

async function menuFuncionarios() {
    while (true) {
        limpar()
        console.log("╔══════════════════════════════════╗")
        console.log("║       GESTÃO DE FUNCIONÁRIOS      ║")
        console.log("╚══════════════════════════════════╝")
        console.log("1. Cadastrar funcionário")
        console.log("2. Listar funcionários")
        console.log("3. Editar funcionário")
        console.log("4. Excluir funcionário")
        console.log("0. Voltar")
        const op = await pergunta("\nOpção: ")

        if (op === "1") {
            if (!exigirPermissao([NivelPermissao.ADMINISTRADOR])) {
                await pausar()
                continue
            }
            const id = await pergunta("ID único: ")
            const existentes = Funcionario.carregarTodos()
            if (existentes.some((f) => f.id === id)) {
                console.log("Já existe um funcionário com este ID.")
                await pausar()
                continue
            }
            const nome = await pergunta("Nome: ")
            const telefone = await pergunta("Telefone: ")
            const endereco = await pergunta("Endereço: ")
            const usuario = await pergunta("Usuário (login): ")
            const senha = await pergunta("Senha: ")
            console.log("Permissão: 1-ADMINISTRADOR  2-ENGENHEIRO  3-OPERADOR")
            const nivelOp = await pergunta("Nível: ")
            const nivelMap: { [k: string]: NivelPermissao } = {
                "1": NivelPermissao.ADMINISTRADOR,
                "2": NivelPermissao.ENGENHEIRO,
                "3": NivelPermissao.OPERADOR,
            }
            const nivelPermissao = nivelMap[nivelOp] || NivelPermissao.OPERADOR
            const func = new Funcionario(id, nome, telefone, endereco, usuario, senha, nivelPermissao)
            func.salvar()
            console.log("✅ Funcionário cadastrado!")
            await pausar()

        } else if (op === "2") {
            const funcionarios = Funcionario.carregarTodos()
            if (funcionarios.length === 0) {
                console.log("Nenhum funcionário cadastrado.")
            } else {
                console.log("\n--- FUNCIONÁRIOS ---")
                funcionarios.forEach((f) =>
                    console.log(`[${f.id}] ${f.nome} | ${f.telefone} | ${f.nivelPermissao}`)
                )
            }
            await pausar()

        } else if (op === "3") {
            // EDITAR FUNCIONÁRIO
            if (!exigirPermissao([NivelPermissao.ADMINISTRADOR])) {
                await pausar()
                continue
            }
            const id = await pergunta("ID do funcionário a editar: ")
            const todos = Funcionario.carregarTodos()
            const func = todos.find((f) => f.id === id)
            if (!func) {
                console.log("Funcionário não encontrado.")
                await pausar()
                continue
            }
            console.log(`Nome atual: ${func.nome} (deixe em branco para manter)`)
            const novoNome = await pergunta("Novo nome: ")
            if (novoNome.trim()) func.nome = novoNome.trim()

            console.log(`Telefone atual: ${func.telefone} (deixe em branco para manter)`)
            const novoTelefone = await pergunta("Novo telefone: ")
            if (novoTelefone.trim()) func.telefone = novoTelefone.trim()

            console.log(`Endereço atual: ${func.endereco} (deixe em branco para manter)`)
            const novoEndereco = await pergunta("Novo endereço: ")
            if (novoEndereco.trim()) func.endereco = novoEndereco.trim()

            console.log(`Nível atual: ${func.nivelPermissao}`)
            console.log("Permissão: 1-ADMINISTRADOR  2-ENGENHEIRO  3-OPERADOR  (deixe em branco para manter)")
            const nivelOp = await pergunta("Nível: ")
            const nivelMap: { [k: string]: NivelPermissao } = {
                "1": NivelPermissao.ADMINISTRADOR,
                "2": NivelPermissao.ENGENHEIRO,
                "3": NivelPermissao.OPERADOR,
            }
            if (nivelMap[nivelOp]) func.nivelPermissao = nivelMap[nivelOp]

            func.salvar()
            console.log("✅ Funcionário atualizado!")
            await pausar()

        } else if (op === "4") {
            // EXCLUIR FUNCIONÁRIO
            if (!exigirPermissao([NivelPermissao.ADMINISTRADOR])) {
                await pausar()
                continue
            }
            const id = await pergunta("ID do funcionário a excluir: ")
            if (usuarioLogado && usuarioLogado.id === id) {
                console.log("⚠️  Você não pode excluir o próprio usuário logado.")
                await pausar()
                continue
            }
            const confirmacao = await pergunta(`⚠️  Confirma exclusão do funcionário ID "${id}"? (s/n): `)
            if (confirmacao.toLowerCase() === "s") {
                const ok = Funcionario.deletar(id)
                console.log(ok ? "✅ Funcionário excluído." : "Funcionário não encontrado.")
            } else {
                console.log("Operação cancelada.")
            }
            await pausar()

        } else if (op === "0") {
            break
        }
    }
}

// ─── RELATÓRIO ────────────────────────────────────────────────────────────────

async function menuRelatorio() {
    limpar()
    console.log("╔══════════════════════════════════╗")
    console.log("║       GERAR RELATÓRIO FINAL       ║")
    console.log("╚══════════════════════════════════╝")
    if (!exigirPermissao([NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO])) {
        await pausar()
        return
    }
    const codigo = await pergunta("Código da aeronave: ")
    const aeronave = Aeronave.buscarPorCodigo(codigo)
    if (!aeronave) {
        console.log("Aeronave não encontrada.")
        await pausar()
        return
    }
    const cliente = await pergunta("Nome do cliente: ")
    const dataEntrega = await pergunta("Data de entrega (ex: 2025-12-31): ")
    const relatorio = new Relatorio()
    const conteudo = relatorio.gerarRelatorio(aeronave, cliente, dataEntrega)
    console.log("\n" + conteudo)
    const nomeArquivo = `relatorio_${aeronave.codigo}_${Date.now()}.txt`
    relatorio.salvarEmArquivo(conteudo, nomeArquivo)
    await pausar()
}

// ─── MENU PRINCIPAL ───────────────────────────────────────────────────────────

async function menuPrincipal() {
    while (true) {
        limpar()
        console.log("╔══════════════════════════════════════════╗")
        console.log("║     AEROCODE - Sistema de Gestão          ║")
        console.log("║     Produção de Aeronaves v1.0            ║")
        console.log(`║     Logado: ${(usuarioLogado?.nome || "").padEnd(28)}║`)
        console.log("╚══════════════════════════════════════════╝")
        console.log("1. Aeronaves")
        console.log("2. Peças")
        console.log("3. Etapas de Produção")
        console.log("4. Testes")
        console.log("5. Funcionários")
        console.log("6. Gerar Relatório Final")
        console.log("0. Sair")
        const op = await pergunta("\nOpção: ")

        if (op === "1") await menuAeronaves()
        else if (op === "2") await menuPecas()
        else if (op === "3") await menuEtapas()
        else if (op === "4") await menuTestes()
        else if (op === "5") await menuFuncionarios()
        else if (op === "6") await menuRelatorio()
        else if (op === "0") {
            console.log("Encerrando o sistema. Até logo!")
            rl.close()
            process.exit(0)
        }
    }
}

// ─── INICIALIZAÇÃO ────────────────────────────────────────────────────────────

async function iniciar() {
    const funcionarios = Funcionario.carregarTodos()
    if (funcionarios.length === 0) {
        const admin = new Funcionario(
            "0001",
            "Administrador",
            "(00) 00000-0000",
            "Aerocode HQ",
            "admin",
            "admin123",
            NivelPermissao.ADMINISTRADOR
        )
        admin.salvar()
        console.log("Primeiro acesso detectado. Usuário padrão criado:")
        console.log("  Login: admin | Senha: admin123")
        await pausar()
    }

    let autenticado = false
    while (!autenticado) {
        autenticado = await login()
    }

    await menuPrincipal()
}

iniciar()