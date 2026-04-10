import * as fs from "fs"
import * as path from "path"
import Aeronave from "./Aeronave"

export default class Relatorio {
    gerarRelatorio(aeronave: Aeronave, cliente: string, dataEntrega: string): string {
    const linhas: string[] = []
    linhas.push("=".repeat(60))
    linhas.push("RELATÓRIO FINAL DE AERONAVE - AEROCODE")
    linhas.push("=".repeat(60))
    linhas.push(`Data de Entrega: ${dataEntrega}`)
    linhas.push(`Cliente: ${cliente}`)
    linhas.push("-".repeat(60))
    linhas.push("DADOS DA AERONAVE:")
    linhas.push(`Código: ${aeronave.codigo}`)
    linhas.push(`Modelo: ${aeronave.modelo}`)
    linhas.push(`Tipo: ${aeronave.tipo}`)
    linhas.push(`Capacidade: ${aeronave.capacidade} passageiros`)
    linhas.push(`Alcance: ${aeronave.alcance} km`)
    linhas.push("-".repeat(60))
    linhas.push("PEÇAS UTILIZADAS:")
    if (aeronave.pecas.length === 0) {
      linhas.push("Nenhuma peça registrada.")
    }
    else {
      aeronave.pecas.forEach((p, i) => {
        linhas.push(
          `  ${i + 1}. ${p.nome} | Tipo: ${p.tipo} | Fornecedor: ${p.fornecedor} | Status: ${p.status}`
        )
      })
    }
    linhas.push("-".repeat(60))
    linhas.push("ETAPAS DE PRODUÇÃO:")
    if (aeronave.etapas.length === 0) {
      linhas.push("Nenhuma etapa registrada.")
    }
    else {
      aeronave.etapas.forEach((e, i) => {
        linhas.push(
          `  ${i + 1}. ${e.nome} | Prazo: ${e.prazo} | Status: ${e.status}`
        )
        if (e.funcionarios.length > 0) {
          const nomes = e.funcionarios.map((f) => f.nome).join(", ")
          linhas.push(`Responsáveis: ${nomes}`)
        }
      })
    }
    linhas.push("-".repeat(60))
    linhas.push("RESULTADOS DOS TESTES:")
    if (aeronave.testes.length === 0) {
      linhas.push("Nenhum teste registrado.")
    } else {
      aeronave.testes.forEach((t, i) => {
        linhas.push(`  ${i + 1}. Tipo: ${t.tipo} | Resultado: ${t.resultado}`)
      })
    }
    linhas.push("=".repeat(60))

    return linhas.join("\n")
  }

  salvarEmArquivo(conteudo: string, nomeArquivo: string): void {
    const dir = path.join(__dirname, "../relatorios")
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    const caminho = path.join(dir, nomeArquivo)
    fs.writeFileSync(caminho, conteudo, "utf-8")
    console.log(`Relatório salvo em: ${caminho}`)
  }
}